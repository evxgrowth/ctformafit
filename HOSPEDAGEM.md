# Como colocar o site do CT Forma Fit no ar

Passo a passo para publicar em **www.ctformafit.com.br** usando Supabase (banco de dados), GitHub (código) e Vercel (hospedagem). Siga na ordem. Leva de 30 a 60 minutos, mais o tempo de propagação do domínio.

**Antes de começar, tenha em mãos:**
- Uma conta no **GitHub** (https://github.com)
- Uma conta no **Supabase** (https://supabase.com), dá para entrar com o GitHub
- Uma conta na **Vercel** (https://vercel.com), entre com o GitHub
- O acesso ao lugar onde o domínio foi comprado (se é `.com.br`, quase sempre é o **Registro.br**)
- O **token da integração do EVX CRM** (EVX > Configurações > Integrações > Landing pages > Nova landing page)

> **Plano da Vercel:** o plano gratuito (Hobby) é para uso pessoal, não comercial. Para o site de um cliente, o correto pelos termos da Vercel é o plano **Pro** (US$ 20/mês por membro). Dá para publicar e testar no Hobby e trocar de plano depois.

---

## Passo 1: Banco de dados (Supabase)

1. Entre no Supabase e clique em **New project**.
2. Preencha:
   - **Name:** `ctformafit`
   - **Database password:** clique em *Generate a password* e guarde num local seguro
   - **Region:** **South America (São Paulo)**
3. Clique em **Create new project** e espere uns 2 minutos.
4. No menu da esquerda, abra **SQL Editor** e clique em **New query**.
5. Abra o arquivo `supabase/schema.sql` deste projeto, copie **todo** o conteúdo, cole no editor e clique em **Run**. Tem que aparecer *Success. No rows returned*.
6. Agora copie **2 informações** e guarde num bloco de notas:

   **a) A URL do projeto.** O jeito mais fácil: olhe o endereço do navegador enquanto está dentro do projeto. Ele fica assim:
   `https://supabase.com/dashboard/project/abcdefghijklmnop`
   Pegue esse código do final (`abcdefghijklmnop`) e monte a URL assim:
   `https://abcdefghijklmnop.supabase.co`
   (Ela também aparece no botão **Connect**, no topo da página do projeto, e em **Project Settings > Data API > Project URL**.)

   **b) A chave secreta.** Vá em **Project Settings** (engrenagem no fim do menu da esquerda) > **API Keys**.
   - Se existir a seção **Secret keys**, copie a chave que começa com `sb_secret_...` (clique no ícone de olho ou de copiar).
   - Se não existir, abra a aba **Legacy API Keys** e copie a **service_role** (clique em *Reveal*).
   - **Nunca** use a chave `anon` ou `publishable`. E nunca mande a chave secreta para ninguém.

## Passo 2: Enviar o código para o GitHub (pelo navegador)

Os arquivos para enviar já estão separados na pasta **`Documentos\claudecod\ctformafit-para-github`** (são 88 arquivos). **Use essa pasta, e não a pasta `ctformafit`**: a `ctformafit` tem milhares de arquivos de sistema que não podem ir para o GitHub.

1. No GitHub, clique no **+** (canto superior direito) > **New repository**.
2. Em **Repository name**, escreva `ctformafit`. Marque **Private**. **Não** marque *Add a README*. Clique em **Create repository**.
3. Na página que abrir, clique no link **uploading an existing file** (na frase "…or create a new file or **upload an existing file**").
4. No computador, abra a pasta `Documentos\claudecod\ctformafit-para-github` no Explorador de Arquivos.
5. Clique dentro da pasta, aperte **Ctrl + A** para selecionar tudo e **arraste** para a área cinza do GitHub ("Drag files here…").
   - Arraste **o que está dentro da pasta**, e não a pasta em si. O GitHub precisa ver o `package.json` direto na raiz.
   - Espere a lista de arquivos terminar de carregar (aparecem pastas como `app/`, `components/`, `lib/`, `public/`…).
   - Se os arquivos `.gitignore` e `.env.example` não aparecerem, não tem problema.
6. Lá embaixo, em **Commit changes**, clique no botão verde **Commit changes**.
7. Confira: na página do repositório aparecem `app`, `components`, `lib`, `public`, `supabase`, `package.json`, `README.md`… Se tudo apareceu dentro de uma pasta `ctformafit-para-github`, apague o repositório (Settings > Delete this repository) e refaça o item 5 arrastando só o conteúdo.

> Nenhuma senha vai para o GitHub. As senhas ficam só na Vercel (Passo 3).

## Passo 3: Publicar na Vercel

1. Na Vercel, clique em **Add New...** e depois em **Project**.
2. Em *Import Git Repository*, clique em **Import** ao lado de `ctformafit`. Se o repositório não aparecer, clique em *Adjust GitHub App Permissions* e libere o acesso a ele.
3. Framework: a Vercel reconhece **Next.js** sozinha. Não mude nada em *Build and Output Settings*.
4. Abra **Environment Variables** e cadastre uma por uma:

| Name | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | a Project URL do Passo 1 |
| `SUPABASE_SERVICE_ROLE_KEY` | a chave secreta do Passo 1 |
| `AUTH_SECRET` | um texto aleatório com 40 caracteres ou mais (gere em https://generate-secret.vercel.app/32) |
| `CRON_SECRET` | outro texto aleatório, diferente do anterior (gere de novo no mesmo link) |
| `NEXT_PUBLIC_SITE_URL` | `https://www.ctformafit.com.br` |

Guarde o valor do `CRON_SECRET`: você vai usar no Passo 7.

5. Clique em **Deploy** e espere 1 a 3 minutos.
6. Quando terminar, clique em **Continue to Dashboard** e abra o endereço provisório (algo como `ctformafit.vercel.app`) para conferir o site.

## Passo 4: Conectar o domínio ctformafit.com.br

### 4.1 Na Vercel
1. No projeto, vá em **Settings** e depois em **Domains**.
2. Digite `www.ctformafit.com.br` e clique em **Add**. Escolha a opção recomendada, que adiciona também `ctformafit.com.br` redirecionando para o `www`.
3. A Vercel vai mostrar **Invalid Configuration** e os registros DNS que precisam ser criados. **Deixe essa tela aberta**: os valores exatos estão nela. Normalmente são:

| Tipo | Nome | Valor |
|---|---|---|
| **A** | `@` (o domínio sem nada, `ctformafit.com.br`) | o IP que a Vercel mostrar (ex.: `216.198.79.1` ou `76.76.21.21`) |
| **CNAME** | `www` | o endereço que a Vercel mostrar (ex.: `xxxx.vercel-dns-017.com` ou `cname.vercel-dns.com`) |

### 4.2 No Registro.br
1. Entre em https://registro.br e clique no domínio `ctformafit.com.br`.
2. Na seção **DNS**, veja qual é a situação:
   - **Se aparecer "Configurar zona DNS" ou "Editar zona"** (o domínio usa o DNS do próprio Registro.br):
     1. Clique em **Editar zona** (ou em *Configurar zona DNS* e depois *Modo avançado*).
     2. Clique em **Nova entrada** e crie o registro **A**: nome em branco (ou `@`) e o IP da Vercel.
     3. Clique em **Nova entrada** e crie o registro **CNAME**: nome `www` e o endereço da Vercel.
     4. Se já existir outro registro A na raiz ou outro `www`, apague. **Não apague** registros **MX** nem **TXT**: eles cuidam do e-mail do domínio.
     5. Clique em **Salvar alterações**.
   - **Se o domínio usa servidores DNS de outra empresa** (Hostinger, Cloudflare, GoDaddy etc.): crie os mesmos registros A e CNAME no painel de DNS dessa empresa.

> **Alternativa:** em vez de criar os registros, dá para trocar os servidores DNS do domínio para `ns1.vercel-dns.com` e `ns2.vercel-dns.com` (Registro.br > domínio > DNS > Alterar servidores DNS). **Atenção:** se o domínio tiver e-mail (`@ctformafit.com.br`), ele para de funcionar até você recriar os registros MX na Vercel. Na dúvida, use o caminho dos registros A e CNAME.

### 4.3 Esperar e conferir
- A propagação costuma levar de 5 minutos a 2 horas (no máximo 24h).
- Na tela **Domains** da Vercel, os dois domínios ficam com o **check azul "Valid Configuration"**.
- O certificado de segurança (HTTPS/cadeado) é criado automaticamente pela Vercel.
- Teste: abra `ctformafit.com.br` e confira se ele vai para `https://www.ctformafit.com.br`.

## Passo 5: Primeiro acesso ao painel

1. Acesse **https://www.ctformafit.com.br/admin**.
2. Na primeira vez aparece **Primeiro acesso**: crie o administrador principal (nome, e-mail e senha com 8+ caracteres).
3. Depois, em **Admins**, cadastre as outras pessoas da equipe.

## Passo 6: Conectar o EVX CRM

1. No painel, abra **Pixels e CRM**, cole o **Token da integração** no bloco *EVX CRM* e clique em **Salvar integração**.
2. Confira as etiquetas e o interesse ("Musculação"). O campo *Unidade* pode ficar vazio.

## Passo 7: Envio automático ao CRM a cada 5 minutos (recomendado)

Sem este passo, quem não conclui o agendamento é enviado ao CRM quando o site recebe visitas e uma vez por dia. Com ele, o envio acontece a cada 5 minutos.

1. No Supabase, vá em **Database** e depois em **Extensions**. Ative **pg_cron** e **pg_net**.
2. Abra **SQL Editor > New query**, cole o código abaixo, troque `SEU_CRON_SECRET` pelo valor do `CRON_SECRET` do Passo 3 e clique em **Run**:

```sql
select cron.schedule('crm-sync', '*/5 * * * *', $$
  select net.http_get(
    url := 'https://www.ctformafit.com.br/api/cron/crm-sync',
    headers := jsonb_build_object('Authorization', 'Bearer SEU_CRON_SECRET')
  );
$$);
```

## Passo 8: Pixels (quando as campanhas forem começar)

No painel, em **Pixels e CRM**:
- **Meta:** ID do Pixel e token da API de Conversões. Para testar, cole o *código de evento de teste* (Gerenciador de Eventos > Testar eventos), navegue no site e confira os eventos chegando. **Depois apague o código de teste.**
- **Google:** ID do GA4 (G-...), chave do Measurement Protocol (opcional), ID do Google Ads (AW-...) e os rótulos de conversão.

Nos anúncios, use sempre o link da `/captura` com UTMs, por exemplo:
`https://www.ctformafit.com.br/captura?utm_source=instagram&utm_medium=cpc&utm_campaign=outubro`

## Passo 9: Teste final

- [ ] `https://www.ctformafit.com.br` abre com cadeado.
- [ ] Um botão da página inicial abre o WhatsApp **(84) 99840-6056** com a mensagem certa.
- [ ] Em `/captura`, digite nome e WhatsApp, **não confirme** e feche a página. O lead aparece em **Admin > Leads** como "Só deixou os dados".
- [ ] Faça um agendamento completo. Ele aparece como **✓ Agendou** e o WhatsApp abre com a mensagem de visita agendada.
- [ ] No EVX, o lead aparece com a etiqueta "Visita agendada", e em **Admin > Leads** a coluna CRM mostra **Enviado**.
- [ ] Apague os leads de teste em **Admin > Leads > Excluir**.

## Passo 10: Google

- **Google Search Console** (https://search.google.com/search-console): adicione `ctformafit.com.br` como *Domínio*, confirme pelo registro TXT no Registro.br e envie o sitemap `https://www.ctformafit.com.br/sitemap.xml`.
- **Perfil da Empresa no Google:** troque o campo *Site* para `https://www.ctformafit.com.br` e o telefone para (84) 99840-6056.

---

## Como atualizar o site depois

Toda alteração feita no GitHub publica sozinha na Vercel em 1 ou 2 minutos. Para trocar um arquivo pelo navegador: abra a pasta dele no repositório > **Add file** > **Upload files** > arraste o arquivo novo com o mesmo nome > **Commit changes**. Para textos pequenos, abra o arquivo e clique no lápis (**Edit**). Número do WhatsApp, mensagens, agenda, pixels e CRM mudam direto no painel, sem mexer no código.

## Se algo der errado

| Problema | O que fazer |
|---|---|
| Domínio "Invalid Configuration" por mais de 24h | Confira se os valores do A e do CNAME no Registro.br são exatamente os que a Vercel mostra, e se não sobrou outro registro A/`www` antigo. |
| `/admin` mostra "Configure as variáveis do Supabase" | Falta alguma variável na Vercel. Depois de corrigir, vá em **Deployments > ... > Redeploy**. |
| Painel avisa "funções de analytics não encontradas" | Rode de novo o `supabase/schema.sql` no SQL Editor. |
| Leads com **Erro** no CRM | Passe o mouse no erro. 401 = token errado ou desativado no EVX. Corrija e clique em **Reenviar ao CRM**. |
