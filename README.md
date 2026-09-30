# CT Forma Fit: landing page e painel

Site de **www.ctformafit.com.br**, feito em Next.js e hospedado na Vercel, com banco no Supabase.

| Rota | O que é |
|---|---|
| `/` | Landing principal (SEO). Todos os botões abrem o WhatsApp com a mensagem de cada botão. |
| `/captura` | Mesma landing para anúncios (não indexada). Os botões levam ao agendamento de visita. |
| `/captura/agendar` | Agendamento em 2 etapas. Salva nome e WhatsApp **enquanto a pessoa digita** e, ao confirmar, abre o WhatsApp. |
| `/admin` | Painel: analytics, leads, agenda, WhatsApp, pixels/CRM e administradores. |
| `/privacidade` | Política de privacidade (LGPD). |

---

## Publicação

O passo a passo completo (Supabase, GitHub, Vercel, domínio, primeiro acesso e testes) está em **[HOSPEDAGEM.md](HOSPEDAGEM.md)**.

## Envio automático ao EVX CRM

- **Agendamento confirmado** vai ao CRM na hora, com as etiquetas de "Visita agendada".
- **Quem digitou nome e WhatsApp e não confirmou** vai depois do tempo de espera configurado (padrão: 15 minutos), com a etiqueta "Agendamento incompleto".
- Falhas temporárias (429/500) são reenviadas sozinhas: 1, 5, 15, 60 e 240 minutos.
- Em **Leads** há o status de cada envio e o botão **Reenviar ao CRM**.

A fila roda sozinha com o tráfego do site e uma vez por dia pelo Vercel Cron. **Recomendado:** para ela rodar a cada 5 minutos, ative o agendador do Supabase conforme o Passo 7 do HOSPEDAGEM.md (extensões `pg_cron` e `pg_net`).

## Pixels e conversões

No painel, em **Pixels e CRM**:

- **Meta:** ID do Pixel + token da API de Conversões. Eventos: `PageView`, `Contact` (clique no WhatsApp), `Lead` (nome e WhatsApp válidos) e `Schedule` (agendamento). Navegador e servidor usam o mesmo `event_id`, então a Meta não conta em dobro.
- **Google:** GA4, Google Ads (com rótulos de conversão) e, opcionalmente, o Tag Manager. Com a chave do Measurement Protocol, `generate_lead` e `schedule_visit` são enviados pelo servidor.

Dica para anúncios: use sempre UTMs nos links (`?utm_source=instagram&utm_medium=cpc&utm_campaign=nome`). Elas aparecem no painel, na tabela de leads e no CRM.

## Rodar no computador

```bash
npm install
cp .env.example .env.local   # preencha os valores
npm run dev                  # http://localhost:3000
```

## Onde editar

- Textos da landing: `components/landing/content.ts` (depoimentos, FAQ, diferenciais) e os componentes em `components/landing/`.
- Fotos: `public/images/`.
- Regras da agenda: no painel, em **Agenda**. A lógica fica em `lib/schedule.ts`.
