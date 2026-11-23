-- Campanha de origem (ex.: black26; nulo = página /captura normal) e observações do lead.
alter table public.ctf_leads add column if not exists campaign text;
alter table public.ctf_leads add column if not exists notes text;
create index if not exists ctf_leads_campaign_idx on public.ctf_leads (campaign);
