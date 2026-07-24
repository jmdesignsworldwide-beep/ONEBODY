import { NextResponse } from "next/server";
import { createHash, randomUUID } from "node:crypto";
import { cookies, headers } from "next/headers";
import { z } from "zod";
import { getAdminClient } from "@/lib/supabase/admin";
import { rateLimit, clientKey } from "@/lib/rate-limit";

export const runtime = "nodejs";

const trackSchema = z.object({
  path: z.string().max(512).optional(),
  locale: z.string().max(5).optional(),
  event_type: z.enum(["pageview"]).optional(),
  project_id: z.string().uuid().nullish(),
});

/**
 * Registro de analítica de tráfico (Sección 9.12): SIN IP cruda. Deriva país /
 * región / ciudad de las cabeceras de geolocalización de Vercel, hashea el
 * user-agent (nunca se guarda en claro) y usa un id de sesión anónimo en
 * cookie. La inserción usa service_role (sólo servidor); anon/authenticated no
 * pueden escribir en site_analytics. Con límite de tasa por cliente y validación
 * Zod del cuerpo para evitar inundación de filas y datos basura.
 */
export async function POST(req: Request) {
  const h = await headers();

  // Límite de tasa: navegación real cabe de sobra en 60 eventos/min por cliente.
  const gate = rateLimit(clientKey(h, "track"), 60, 60_000);
  if (!gate.ok) return NextResponse.json({ ok: false }, { status: 429 });

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const parsed = trackSchema.safeParse(raw);
  if (!parsed.success)
    return NextResponse.json({ ok: false }, { status: 400 });
  const body = parsed.data;

  const admin = getAdminClient();
  if (!admin) return NextResponse.json({ ok: true }); // sin llaves: no rompe

  const ua = h.get("user-agent") ?? "";
  const uaHash = createHash("sha256")
    .update(ua + (process.env.ANALYTICS_SALT ?? "onebody"))
    .digest("hex")
    .slice(0, 32);

  const cookieStore = await cookies();
  let sid = cookieStore.get("ob_sid")?.value;
  const res = NextResponse.json({ ok: true });
  if (!sid) {
    sid = randomUUID();
    res.cookies.set("ob_sid", sid, {
      httpOnly: true,
      sameSite: "lax",
      secure: true,
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });
  }

  await admin.from("site_analytics").insert({
    event_type: body.event_type ?? "pageview",
    path: body.path ?? "",
    locale: body.locale || null,
    country_code: h.get("x-vercel-ip-country"),
    region: h.get("x-vercel-ip-country-region"),
    city: h.get("x-vercel-ip-city"),
    referrer: (h.get("referer") ?? "").slice(0, 512) || null,
    session_id: sid,
    project_id: body.project_id ?? null,
    user_agent_hash: uaHash,
  });

  return res;
}
