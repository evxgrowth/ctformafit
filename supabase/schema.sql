-- CT Forma Fit — schema do banco (Supabase / Postgres)
-- Rode este arquivo inteiro no Supabase: SQL Editor > New query > colar > Run.
-- Todo acesso acontece pelo servidor do site (service role). O RLS fica ligado e sem
-- políticas, então ninguém consegue ler ou gravar direto pelo navegador.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------- admins
create table if not exists admins (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  password_hash text not null,
  created_at timestamptz not null default now(),
  last_login_at timestamptz
);

-- ---------------------------------------------------------------- leads
create table if not exists leads (
  id uuid primary key,
  name text,
  phone text,
  email text,
  completed boolean not null default false,
  completed_at timestamptz,
  visit_date date,
  visit_hour smallint,
  visit_at timestamptz,
  source_page text,
  session_id text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  utm_term text,
  fbclid text,
  gclid text,
  fbp text,
  fbc text,
  ga_client_id text,
  referrer text,
  user_agent text,
  ip text,
  lead_event_sent boolean not null default false,
  crm_status text not null default 'pendente',   -- pendente | enviado | erro | ignorado
  crm_stage text,                                  -- etapa já enviada: incompleto | agendado
  crm_error text,
  crm_attempts smallint not null default 0,
  crm_next_try_at timestamptz,
  crm_sent_at timestamptz,
  crm_lead_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists leads_created_idx on leads (created_at desc);
create index if not exists leads_crm_idx on leads (crm_status, crm_next_try_at);

-- ---------------------------------------------------------------- analytics
create table if not exists events (
  id bigserial primary key,
  created_at timestamptz not null default now(),
  type text not null,          -- page_view | cta_click | form_start | lead | schedule
  page text,
  label text,
  session_id text,
  device text,
  referrer text,
  utm_source text,
  utm_medium text,
  utm_campaign text
);
create index if not exists events_created_idx on events (created_at desc);
create index if not exists events_type_idx on events (type, created_at desc);

-- ---------------------------------------------------------------- agenda
-- kind = 'block' bloqueia; kind = 'open' libera (ex.: abrir um sábado ou um feriado).
-- hour nulo = o dia inteiro.
create table if not exists availability_overrides (
  id bigserial primary key,
  date date not null,
  hour smallint,
  kind text not null check (kind in ('block', 'open')),
  created_at timestamptz not null default now()
);
create unique index if not exists availability_unique on availability_overrides (date, coalesce(hour, -1));

-- ---------------------------------------------------------------- configurações
create table if not exists settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

alter table admins enable row level security;
alter table leads enable row level security;
alter table events enable row level security;
alter table availability_overrides enable row level security;
alter table settings enable row level security;

-- ---------------------------------------------------------------- analytics (agregações para o painel)
create or replace function analytics_daily(p_from timestamptz, p_to timestamptz)
returns table (day date, type text, events bigint, sessions bigint)
language sql stable as $$
  select (created_at at time zone 'America/Fortaleza')::date, type, count(*), count(distinct session_id)
  from events
  where created_at >= p_from and created_at < p_to
  group by 1, 2
  order by 1;
$$;

create or replace function analytics_breakdown(p_from timestamptz, p_to timestamptz)
returns table (dim text, key text, type text, events bigint, sessions bigint)
language sql stable as $$
  with e as (
    select * from events where created_at >= p_from and created_at < p_to
  )
  select 'source', coalesce(nullif(utm_source, ''), case when referrer is null or referrer = '' then '(direto)' else '(referência)' end), type, count(*), count(distinct session_id) from e group by 2, 3
  union all
  select 'campaign', coalesce(nullif(utm_campaign, ''), '(sem campanha)'), type, count(*), count(distinct session_id) from e group by 2, 3
  union all
  select 'cta', coalesce(label, '(sem nome)'), type, count(*), count(distinct session_id) from e where type = 'cta_click' group by 2, 3
  union all
  select 'device', coalesce(device, '?'), type, count(*), count(distinct session_id) from e where type = 'page_view' group by 2, 3
  union all
  select 'page', coalesce(page, '/'), type, count(*), count(distinct session_id) from e group by 2, 3;
$$;

revoke execute on function analytics_daily(timestamptz, timestamptz) from public, anon, authenticated;
revoke execute on function analytics_breakdown(timestamptz, timestamptz) from public, anon, authenticated;
grant execute on function analytics_daily(timestamptz, timestamptz) to service_role;
grant execute on function analytics_breakdown(timestamptz, timestamptz) to service_role;

-- ---------------------------------------------------------------- envio automático ao CRM (opcional, recomendado)
-- Envia a cada 5 minutos os leads que pararam no meio do formulário e reenvia falhas.
-- 1) Database > Extensions: ative "pg_cron" e "pg_net".
-- 2) Troque SEU_CRON_SECRET pelo mesmo valor da variável CRON_SECRET da Vercel e rode:
--
-- select cron.schedule('crm-sync', '*/5 * * * *', $$
--   select net.http_get(
--     url := 'https://www.ctformafit.com.br/api/cron/crm-sync',
--     headers := jsonb_build_object('Authorization', 'Bearer SEU_CRON_SECRET')
--   );
-- $$);
