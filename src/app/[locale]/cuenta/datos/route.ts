import { NextResponse } from "next/server";
import { getServerAuthClient, getCurrentUser } from "@/lib/supabase/server-auth";

export const runtime = "nodejs";

/**
 * Exportación de datos por solicitud del donante (GDPR, Sección 9.12). Devuelve
 * el perfil y las donaciones del usuario autenticado (RLS garantiza que sólo
 * ve lo suyo) como JSON descargable.
 */
export async function GET(
  req: Request,
  ctx: { params: Promise<{ locale: string }> },
) {
  const { locale } = await ctx.params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.redirect(new URL(`/${locale}/entrar`, req.url));
  const supabase = await getServerAuthClient();
  if (!supabase) return new NextResponse("Unavailable", { status: 503 });

  const [{ data: profile }, { data: donations }, { data: subscriptions }] =
    await Promise.all([
      supabase.from("donor_profiles").select("*").maybeSingle(),
      supabase.from("donations").select("*"),
      supabase.from("subscriptions").select("*"),
    ]);

  const payload = {
    exported_at: new Date().toISOString(),
    account: { id: user.id, email: user.email },
    profile,
    donations,
    subscriptions,
  };

  return new NextResponse(JSON.stringify(payload, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": 'attachment; filename="mis-datos-onebody.json"',
      "Cache-Control": "private, no-store",
    },
  });
}
