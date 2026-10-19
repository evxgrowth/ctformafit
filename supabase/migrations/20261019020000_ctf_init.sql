-- CT Forma Fit (prefixo ctf_) — projeto Supabase compartilhado "landing-pages".
-- Todo acesso acontece pelo servidor do site (secret key / service role). O RLS fica ligado,
-- sem políticas, e os papéis anon/authenticated não têm permissão nas tabelas ctf_,
-- então ninguém lê ou grava direto pelo navegador (nem com a chave pública de outro cliente).

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------- admins
create table if not exists public.ctf_admins (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  password_hash text not null,
  created_at timestamptz not null default now(),
  last_login_at timestamptz
);

-- ---------------------------------------------------------------- leads
create table if not exists public.ctf_leads (
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
create index if not exists ctf_leads_created_idx on public.ctf_leads (created_at desc);
create index if not exists ctf_leads_crm_idx on public.ctf_leads (crm_status, crm_next_try_at);

-- ---------------------------------------------------------------- analytics
create table if not exists public.ctf_events (
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
create index if not exists ctf_events_created_idx on public.ctf_events (created_at desc);
create index if not exists ctf_events_type_idx on public.ctf_events (type, created_at desc);

-- ---------------------------------------------------------------- agenda
-- kind = 'block' bloqueia; kind = 'open' libera (ex.: abrir um sábado ou um feriado).
-- hour nulo = o dia inteiro.
create table if not exists public.ctf_availability_overrides (
  id bigserial primary key,
  date date not null,
  hour smallint,
  kind text not null check (kind in ('block', 'open')),
  created_at timestamptz not null default now()
);
create unique index if not exists ctf_availability_unique on public.ctf_availability_overrides (date, coalesce(hour, -1));

-- ---------------------------------------------------------------- configurações
create table if not exists public.ctf_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.ctf_admins enable row level security;
alter table public.ctf_leads enable row level security;
alter table public.ctf_events enable row level security;
alter table public.ctf_availability_overrides enable row level security;
alter table public.ctf_settings enable row level security;

revoke all on public.ctf_admins, public.ctf_leads, public.ctf_events, public.ctf_availability_overrides, public.ctf_settings from anon, authenticated;
revoke all on sequence public.ctf_events_id_seq, public.ctf_availability_overrides_id_seq from anon, authenticated;
grant all on public.ctf_admins, public.ctf_leads, public.ctf_events, public.ctf_availability_overrides, public.ctf_settings to service_role;
grant usage, select on sequence public.ctf_events_id_seq, public.ctf_availability_overrides_id_seq to service_role;

-- ---------------------------------------------------------------- analytics (agregações para o painel)
create or replace function public.ctf_analytics_daily(p_from timestamptz, p_to timestamptz)
returns table (day date, type text, events bigint, sessions bigint)
language sql stable set search_path = public as $$
  select (created_at at time zone 'America/Fortaleza')::date, type, count(*), count(distinct session_id)
  from ctf_events
  where created_at >= p_from and created_at < p_to
  group by 1, 2
  order by 1;
$$;

create or replace function public.ctf_analytics_breakdown(p_from timestamptz, p_to timestamptz)
returns table (dim text, key text, type text, events bigint, sessions bigint)
language sql stable set search_path = public as $$
  with e as (
    select * from ctf_events where created_at >= p_from and created_at < p_to
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

revoke execute on function public.ctf_analytics_daily(timestamptz, timestamptz) from public, anon, authenticated;
revoke execute on function public.ctf_analytics_breakdown(timestamptz, timestamptz) from public, anon, authenticated;
grant execute on function public.ctf_analytics_daily(timestamptz, timestamptz) to service_role;
grant execute on function public.ctf_analytics_breakdown(timestamptz, timestamptz) to service_role;
