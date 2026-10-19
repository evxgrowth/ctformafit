-- A cada 5 min, chama o site para enviar ao CRM os leads pendentes/incompletos e reenviar falhas.
-- O CRON_SECRET fica no Vault (nome ctf_cron_secret) e precisa ser igual ao da Vercel.
-- Enquanto o segredo não existir, o job não faz nada.
create extension if not exists pg_cron;
create extension if not exists pg_net;

select cron.schedule(
  'ctf-crm-sync',
  '*/5 * * * *',
  $$
  select net.http_get(
    url := 'https://www.ctformafit.com.br/api/cron/crm-sync',
    headers := jsonb_build_object('Authorization', 'Bearer ' || s.decrypted_secret)
  )
  from vault.decrypted_secrets s
  where s.name = 'ctf_cron_secret';
  $$
);
