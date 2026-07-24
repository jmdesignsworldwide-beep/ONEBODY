import { NextResponse } from "next/server";
import { getServerAuthClient, getCurrentUser } from "@/lib/supabase/server-auth";
import { getAdminRole } from "@/lib/admin/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const STATUSES = ["pending", "completed", "failed", "refunded"];

function csvCell(v: unknown): string {
  const s = v === null || v === undefined ? "" : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

type Row = {
  created_at: string;
  status: string;
  amount: number;
  currency: string;
  amount_usd: number;
  is_anonymous: boolean;
  is_recurring: boolean;
  provider: string;
  donor_name: string | null;
  donor_email: string | null;
  country_code: string | null;
  projects: { title_es: string } | null;
};

/** Exportación CSV de donaciones (contabilidad). Sólo admin; RLS lo respalda. */
export async function GET(
  req: Request,
  ctx: { params: Promise<{ locale: string }> },
) {
  const { locale } = await ctx.params;
  const user = await getCurrentUser();
  const role = await getAdminRole(user);
  if (!role) return NextResponse.redirect(new URL(`/${locale}/entrar`, req.url));

  const supabase = await getServerAuthClient();
  if (!supabase) return new NextResponse("Unavailable", { status: 503 });

  const url = new URL(req.url);
  const status = url.searchParams.get("status");
  let q = supabase
    .from("donations")
    .select(
      "created_at, status, amount, currency, amount_usd, is_anonymous, is_recurring, provider, donor_name, donor_email, country_code, projects ( title_es )",
    )
    .order("created_at", { ascending: false })
    .limit(5000);
  if (status && STATUSES.includes(status)) q = q.eq("status", status);

  const { data } = await q;
  const rows = (data as Row[] | null) ?? [];

  const header = [
    "fecha",
    "estado",
    "monto",
    "moneda",
    "monto_usd",
    "recurrente",
    "anonimo",
    "proveedor",
    "donante",
    "email",
    "pais",
    "proyecto",
  ];
  const lines = [header.join(",")];
  for (const r of rows) {
    lines.push(
      [
        r.created_at,
        r.status,
        r.amount,
        r.currency,
        r.amount_usd,
        r.is_recurring ? "si" : "no",
        r.is_anonymous ? "si" : "no",
        r.provider,
        r.donor_name,
        r.donor_email,
        r.country_code,
        r.projects?.title_es ?? "",
      ]
        .map(csvCell)
        .join(","),
    );
  }

  return new NextResponse(lines.join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="donaciones-onebody.csv"',
      "Cache-Control": "private, no-store",
    },
  });
}
