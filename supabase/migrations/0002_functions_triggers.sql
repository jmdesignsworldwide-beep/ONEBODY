-- ============================================================================
-- ONEBODY · Tanda 2 — Funciones y triggers
-- Todas las funciones SECURITY DEFINER fijan search_path = '' y califican por
-- esquema (Sección 9.9). Ninguna confía en el search_path del invocador.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Rol admin del usuario actual. SECURITY DEFINER para poder leer admin_users
-- sin exponer la tabla al invocador. Se usa dentro de las políticas RLS.
-- ---------------------------------------------------------------------------
create or replace function public.current_admin_role()
returns public.admin_role
language sql stable security definer set search_path = ''
as $$
  select a.role from public.admin_users a where a.id = (select auth.uid());
$$;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = ''
as $$ select public.current_admin_role() is not null; $$;

create or replace function public.is_editor()
returns boolean language sql stable security definer set search_path = ''
as $$ select public.current_admin_role() in ('superadmin','editor'); $$;

create or replace function public.is_superadmin()
returns boolean language sql stable security definer set search_path = ''
as $$ select public.current_admin_role() = 'superadmin'; $$;

-- Un proyecto es visible al público cuando su estado es no-borrador/no-archivado.
create or replace function public.project_is_public(p_status public.project_status)
returns boolean language sql immutable set search_path = ''
as $$ select p_status in ('active','funded','completed'); $$;

-- ---------------------------------------------------------------------------
-- updated_at automático
-- ---------------------------------------------------------------------------
create or replace function public.tg_set_updated_at()
returns trigger language plpgsql set search_path = ''
as $$ begin new.updated_at := now(); return new; end $$;

drop trigger if exists set_updated_at on public.projects;
create trigger set_updated_at before update on public.projects
  for each row execute function public.tg_set_updated_at();

drop trigger if exists set_updated_at on public.project_translations;
create trigger set_updated_at before update on public.project_translations
  for each row execute function public.tg_set_updated_at();

-- ---------------------------------------------------------------------------
-- projects.raised_amount materializado desde donaciones completadas
-- ---------------------------------------------------------------------------
create or replace function public.tg_update_project_raised()
returns trigger language plpgsql security definer set search_path = ''
as $$
declare pid uuid;
begin
  pid := coalesce(new.project_id, old.project_id);
  if pid is not null then
    update public.projects p
       set raised_amount = coalesce((
             select sum(d.amount_usd) from public.donations d
              where d.project_id = pid and d.status = 'completed'), 0)
     where p.id = pid;
  end if;
  return null;
end $$;

drop trigger if exists donations_recalc_raised on public.donations;
create trigger donations_recalc_raised
  after insert or update or delete on public.donations
  for each row execute function public.tg_update_project_raised();

-- ---------------------------------------------------------------------------
-- donor_profiles: total_donated_usd / donation_count / first_donation_at
-- ---------------------------------------------------------------------------
create or replace function public.tg_update_donor_totals()
returns trigger language plpgsql security definer set search_path = ''
as $$
declare did uuid;
begin
  did := coalesce(new.donor_id, old.donor_id);
  if did is not null then
    update public.donor_profiles dp
       set total_donated_usd = coalesce((
             select sum(d.amount_usd) from public.donations d
              where d.donor_id = did and d.status = 'completed'), 0),
           donation_count = coalesce((
             select count(*) from public.donations d
              where d.donor_id = did and d.status = 'completed'), 0),
           first_donation_at = (
             select min(d.completed_at) from public.donations d
              where d.donor_id = did and d.status = 'completed')
     where dp.id = did;
  end if;
  return null;
end $$;

drop trigger if exists donations_recalc_donor on public.donations;
create trigger donations_recalc_donor
  after insert or update or delete on public.donations
  for each row execute function public.tg_update_donor_totals();

-- ============================================================================
-- BITÁCORA DE AUDITORÍA INVIOLABLE (Sección 9.10)
-- Ningún UPDATE, ningún DELETE, ningún TRUNCATE. El trigger lanza excepción.
-- ============================================================================
create or replace function public.tg_prevent_audit_mod()
returns trigger language plpgsql set search_path = ''
as $$
begin
  raise exception 'audit_log es inviolable: operacion % no permitida', tg_op
    using errcode = '42501';
end $$;

drop trigger if exists audit_log_no_update on public.audit_log;
create trigger audit_log_no_update before update on public.audit_log
  for each row execute function public.tg_prevent_audit_mod();

drop trigger if exists audit_log_no_delete on public.audit_log;
create trigger audit_log_no_delete before delete on public.audit_log
  for each row execute function public.tg_prevent_audit_mod();

drop trigger if exists audit_log_no_truncate on public.audit_log;
create trigger audit_log_no_truncate before truncate on public.audit_log
  for each statement execute function public.tg_prevent_audit_mod();

-- ---------------------------------------------------------------------------
-- Registro de auditoría. SECURITY DEFINER: sólo esta función escribe en
-- audit_log; nadie tiene INSERT directo (ver grants).
-- ---------------------------------------------------------------------------
create or replace function public.log_audit(
  p_action text, p_entity_type text, p_entity_id text,
  p_before jsonb default null, p_after jsonb default null, p_ip_country text default null
) returns void
language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.audit_log (actor_id, actor_email, action, entity_type, entity_id, before, after, ip_country)
  values (
    (select auth.uid()),
    nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'email',
    p_action, p_entity_type, p_entity_id, p_before, p_after, p_ip_country
  );
end $$;

-- Trigger genérico de auditoría para tablas sensibles.
create or replace function public.tg_audit()
returns trigger language plpgsql security definer set search_path = ''
as $$
declare v_id text; v_before jsonb; v_after jsonb;
begin
  if tg_op = 'DELETE' then
    v_id := (to_jsonb(old) ->> 'id'); v_before := to_jsonb(old); v_after := null;
  elsif tg_op = 'UPDATE' then
    v_id := (to_jsonb(new) ->> 'id'); v_before := to_jsonb(old); v_after := to_jsonb(new);
  else
    v_id := (to_jsonb(new) ->> 'id'); v_before := null; v_after := to_jsonb(new);
  end if;
  perform public.log_audit(tg_op, tg_table_name, v_id, v_before, v_after);
  return null;
end $$;

drop trigger if exists audit_projects on public.projects;
create trigger audit_projects after insert or update or delete on public.projects
  for each row execute function public.tg_audit();

drop trigger if exists audit_admin_users on public.admin_users;
create trigger audit_admin_users after insert or update or delete on public.admin_users
  for each row execute function public.tg_audit();

drop trigger if exists audit_donations on public.donations;
create trigger audit_donations after update or delete on public.donations
  for each row execute function public.tg_audit();
