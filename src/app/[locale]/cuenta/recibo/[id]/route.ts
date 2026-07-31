import { NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { getServerAuthClient, getCurrentUser } from "@/lib/supabase/server-auth";
import { getAdminClient } from "@/lib/supabase/admin";
import { hasDonationClaim } from "@/lib/donar/claim";

export const runtime = "nodejs";

const DONATION_COLS =
  "id, amount_usd, currency, status, donor_name, donor_email, completed_at, created_at, project_id";

type ReceiptRow = {
  id: string;
  amount_usd: number | string;
  currency: string;
  status: string;
  donor_name: string | null;
  donor_email: string | null;
  completed_at: string | null;
  created_at: string;
  project_id: string | null;
};

/**
 * Recibo de donación en PDF. Accesible de dos formas:
 *  - Donante CON sesión: RLS garantiza que solo lee sus propias donaciones.
 *  - Invitado que acaba de donar: prueba de propiedad por el claim del navegador
 *    (el mismo mecanismo de la conversión de un clic). Así puede descargar su
 *    recibo desde /gracias sin haber creado cuenta.
 */
export async function GET(
  req: Request,
  ctx: { params: Promise<{ locale: string; id: string }> },
) {
  const { locale, id } = await ctx.params;

  let d: ReceiptRow | null = null;

  // 1) Donante con sesión (RLS: solo la suya).
  const user = await getCurrentUser();
  if (user) {
    const supabase = await getServerAuthClient();
    if (supabase) {
      const { data } = await supabase
        .from("donations")
        .select(DONATION_COLS)
        .eq("id", id)
        .maybeSingle();
      d = (data as unknown as ReceiptRow | null) ?? null;
    }
  }

  // 2) Invitado con prueba de propiedad (claim del navegador que donó).
  if (!d && (await hasDonationClaim(id))) {
    const admin = getAdminClient();
    if (admin) {
      const { data } = await admin
        .from("donations")
        .select(DONATION_COLS)
        .eq("id", id)
        .maybeSingle();
      d = (data as unknown as ReceiptRow | null) ?? null;
    }
  }

  if (!d) {
    if (!user) return NextResponse.redirect(new URL(`/${locale}/entrar`, req.url));
    return new NextResponse("Not found", { status: 404 });
  }
  if (d.status !== "completed") {
    return new NextResponse("Not found", { status: 404 });
  }

  let projectTitle = "Fondo general";
  if (d.project_id) {
    const admin = getAdminClient();
    const { data: p } = admin
      ? await admin
          .from("projects")
          .select("title_es")
          .eq("id", d.project_id)
          .maybeSingle()
      : { data: null };
    if (p?.title_es) projectTitle = p.title_es as string;
  }

  const doc = await PDFDocument.create();
  const page = doc.addPage([595, 842]);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const bone = rgb(0.08, 0.08, 0.08);
  const smoke = rgb(0.45, 0.45, 0.45);
  const red = rgb(0.878, 0.169, 0.125);
  const M = 56;
  const y = 786;

  page.drawText("ONEB", { x: M, y, size: 26, font: bold, color: bone });
  page.drawCircle({ x: M + 74, y: y + 9, size: 7, color: red });
  page.drawText("DY", { x: M + 86, y, size: 26, font: bold, color: bone });

  page.drawText("Recibo de donacion", {
    x: M,
    y: y - 40,
    size: 14,
    font,
    color: smoke,
  });
  page.drawLine({
    start: { x: M, y: y - 56 },
    end: { x: 539, y: y - 56 },
    thickness: 1,
    color: rgb(0.85, 0.85, 0.85),
  });

  const amount = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: (d.currency as string) || "USD",
  }).format(Number(d.amount_usd));
  const when = new Date(
    (d.completed_at as string) ?? (d.created_at as string),
  ).toISOString().slice(0, 10);

  const rows: [string, string][] = [
    ["Recibo No.", String(d.id)],
    ["Fecha", when],
    ["Donante", (d.donor_name as string) || (d.donor_email as string) || "—"],
    ["Proyecto", projectTitle],
    ["Monto", amount],
    ["Estado", "Completada"],
  ];
  let ry = y - 92;
  for (const [k, v] of rows) {
    page.drawText(k, { x: M, y: ry, size: 11, font, color: smoke });
    page.drawText(v.length > 60 ? v.slice(0, 57) + "..." : v, {
      x: M + 130,
      y: ry,
      size: 11,
      font: bold,
      color: bone,
    });
    ry -= 26;
  }

  page.drawText("Fundacion ONEBODY - Santiago, Republica Dominicana", {
    x: M,
    y: 120,
    size: 10,
    font,
    color: smoke,
  });
  page.drawText("809-820-7812 - @fundaciononebody", {
    x: M,
    y: 104,
    size: 10,
    font,
    color: smoke,
  });
  page.drawText("Disenados para ser UNO - Meant to be ONE", {
    x: M,
    y: 72,
    size: 11,
    font: bold,
    color: bone,
  });

  const bytes = await doc.save();
  return new NextResponse(Buffer.from(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="recibo-onebody-${String(d.id).slice(0, 8)}.pdf"`,
      "Cache-Control": "private, no-store",
    },
  });
}
