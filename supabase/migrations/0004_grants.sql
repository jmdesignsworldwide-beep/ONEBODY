-- ============================================================================
-- ONEBODY · Tanda 2 — Endurecimiento de privilegios (Sección 9.9)
-- Defensa en profundidad sobre RLS. Los roles anon/authenticated pierden todo
-- privilegio que no necesitan; el servidor de confianza usa service_role.
-- ============================================================================

-- --- audit_log: sin escritura directa de cliente (sólo log_audit/service) ---
revoke insert, update, delete, truncate on public.audit_log from anon, authenticated;

-- --- site_analytics: el cliente no escribe métricas (sólo el servidor) ------
revoke insert, update, delete, truncate on public.site_analytics from anon, authenticated;

-- --- admin_users: sin acceso directo de cliente (todo vía superadmin/RLS) ---
revoke insert, update, delete, truncate on public.admin_users from anon;
revoke select on public.admin_users from anon;

-- --- donations: el cliente nunca inserta ni borra directamente -------------
revoke insert, delete, truncate on public.donations from anon, authenticated;

-- --- subscriptions: sin alta/borrado directo de cliente --------------------
revoke insert, delete, truncate on public.subscriptions from anon, authenticated;

-- ---------------------------------------------------------------------------
-- Funciones internas: no invocables directamente. Los triggers las ejecutan
-- sin requerir privilegio EXECUTE del invocador; revocarlo cierra la puerta a
-- forjar entradas de auditoría o disparar recomputaciones a mano.
-- ---------------------------------------------------------------------------
revoke execute on function public.log_audit(text, text, text, jsonb, jsonb, text) from public, anon, authenticated;
revoke execute on function public.tg_audit() from public, anon, authenticated;
revoke execute on function public.tg_set_updated_at() from public, anon, authenticated;
revoke execute on function public.tg_update_project_raised() from public, anon, authenticated;
revoke execute on function public.tg_update_donor_totals() from public, anon, authenticated;
revoke execute on function public.tg_prevent_audit_mod() from public, anon, authenticated;

-- Los predicados de las políticas SÍ deben ser ejecutables por los roles de
-- cliente (se evalúan dentro de sus consultas). Explícito para no depender del
-- EXECUTE-to-public por defecto.
grant execute on function public.current_admin_role() to anon, authenticated;
grant execute on function public.is_admin()        to anon, authenticated;
grant execute on function public.is_editor()       to anon, authenticated;
grant execute on function public.is_superadmin()   to anon, authenticated;
grant execute on function public.project_is_public(public.project_status) to anon, authenticated;
