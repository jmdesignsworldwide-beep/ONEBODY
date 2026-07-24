-- ============================================================================
-- ONEBODY · Tanda 2 — Row Level Security (Sección 9.2)
-- RLS + FORCE en TODAS las tablas sin excepción. Aislamiento hermético.
-- Escritura administrativa sólo vía rol admin verificado en el servidor.
-- El rol `service_role` (BYPASSRLS) es el único camino de escritura del
-- servidor de confianza; anon/authenticated quedan restringidos por política.
-- ============================================================================

-- Habilitar + FORZAR RLS en todas las tablas públicas.
do $$
declare t text;
begin
  foreach t in array array[
    'projects','project_translations','project_budget_items','project_updates',
    'donations','subscriptions','donor_profiles','site_analytics',
    'admin_users','audit_log'
  ] loop
    execute format('alter table public.%I enable row level security;', t);
    execute format('alter table public.%I force  row level security;', t);
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- projects — lectura pública sólo de proyectos publicados; escritura editor+
-- ---------------------------------------------------------------------------
drop policy if exists projects_select on public.projects;
create policy projects_select on public.projects for select
  using ( public.project_is_public(status) or public.is_admin() );

drop policy if exists projects_write on public.projects;
create policy projects_write on public.projects for all to authenticated
  using ( public.is_editor() ) with check ( public.is_editor() );

-- ---------------------------------------------------------------------------
-- project_translations — visibles si el proyecto padre es público
-- ---------------------------------------------------------------------------
drop policy if exists ptrans_select on public.project_translations;
create policy ptrans_select on public.project_translations for select
  using (
    public.is_admin() or exists (
      select 1 from public.projects p
      where p.id = project_id and public.project_is_public(p.status)
    )
  );

drop policy if exists ptrans_write on public.project_translations;
create policy ptrans_write on public.project_translations for all to authenticated
  using ( public.is_editor() ) with check ( public.is_editor() );

-- ---------------------------------------------------------------------------
-- project_budget_items — mismo patrón que traducciones
-- ---------------------------------------------------------------------------
drop policy if exists pbudget_select on public.project_budget_items;
create policy pbudget_select on public.project_budget_items for select
  using (
    public.is_admin() or exists (
      select 1 from public.projects p
      where p.id = project_id and public.project_is_public(p.status)
    )
  );

drop policy if exists pbudget_write on public.project_budget_items;
create policy pbudget_write on public.project_budget_items for all to authenticated
  using ( public.is_editor() ) with check ( public.is_editor() );

-- ---------------------------------------------------------------------------
-- project_updates — visibles si publicadas y el proyecto es público
-- ---------------------------------------------------------------------------
drop policy if exists pupdates_select on public.project_updates;
create policy pupdates_select on public.project_updates for select
  using (
    public.is_admin() or (
      published_at is not null and exists (
        select 1 from public.projects p
        where p.id = project_id and public.project_is_public(p.status)
      )
    )
  );

drop policy if exists pupdates_write on public.project_updates;
create policy pupdates_write on public.project_updates for all to authenticated
  using ( public.is_editor() ) with check ( public.is_editor() );

-- ---------------------------------------------------------------------------
-- donations — un donante SÓLO lee las suyas; admin lee todas.
-- Sin INSERT para anon/authenticated: la creación pasa por el servidor
-- (service_role) o un RPC validado. UPDATE/refund sólo editor+.
-- ---------------------------------------------------------------------------
drop policy if exists donations_select_own on public.donations;
create policy donations_select_own on public.donations for select to authenticated
  using ( donor_id = (select auth.uid()) or public.is_admin() );

drop policy if exists donations_update_admin on public.donations;
create policy donations_update_admin on public.donations for update to authenticated
  using ( public.is_editor() ) with check ( public.is_editor() );

-- ---------------------------------------------------------------------------
-- subscriptions — el donante gestiona la suya; admin ve todas.
-- ---------------------------------------------------------------------------
drop policy if exists subs_select on public.subscriptions;
create policy subs_select on public.subscriptions for select to authenticated
  using ( donor_id = (select auth.uid()) or public.is_admin() );

drop policy if exists subs_update on public.subscriptions;
create policy subs_update on public.subscriptions for update to authenticated
  using ( donor_id = (select auth.uid()) or public.is_editor() )
  with check ( donor_id = (select auth.uid()) or public.is_editor() );

-- ---------------------------------------------------------------------------
-- donor_profiles — cada quien su propio perfil; admin ve todos.
-- Alta del propio perfil e derecho al olvido (GDPR) propios.
-- ---------------------------------------------------------------------------
drop policy if exists donor_select on public.donor_profiles;
create policy donor_select on public.donor_profiles for select to authenticated
  using ( id = (select auth.uid()) or public.is_admin() );

drop policy if exists donor_insert on public.donor_profiles;
create policy donor_insert on public.donor_profiles for insert to authenticated
  with check ( id = (select auth.uid()) );

drop policy if exists donor_update on public.donor_profiles;
create policy donor_update on public.donor_profiles for update to authenticated
  using ( id = (select auth.uid()) or public.is_admin() )
  with check ( id = (select auth.uid()) or public.is_admin() );

drop policy if exists donor_delete on public.donor_profiles;
create policy donor_delete on public.donor_profiles for delete to authenticated
  using ( id = (select auth.uid()) or public.is_superadmin() );

-- ---------------------------------------------------------------------------
-- site_analytics — sólo admin lee. Inserción sólo servidor (service_role).
-- ---------------------------------------------------------------------------
drop policy if exists analytics_select on public.site_analytics;
create policy analytics_select on public.site_analytics for select to authenticated
  using ( public.is_admin() );

-- ---------------------------------------------------------------------------
-- admin_users — sólo superadmin. El resto usa current_admin_role() (definer).
-- ---------------------------------------------------------------------------
drop policy if exists admins_select on public.admin_users;
create policy admins_select on public.admin_users for select to authenticated
  using ( public.is_superadmin() );

drop policy if exists admins_write on public.admin_users;
create policy admins_write on public.admin_users for all to authenticated
  using ( public.is_superadmin() ) with check ( public.is_superadmin() );

-- ---------------------------------------------------------------------------
-- audit_log — lectura admin; escritura sólo vía log_audit (SECURITY DEFINER)
-- o service_role. Nunca UPDATE/DELETE (triggers lanzan excepción).
-- ---------------------------------------------------------------------------
drop policy if exists audit_select on public.audit_log;
create policy audit_select on public.audit_log for select to authenticated
  using ( public.is_admin() );

-- Permite el INSERT del definer bajo FORCE RLS; el GRANT (0004) impide el
-- INSERT directo desde anon/authenticated.
drop policy if exists audit_insert on public.audit_log;
create policy audit_insert on public.audit_log for insert with check ( true );
