import { NextResponse } from "next/server";
import { createHash, randomUUID } from "node:crypto";
import { cookies, headers } from "next/headers";
import { getAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

/**
 * Registro de analítica de tráfico (Sección 9.12): SIN IP cruda. Deriva país /
 * región / ciudad de las cabeceras de geolocalización de Vercel, hashea el
 * user-agent (nunca se guarda en claro) y usa un id de sesión anónimo en
 * cookie. La inserción usa service_role (sólo servidor); anon/authenticated no
 * pueden escribir en site_analytics.
 */
export async function POST(req: Request) {
  let body: {
    path?: string;
    locale?: string;
    event_type?: string;
    project_id?: string | null;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const admin = getAdminClient();
  if (!admin) return NextResponse.json({ ok: true }); // sin llaves: no rompe

  const h = await headers();
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

  const path = (body.path ?? "").slice(0, 512);
  await admin.from("site_analytics").insert({
    event_type: (body.event_type ?? "pageview").slice(0, 40),
    path,
    locale: (body.locale ?? "").slice(0, 5) || null,
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
