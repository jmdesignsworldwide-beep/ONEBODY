-- ============================================================================
-- ONEBODY · Tanda 2 — Esquema núcleo (Sección 4)
-- Postgres 15/16 (Supabase). Fuente de verdad: español (columnas *_es).
-- ============================================================================

create extension if not exists "pgcrypto";      -- gen_random_uuid()
create extension if not exists "citext";         -- emails case-insensitive

-- ---------------------------------------------------------------------------
-- Tipos enumerados
-- ---------------------------------------------------------------------------
do $$ begin
  create type project_status  as enum ('draft','active','funded','completed','archived');
exception when duplicate_object then null; end $$;

do $$ begin
  create type project_category as enum
    ('vivienda','alimentacion','educacion','maternidad','adiccion','emergencia','salud','general');
exception when duplicate_object then null; end $$;

do $$ begin
  create type donation_status as enum ('pending','completed','failed','refunded');
exception when duplicate_object then null; end $$;

do $$ begin
  create type subscription_status as enum ('active','paused','cancelled');
exception when duplicate_object then null; end $$;

do $$ begin
  create type admin_role as enum ('superadmin','editor','viewer');
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------------
-- projects
-- ---------------------------------------------------------------------------
create table if not exists public.projects (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null unique,
  status        project_status not null default 'draft',
  title_es      text not null,
  summary_es    text not null default '',
  story_es      text not null default '',
  goal_amount   numeric(12,2) not null default 0 check (goal_amount >= 0),
  raised_amount numeric(12,2) not null default 0 check (raised_amount >= 0), -- materializado por trigger
  currency      text not null default 'USD',
  category      project_category not null default 'general',
  cover_image   text,
  location_name text,
  location_lat  numeric(9,6),
  location_lng  numeric(9,6),
  deadline      timestamptz,
  featured      boolean not null default false,
  sort_order    integer not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  created_by    uuid
);
create index if not exists projects_status_idx   on public.projects (status);
create index if not exists projects_featured_idx on public.projects (featured) where featured;
create index if not exists projects_category_idx on public.projects (category);

-- ---------------------------------------------------------------------------
-- project_translations
-- ---------------------------------------------------------------------------
create table if not exists public.project_translations (
  id                    uuid primary key default gen_random_uuid(),
  project_id            uuid not null references public.projects(id) on delete cascade,
  locale                text not null,
  title                 text not null,
  summary               text not null default '',
  story                 text not null default '',
  is_machine_translated boolean not null default true,
  reviewed_by           uuid,
  updated_at            timestamptz not null default now(),
  unique (project_id, locale)
);
create index if not exists project_translations_project_idx on public.project_translations (project_id);

-- ---------------------------------------------------------------------------
-- project_budget_items — desglose presupuestario
-- ---------------------------------------------------------------------------
create table if not exists public.project_budget_items (
  id         uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  label_es   text not null,
  amount     numeric(12,2) not null default 0 check (amount >= 0),
  sort_order integer not null default 0
);
create index if not exists project_budget_items_project_idx on public.project_budget_items (project_id);

-- ---------------------------------------------------------------------------
-- donor_profiles  (id = auth.users.id)
-- ---------------------------------------------------------------------------
create table if not exists public.donor_profiles (
  id                uuid primary key,
  display_name      text,
  avatar_url        text,
  preferred_locale  text not null default 'es',
  country_code      text,
  total_donated_usd numeric(12,2) not null default 0, -- materializado por trigger
  donation_count    integer not null default 0,
  first_donation_at timestamptz,
  show_publicly     boolean not null default true,
  email_updates     boolean not null default true,
  created_at        timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- subscriptions — donaciones recurrentes
-- ---------------------------------------------------------------------------
create table if not exists public.subscriptions (
  id             uuid primary key default gen_random_uuid(),
  donor_id       uuid not null references public.donor_profiles(id) on delete cascade,
  tier           text,
  amount         numeric(12,2) not null check (amount > 0),
  currency       text not null default 'USD',
  interval       text not null default 'month',
  status         subscription_status not null default 'active',
  provider       text not null default 'mock',
  provider_ref   text,
  next_charge_at timestamptz,
  started_at     timestamptz not null default now(),
  cancelled_at   timestamptz
);
create index if not exists subscriptions_donor_idx on public.subscriptions (donor_id);

-- ---------------------------------------------------------------------------
-- donations
-- ---------------------------------------------------------------------------
create table if not exists public.donations (
  id              uuid primary key default gen_random_uuid(),
  donor_id        uuid references public.donor_profiles(id) on delete set null, -- null = invitado
  project_id      uuid references public.projects(id) on delete set null,        -- null = fondo general
  amount          numeric(12,2) not null check (amount > 0),
  currency        text not null default 'USD',
  amount_usd      numeric(12,2) not null check (amount_usd >= 0),
  status          donation_status not null default 'pending',
  is_anonymous    boolean not null default false,   -- controla visibilidad pública SOLAMENTE
  is_recurring    boolean not null default false,
  subscription_id uuid references public.subscriptions(id) on delete set null,
  provider        text not null default 'mock',
  provider_ref    text,
  donor_name      text,
  donor_email     citext,
  message         text,
  country_code    text,
  created_at      timestamptz not null default now(),
  completed_at    timestamptz
);
-- Idempotencia de webhooks: un provider_ref no se procesa dos veces (Sección 9.11).
create unique index if not exists donations_provider_ref_uidx
  on public.donations (provider, provider_ref) where provider_ref is not null;
create index if not exists donations_donor_idx     on public.donations (donor_id);
create index if not exists donations_project_idx   on public.donations (project_id);
create index if not exists donations_status_idx    on public.donations (status);
create index if not exists donations_created_idx   on public.donations (created_at desc);

-- ---------------------------------------------------------------------------
-- site_analytics — sin IP cruda, solo geolocalización derivada (Sección 9.12)
-- ---------------------------------------------------------------------------
create table if not exists public.site_analytics (
  id              uuid primary key default gen_random_uuid(),
  event_type      text not null,
  path            text,
  locale          text,
  country_code    text,
  region          text,
  city            text,
  referrer        text,
  session_id      text,
  project_id      uuid references public.projects(id) on delete set null,
  user_agent_hash text,
  created_at      timestamptz not null default now()
);
create index if not exists site_analytics_created_idx on public.site_analytics (created_at desc);
create index if not exists site_analytics_event_idx   on public.site_analytics (event_type);

-- ---------------------------------------------------------------------------
-- project_updates — bitácora de avance
-- ---------------------------------------------------------------------------
create table if not exists public.project_updates (
  id           uuid primary key default gen_random_uuid(),
  project_id   uuid not null references public.projects(id) on delete cascade,
  title_es     text not null,
  body_es      text not null default '',
  images       text[] not null default '{}',
  published_at timestamptz,
  created_by   uuid,
  created_at   timestamptz not null default now()
);
create index if not exists project_updates_project_idx on public.project_updates (project_id, published_at desc);

-- ---------------------------------------------------------------------------
-- admin_users  (id = auth.users.id)
-- ---------------------------------------------------------------------------
create table if not exists public.admin_users (
  id         uuid primary key,
  role       admin_role not null default 'viewer',
  created_at timestamptz not null default now(),
  created_by uuid
);

-- ---------------------------------------------------------------------------
-- audit_log — INVIOLABLE (Sección 9.10). Sin UPDATE, sin DELETE.
-- ---------------------------------------------------------------------------
create table if not exists public.audit_log (
  id          bigint generated always as identity primary key,
  actor_id    uuid,
  actor_email text,
  action      text not null,
  entity_type text not null,
  entity_id   text,
  before      jsonb,
  after       jsonb,
  ip_country  text,
  created_at  timestamptz not null default now()
);
create index if not exists audit_log_created_idx on public.audit_log (created_at desc);
create index if not exists audit_log_entity_idx  on public.audit_log (entity_type, entity_id);
