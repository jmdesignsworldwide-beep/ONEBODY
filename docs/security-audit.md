# Auditoría de seguridad — ONEBODY (Tanda 16)

**Fecha:** 2026-07-24 · **Alcance:** todo el código de aplicación acumulado
(Tandas 1–15) · **Estándar:** «Fort Knox» — autenticación en toda mutación,
autorización por rol donde aplica, y RLS de Postgres como red de seguridad
inviolable.

## Metodología

Revisión adversarial por tres dimensiones independientes, cada una leyendo el
código real (no supuestos):

1. **Autorización / control de acceso** — acciones de servidor, route handlers,
   guardias de rol, separación de clientes Supabase.
2. **Fuga de secretos / frontera cliente-servidor** — `service_role`, secretos
   de pago, sal de analítica; qué llega al bundle del navegador.
3. **Inyección / validación / salida** — Zod, SQL/PostgREST, CSV, XSS, redirects,
   límites de tasa.

## Postura general

- **Superficie de administración: sólida.** Toda mutación admin se comprueba por
  rol en código (`requireEditorClient` → `canEdit`) **y** la RLS forzada la
  vuelve a exigir (`is_editor()`), con la bitácora de auditoría registrando al
  actor real (`auth.uid()`). Defensa en profundidad real.
- **Secretos: fuerte.** Ningún secreto llega al cliente. `service_role` y los
  secretos de pago viven en módulos `server-only`/`"use server"`; sólo la URL y
  la `anon key` (limitada por RLS) son `NEXT_PUBLIC_`. Sin secretos en el
  repositorio.
- **Inyección: sólida.** Supabase se usa siempre con el constructor de consultas
  parametrizado (sin SQL crudo ni filtros `.or()` sobre entrada del usuario);
  React escapa todo el contenido (cero `dangerouslySetInnerHTML`).

La debilidad crítica estaba en el **puente donación-de-invitado → cuenta**, que
confiaba en dos entradas nunca verificadas (el `donor_email` de la donación y un
`donationId` en la URL). Corregida en esta tanda.

## Hallazgos y correcciones

| # | Sev. | Hallazgo | Corrección |
|---|------|----------|------------|
| C1 | Crítico | Escalada a superadmin: el arranque por `SUPERADMIN_EMAILS` podía elevar una cuenta creada con un email forjado. | El arranque por variable de entorno sólo provisiona al **primer** administrador; una vez existe cualquier admin, queda inerte. (En producción el arranque ni se usa: la directora se promovió por SQL.) |
| C2 | Crítico | Secuestro de cuenta: la conversión de un clic creaba una cuenta **confirmada** para cualquier email tecleado en la donación, sin probar propiedad. | La conversión exige una **cookie de propiedad httpOnly** puesta al crear la donación (sólo el navegador que donó puede convertir) y enlaza **sólo** esa donación, no todas las del email. |
| H1 | Alto | Inyección de fórmulas en la exportación CSV vía `donor_name` (texto libre público). | `csvCell` antepone `'` a valores que empiezan por `= + - @` (tab/CR) antes de comillar. |
| M1 | Medio | `setSubscriptionStatus` llamaba al proveedor con un id antes de comprobar la propiedad (IDOR de efecto secundario). | Se verifica la propiedad vía RLS **antes** de cualquier efecto en el proveedor. |
| M2 | Medio | El alta enlazaba donaciones por email **antes** de confirmar el correo (robo/bloqueo de datos de una víctima). | El enlace por email sólo ocurre con **email probado**: sesión activa en el alta, o al iniciar sesión. Sin sesión, no se enlaza. |
| M3 | Medio | `/api/track`: escritura `service_role` sin autenticar, sin límite de tasa ni validación. | Límite de tasa por cliente (60/min) + validación Zod del cuerpo (`event_type` enum, `project_id` UUID). |
| L1 | Bajo | La exportación CSV de PII la podía descargar un rol `viewer`. | La exportación masiva exige `editor+` (menor privilegio). |
| L2 | Bajo | Secreto de webhook por defecto (`dev-mock-secret`) al no estar definido. | Un proveedor **real** (Stripe/PayPal) aborta si falta `PAYMENT_WEBHOOK_SECRET` (fail-closed). |
| — | Bajo | `locale` provisto por el cliente interpolado en redirecciones. | Allowlist `safeLocale()` en todas las acciones de auth/cuenta; `donationId` validado como UUID. |

## Matriz de control de acceso (resumen)

| Entrada | Guardia |
|---|---|
| Acciones admin (proyectos, traducciones, datos) | `requireEditorClient` (editor+) + RLS `is_editor()` + auditoría |
| Exportación CSV donaciones | `editor+` + RLS |
| Reembolso | `editor+` + RLS `donations_update_admin` + auditoría |
| Recibo PDF / export GDPR / borrado GDPR | Cliente SSR autenticado + RLS `donations_select_own` / `donor_select` |
| Gestión de suscripción | Propiedad verificada + RLS |
| Conversión post-donación | Cookie de propiedad de la donación + límite de tasa |
| Webhook de pago | Firma HMAC-SHA256 (comparación de tiempo constante) + idempotencia |
| `/api/track` | Límite de tasa + validación Zod; escritura `service_role` sólo servidor |

## Cabeceras de seguridad

`Content-Security-Policy` estricta (bloquea scripts externos, `object-src 'none'`,
`frame-ancestors 'none'`, `base-uri 'self'`, `form-action 'self'`, `connect-src`
limitado al propio origen y a Supabase), más HSTS con preload, `X-Frame-Options:
DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy` y `Permissions-Policy`
restrictivas. `script-src 'unsafe-inline'` es un residuo aceptado y documentado:
Next App Router inyecta scripts de arranque en línea y no se propaga un nonce a
través del middleware de next-intl; el riesgo real de XSS es mínimo porque la app
**no** renderiza HTML provisto por el usuario.

## Base de datos

No se añadieron migraciones en las Tandas 11–16; el esquema, la RLS forzada en
todas las tablas y la bitácora inviolable permanecen como se verificaron en la
Tanda 2 (Security Advisor **0 ERROR / 0 WARN**). Las nuevas rutas de escritura
(acciones admin) pasan por el cliente SSR autenticado, de modo que la RLS
existente las cubre sin cambios de esquema.

## Residuos conocidos y guía operativa

- **`confirmMockPayment`** permite completar donaciones de prueba sin pago: es el
  simulador (MockProvider) y se **auto-desactiva** con un proveedor real. Sin
  riesgo económico en la fase mock.
- **Gestión de administradores:** promover siempre desde el panel o por SQL tras
  el registro. No añadir a `SUPERADMIN_EMAILS` correos aún no registrados.
- **Límite de tasa en memoria:** best-effort por instancia (Sección 9.6);
  suficiente para frenar ráfagas. Endurecer con un store distribuido
  (Upstash/Redis) si el tráfico lo justifica.

## Verificación

`pnpm typecheck` ✅ · `pnpm lint` ✅ · `pnpm build` ✅ tras aplicar todas las
correcciones.
