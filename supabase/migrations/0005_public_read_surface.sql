-- ============================================================================
-- ONEBODY · Tanda 6 — Superficie de lectura pública (landing)
-- Sin RPC SECURITY DEFINER expuestos ni vistas security-definer (para que el
-- Security Advisor siga en 0/0). Dos tablas denormalizadas, sólo con columnas
-- públicas seguras, mantenidas por triggers y legibles por anon vía RLS:
--   · public_stats  — agregados para los contadores del hero
--   · public_wall   — muro de donantes en tiempo real (sin datos sensibles)
-- ============================================================================

-- ---------------------------------------------------------------------------
-- public_stats — una sola fila con los agregados públicos
-- ---------------------------------------------------------------------------
create table if not exists public.public_stats (
  id                 boolean primary key default true check (id),
  total_raised_usd   numeric(14,2) not null default 0,
  donation_count     integer not null default 0,
  donor_count        integer not null default 0,
  country_count      integer not null default 0,
  active_projects    integer not null default 0,
  completed_projects integer not null default 0,
  updated_at         timestamptz not null default now()
);
insert into public.public_stats (id) values (true) on conflict (id) do nothing;

create or replace function public.refresh_public_stats()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  update public.public_stats set
    total_raised_usd = coalesce((select sum(amount_usd) from public.donations where status='completed'),0),
    donation_count   = (select count(*) from public.donations where status='completed'),
    donor_count      = (select count(distinct coalesce(donor_id::text, lower(donor_email), 'd:'||id::text)) from public.donations where status='completed'),
    country_count    = (select count(distinct country_code) from public.donations where status='completed' and country_code is not null),
    active_projects  = (select count(*) from public.projects where status in ('active','funded')),
    completed_projects = (select count(*) from public.projects where status='completed'),
    updated_at = now()
  where id;
  return null;
end $$;

drop trigger if exists stats_on_donation on public.donations;
create trigger stats_on_donation
  after insert or update or delete on public.donations
  for each row execute function public.refresh_public_stats();

drop trigger if exists stats_on_project on public.projects;
create trigger stats_on_project
  after insert or update or delete on public.projects
  for each row execute function public.refresh_public_stats();

-- ---------------------------------------------------------------------------
-- public_wall — feed del muro de donantes. Sólo columnas públicas seguras.
-- `is_anonymous` decide el nombre mostrado; nunca se copia email ni monto de
-- invitado identificable más allá de amount_usd agregado.
-- ---------------------------------------------------------------------------
create table if not exists public.public_wall (
  id            uuid primary key default gen_random_uuid(),
  donation_id   uuid unique references public.donations(id) on delete cascade,
  display_name  text not null,
  amount_usd    numeric(12,2) not null,
  project_id    uuid references public.projects(id) on delete set null,
  project_title text,
  message       text,
  country_code  text,
  created_at    timestamptz not null default now()
);
create index if not exists public_wall_created_idx on public.public_wall (created_at desc);

create or replace function public.push_to_wall()
returns trigger language plpgsql security definer set search_path = ''
as $$
declare v_name text; v_title text;
begin
  if new.status = 'completed' then
    if new.is_anonymous then
      v_name := 'Anónimo';
    else
      v_name := coalesce(
        new.donor_name,
        (select display_name from public.donor_profiles where id = new.donor_id),
        'Anónimo'
      );
    end if;
    select title_es into v_title from public.projects where id = new.project_id;

    insert into public.public_wall
      (donation_id, display_name, amount_usd, project_id, project_title, message, country_code, created_at)
    values
      (new.id, v_name, new.amount_usd, new.project_id, v_title,
       nullif(btrim(coalesce(new.message,'')), ''), new.country_code, coalesce(new.completed_at, now()))
    on conflict (donation_id) do nothing;
  end if;
  return null;
end $$;

drop trigger if exists wall_on_donation on public.donations;
create trigger wall_on_donation
  after insert or update of status on public.donations
  for each row execute function public.push_to_wall();

-- ---------------------------------------------------------------------------
-- RLS: lectura pública de ambas tablas; escritura sólo vía trigger/servidor.
-- ---------------------------------------------------------------------------
alter table public.public_stats enable row level security;
alter table public.public_stats force  row level security;
alter table public.public_wall  enable row level security;
alter table public.public_wall  force  row level security;

drop policy if exists stats_public_read on public.public_stats;
create policy stats_public_read on public.public_stats for select using ( true );

drop policy if exists wall_public_read on public.public_wall;
create policy wall_public_read on public.public_wall for select using ( true );

revoke insert, update, delete, truncate on public.public_stats from anon, authenticated;
revoke insert, update, delete, truncate on public.public_wall  from anon, authenticated;
revoke execute on function public.refresh_public_stats() from public, anon, authenticated;
revoke execute on function public.push_to_wall() from public, anon, authenticated;

-- Realtime: el navegador se suscribe al muro para el feed en vivo.
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    execute 'alter publication supabase_realtime add table public.public_wall';
  end if;
exception when duplicate_object then null;
end $$;
