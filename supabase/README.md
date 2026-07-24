# ONEBODY — Base de datos (Supabase)

Esquema, seguridad y verificación de la **Tanda 2**. Fuente de verdad: español.

## Migraciones (orden)

| Archivo | Contenido |
|---|---|
| `0001_schema.sql` | Extensiones, enums y las 10 tablas núcleo (Sección 4) |
| `0002_functions_triggers.sql` | `updated_at`, materialización de `raised_amount` y totales de donante, **bitácora inviolable**, auditoría automática |
| `0003_rls.sql` | RLS **+ FORCE** en todas las tablas + políticas |
| `0004_grants.sql` | Endurecimiento de privilegios (defensa en profundidad) |

Aplicar en orden. Idempotentes en lo posible (`if not exists`, `create or replace`, `drop … if exists`).

## Modelo de seguridad (Sección 9)

- **RLS + FORCE en las 10 tablas, sin excepción.** Ni el dueño escapa a las políticas.
- **Aislamiento del donante:** un donante sólo lee sus donaciones, su perfil y su suscripción (`donor_id = auth.uid()`).
- **Lectura pública mínima:** sólo proyectos publicados (`active/funded/completed`) y su contenido asociado. Los borradores/archivados son invisibles al público.
- **Escritura administrativa** sólo con rol `editor`/`superadmin`, verificado en el servidor vía `admin_users` (nunca en UI). `admin_users` sólo lo lee/escribe un `superadmin`.
- **`service_role` es el único camino de escritura del servidor de confianza** (donaciones invitadas, analítica, webhooks). `anon`/`authenticated` no insertan en `donations`, `site_analytics`, `subscriptions`.
- **Funciones `SECURITY DEFINER` con `search_path = ''`** y todo calificado por esquema. `EXECUTE` de las funciones internas (`log_audit`, `tg_*`) revocado de `anon`/`authenticated`.
- **`audit_log` inviolable:** triggers que lanzan excepción ante cualquier `UPDATE`, `DELETE` o `TRUNCATE` — incluso desde `service_role` (bypassrls). Escritura sólo vía `log_audit` (definer) o `service_role`.
- **Idempotencia de webhooks:** índice único sobre `(provider, provider_ref)` en `donations` (Sección 9.11).
- **Sin IP cruda:** `site_analytics` guarda sólo geolocalización derivada (Sección 9.12).

## Verificación por metodología de ataque (Sección 0.5)

Ejecutada contra Postgres 16 con `auth` y los roles de Supabase emulados. Cada
intento de explotación **falla como debe**; cada función legítima **funciona**.

| # | Intento de ataque | Resultado |
|---|---|---|
| 1 | `anon` lee `donations` | 0 filas ✅ |
| 2 | `anon` lee proyecto en borrador | invisible (sólo ve el publicado) ✅ |
| 3 | `anon` inserta en `projects` | ERROR — viola RLS ✅ |
| 4 | `anon` inserta donación falsa | ERROR — permiso denegado ✅ |
| 5 | `anon` inyecta en `site_analytics` | ERROR — permiso denegado ✅ |
| 6 | `anon` lee `admin_users` | ERROR — permiso denegado ✅ |
| 7 | Donante A lee donaciones de B | sólo las suyas ✅ |
| 8 | Donante A edita un proyecto | 0 filas afectadas ✅ |
| 9 | Donante A crea un proyecto | ERROR — viola RLS ✅ |
| 10 | Donante A lee el perfil de B | sólo el suyo ✅ |
| 11 | Donante A forja auditoría vía `log_audit` | ERROR — `EXECUTE` denegado ✅ |
| 12 | `UPDATE` en `audit_log` | EXCEPCIÓN — inviolable ✅ |
| 13 | `DELETE` en `audit_log` | EXCEPCIÓN — inviolable ✅ |
| 14 | `TRUNCATE` en `audit_log` | EXCEPCIÓN — inviolable ✅ |
| 15 | `service_role` (bypassrls) `UPDATE` en `audit_log` | EXCEPCIÓN — el trigger lo detiene igual ✅ |
| 16 | Materialización `raised_amount` (100+50) | 150 ✅ |
| 17 | Totales del donante A | 100 / 1 donación ✅ |
| 18 | Reembolso recomputa `raised_amount` | vuelve a 100 ✅ |
| 19 | Editor crea proyecto → auditoría | insert OK + entrada en `audit_log` ✅ |
| 20 | Editor (`is_admin`) ve todas las donaciones | 2 ✅ |

> La verificación se repite contra el proyecto Supabase real al aplicar, y se
> cierra con **Security Advisor en 0 ERROR / 0 WARN** (Sección 9).

## Aplicación (protocolo PAT temporal)

Se aplica vía **Management API de Supabase** con un PAT temporal (nombre
`claude-code-temporal`), que se revoca al terminar. No se pega SQL a mano.

## Bootstrap del primer superadmin

`admin_users` arranca vacía. Tras el primer registro de la directora (Tanda 10),
se la promueve a `superadmin`:

```sql
insert into public.admin_users (id, role)
values ('<uuid-de-auth.users>', 'superadmin');
```

## Variables de entorno (Vercel)

`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (cliente) y
`SUPABASE_SERVICE_ROLE_KEY` (sólo servidor, marcada **Sensitive**, jamás
`NEXT_PUBLIC_`). Ver `.env.example`.
