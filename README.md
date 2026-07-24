# ONEBODY — Plataforma Global de Donaciones

Plataforma de la **Fundación ONEBODY** (Santiago, República Dominicana) para
recibir donaciones y financiar proyectos de vivienda, alimentación, educación,
maternidad y emergencia en 15 idiomas.

> **Diseñados para ser UNO · Meant to be ONE**

Sistema real desplegado en Vercel + Supabase. No es un demo.

## Stack

| Capa | Tecnología |
|------|-----------|
| Framework | Next.js 15 (App Router, Server Components) |
| Lenguaje | TypeScript estricto (`strict`, `noUncheckedIndexedAccess`) |
| Estilos | Tailwind CSS v4 (tokens CSS-first) |
| i18n | next-intl · 15 locales · RTL para árabe |
| Animación | Motion (Framer) + Lenis (smooth scroll) + Canvas 2D |
| Base de datos | Supabase (PostgreSQL + Auth + Storage + RLS) — Tanda 2 |
| Pagos | Capa abstraída con MockProvider — Tanda 8 |
| Deploy | Vercel |

**Node 20+ · pnpm.**

## Desarrollo

```bash
pnpm install
cp .env.example .env.local   # rellenar valores reales (nunca commitear)
pnpm dev                     # http://localhost:3000
```

Scripts: `pnpm build`, `pnpm start`, `pnpm lint`, `pnpm typecheck`.

## Estado de construcción

El sistema se construye por tandas (ver `onebodyappPROMPT_1.md`, Sección 12).

- [x] **Tanda 1 — Fundación:** Next.js 15 + TS estricto, tokens de diseño
      ONEBODY, routing por locale (15 idiomas, RTL-ready), Lenis, cabeceras de
      seguridad base, PWA base (manifest + service worker), landing con teaser
      del nodo de convergencia. Build, typecheck, lint y `pnpm audit` limpios.
- [ ] Tanda 2 — Base de datos (esquema, RLS + FORCE, bitácora inviolable)
- [ ] Tanda 3 — i18n completo (15 archivos de mensajes, selector, detección)
- [ ] Tanda 4 — Sistema de diseño
- [ ] Tanda 5 — Sistema de convergencia (elemento firma)
- [ ] … (ver prompt maestro)

## Seguridad

La seguridad es obligatoria desde la línea uno (Sección 9). La clave
`service_role` es exclusivamente server-side y nunca lleva prefijo
`NEXT_PUBLIC_`. `.env*` está en `.gitignore` desde el primer commit.

---

Diseñado por **JM Nexus Designs** ·
[email](mailto:jm.nexus.designs@gmail.com) ·
[WhatsApp](https://wa.me/18494421919) ·
[Instagram](https://instagram.com/jm.nexus.designs)
