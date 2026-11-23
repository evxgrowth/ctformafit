# CT Forma Fit: documentação técnica da landing page

Site de **www.ctformafit.com.br**. Next.js 15 (App Router) + React 19 + Tailwind 4, hospedado na Vercel, banco no Supabase compartilhado `landing-pages` (tabelas com prefixo `ctf_`). Os leads vão para o **EVX CRM** (repo `evxgrowth/evx-ignite-flow`).

Atualizado em 23/11/2026 (campanha Black Friday 26). Publicação e domínio: [`HOSPEDAGEM.md`](../HOSPEDAGEM.md). Visão de uso: [`README.md`](../README.md).

## 1. Rotas

| Rota | Função |
|---|---|
| `/` | Landing principal (SEO). Botões abrem o WhatsApp. |
| `/captura`, `/captura/agendar`, `/captura/agendou` | Landing de anúncios, agendamento de visita e confirmação. |
| `/black26`, `/black26/agendar`, `/black26/agendou` | **Campanha Black Friday 26** (não indexada): landing, formulário e confirmação com o voucher. |
| `/admin/*` | Painel (analytics, leads, agenda, botões, WhatsApp, pixels/CRM, usuários). |
| `/api/leads/draft` | Salva o lead enquanto a pessoa digita (e ao fechar a aba). |
| `/api/leads/confirm` | Confirma o agendamento, grava e envia ao CRM e aos pixels. |
| `/api/availability?campaign=` | Dias e horários livres. Com `campaign=black26` só devolve dias até `lastDay`. |
| `/api/cron/crm-sync` | Fila de reenvio ao CRM (Supabase `pg_cron` a cada 5 min; Vercel Cron 1x/dia). |
| `/api/track` | Eventos internos (analytics do painel). |

## 2. Campanha Black Friday 26

Tudo da campanha está em `lib/campaigns.ts` (um único lugar):

- `CAMPAIGNS.black26`: rótulo, plano, observação gravada no lead, mensagem do WhatsApp, evento do pixel e **`lastDay`** (`2026-11-29`, último dia de aula com voucher).
- `BLACK_PLAN`: preço (R$ 139,90/mês, de R$ 183), parcelas, código `BLACK26`, validade e passos exibidos no card do voucher.
- Textos dos botões: `BLACK_TEXT` em `components/CtaButton.tsx`.
- Perguntas frequentes da campanha: `BLACK_FAQ` em `components/landing/Faq.tsx`.
- Imagem do voucher: `public/black26/voucher-black26.png` (e `.jpg`), 1200x800. É a **mesma imagem** usada no topo do modelo oficial da Meta e na página de confirmação.
- Vídeo de fundo do topo: `public/black26/fundo.mp4`.

**Mudou o preço ou a validade?** Edite `BLACK_PLAN` e `CAMPAIGNS.black26` (inclui `lastDay`), regenere a imagem do voucher e **substitua o modelo da Meta** (o texto do voucher fica dentro dele). Os textos dos modelos citam "R$ 139,90" e "29/11".

### Fluxo ponta a ponta

```
Anúncio → /black26 → /black26/agendar (dados → dia e hora)
  ├─ ao digitar: /api/leads/draft → ctf_leads (completed=false)
  ├─ fechou a aba sem concluir: envio "incompleto" ao CRM
  └─ confirmar: /api/leads/confirm → ctf_leads (completed=true, visit_at)
        ├─ EVX CRM (landing-lead): lead, etiquetas, fase, agenda e fluxos
        ├─ Meta CAPI / GA4: Lead, Schedule
        └─ /black26/agendou: mostra o voucher + abre o WhatsApp da equipe
EVX CRM → WhatsApp (API oficial):
  1. na hora: modelo com a imagem do voucher
  2. 2h antes da aula: lembrete
  3. 2h depois da aula: "como foi? fechou o plano?"
```

## 3. Envio ao EVX CRM (`lib/crm.ts`)

`POST` em `https://tyrdllhgrojmpvodbrth.supabase.co/functions/v1/landing-lead` com `Authorization: Bearer <token da integração "LP CT Geral">`. O token fica no painel (**Pixels e CRM**) ou na variável `EVX_CRM_TOKEN`; se existir nos dois, vale o do painel.

Corpo enviado (resumo): `name`, `phone`, `email`, `tags`, `interest`, `message`, `utm_*` e `extra`:

| `extra` | Valor na Black |
|---|---|
| `agendamento_status` | `agendado` ou `incompleto` |
| `campanha` | `Black Friday 26` |
| `plano` | `Plano Anual Musculação + Hyrox` |
| `visita_data` / `visita_hora` | `AAAA-MM-DD` / `HH:00` |
| `pagina_origem` | `/black26` |

- Etiquetas da Black (`settings.crm.black`): `Black Friday` + `Landing Page` (+ `Agendamento incompleto` quando não confirmou).
- O CRM ignora o mesmo telefone com o mesmo conteúdo por 10 min. Se a etapa mudou (incompleto → agendado) o site reenvia sozinho depois de 11 min.
- Falhas 429/5xx: novas tentativas em 1, 5, 15, 60 e 240 min (até 6). Status por lead em **Leads** (botão **Reenviar ao CRM**).

### O que o CRM faz com o envio (configurado na empresa CT, não no código)

Regras de recebimento da integração "LP CT Geral" (CRM > Configurações > Integrações > Landing pages):

1. **Black Friday 26 · agendou**: etiquetas e inicia o fluxo da confirmação com o voucher.
2. **Black Friday 26 · incompleto**: inicia o fluxo de cadastro incompleto.
3. **Visita agendada**: move o card para "Aula Experimental Agendada" e cria o compromisso na agenda (data e hora de `visita_data`/`visita_hora`).
4. **Agendamento incompleto**: card em "Novo Lead" com a etiqueta "Cadastro incompleto".

Os lembretes (2h antes) e o pós-aula (2h depois) são **esperas do fluxo no CRM** (`wait_appointment`), contadas a partir do horário do compromisso. Detalhes do motor em `evx-ignite-flow/docs/tecnico/06-whatsapp-campanhas-fluxos-ia.md`.

### Modelos oficiais da Meta (conta do CT)

| Modelo | Categoria | Quando | Conteúdo |
|---|---|---|---|
| `ctf_black26_voucher` | Marketing | Na hora do agendamento | Imagem do voucher + data/hora + botões Confirmar presença / Preciso remarcar |
| `ctf_black26_lembrete_2h` | Utilidade | 2h antes | Lembrete + "mostre o voucher" + Estou a caminho / Preciso remarcar |
| `ctf_black26_pos_aula` | Utilidade | 2h depois | "Como foi? Fechou o plano?" + Já fechei / Quero fechar agora / Não consegui ir |

Variáveis: `{{primeiro_nome}}`, `{{data_agenda}}`, `{{hora_agenda}}`. A Meta pode reclassificar a categoria.

## 4. Agenda

- `lib/schedule.ts`: dias abertos, horários, feriados e antecedência mínima (`min_lead_minutes`, hoje 60). Regras e bloqueios no painel, em **Agenda**.
- Campanha com prazo: `/api/availability?campaign=black26` e `/api/leads/confirm` recusam datas depois de `CAMPAIGNS.black26.lastDay`.
- Hoje só abrem segunda a sexta. Para aula no sábado (28/11) abra o dia em **Agenda** (liberação por data).
- **Lembrete 2h antes:** quem agenda com menos de 2h de antecedência recebe o lembrete logo depois da confirmação.

## 5. Banco (`ctf_*`)

Migrations em `supabase/migrations/`. Tabela principal `ctf_leads`: dados do lead, `campaign`, `notes`, `visit_date`, `visit_hour`, `visit_at`, UTMs, `fbp/fbc`, e o estado do envio ao CRM (`crm_status`, `crm_stage`, `crm_attempts`, `crm_next_try_at`, `crm_lead_id`). Eventos em `ctf_events`; configurações em `ctf_settings`.

## 6. Pixels e conversões

`lib/client-track.ts` (navegador) e `lib/conversions.ts` (servidor, mesmo `event_id`). Eventos: `PageView`, `Contact`, `Lead`, `Schedule` e o evento personalizado da campanha (`FormularioBlack26`).

## 7. Variáveis de ambiente

`NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `AUTH_SECRET`, `CRON_SECRET`, `EVX_CRM_TOKEN` (opcional), `NEXT_PUBLIC_SITE_URL`. Modelo em `.env.example`. Nunca coloque valores no código.

## 8. Rodar, testar e publicar

```bash
npm ci
cp .env.example .env.local
npm run dev        # http://localhost:3000
npx tsc --noEmit   # checagem de tipos
npm run build
```

- A branch `main` publica sozinha na Vercel. Mudanças da campanha vão por branch e **prévia da Vercel** antes do merge.
- **Teste de ponta a ponta:** agende pela `/black26/agendar` com um número interno autorizado (nunca com um cliente) e confira, nesta ordem: lead no painel (**Leads**) → card no CRM com a etiqueta Black Friday e fase "Aula Experimental Agendada" → compromisso na agenda → mensagem do voucher no WhatsApp → lembrete e pós-aula nos horários.
- Arquivos do repositório usam fim de linha CRLF; mantenha ao editar.

## 9. Checklist para uma nova campanha

1. Adicionar a campanha em `lib/campaigns.ts` (`CampaignId`, `CAMPAIGNS`, plano).
2. Criar as rotas `/<campanha>`, `/<campanha>/agendar` e `/<campanha>/agendou`.
3. No CRM: etiquetas, regras da integração, fluxo e modelos da Meta.
4. Gerar a imagem do voucher/oferta e subir em `public/<campanha>/`.
5. Testar o fluxo inteiro e atualizar este documento.
