import "server-only";
import { getServerAuthClient } from "@/lib/supabase/server-auth";
import type { DonationStatus } from "@/lib/supabase/types";

export type AdminDonation = {
  id: string;
  amount: number;
  currency: string;
  amount_usd: number;
  status: DonationStatus;
  is_anonymous: boolean;
  is_recurring: boolean;
  provider: string;
  donor_name: string | null;
  donor_email: string | null;
  message: string | null;
  country_code: string | null;
  created_at: string;
  completed_at: string | null;
  project_id: string | null;
  project_title: string | null;
  project_slug: string | null;
};

type DonationRow = Omit<AdminDonation, "project_title" | "project_slug"> & {
  projects: { title_es: string; slug: string } | null;
};

const PAGE_SIZE = 50;

const DONATION_COLS =
  "id, amount, currency, amount_usd, status, is_anonymous, is_recurring, provider, donor_name, donor_email, message, country_code, created_at, completed_at, project_id, projects ( title_es, slug )";

export type DonationsPage = {
  rows: AdminDonation[];
  page: number;
  hasMore: boolean;
  pageSize: number;
};

/** Donaciones (todas; RLS deja al admin verlas). Filtro opcional por estado. */
export async function listDonations(opts: {
  status?: DonationStatus;
  page?: number;
}): Promise<DonationsPage> {
  const page = Math.max(0, opts.page ?? 0);
  const supabase = await getServerAuthClient();
  if (!supabase) return { rows: [], page, hasMore: false, pageSize: PAGE_SIZE };

  let q = supabase
    .from("donations")
    .select(DONATION_COLS)
    .order("created_at", { ascending: false })
    .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE); // +1 para saber si hay más
  if (opts.status) q = q.eq("status", opts.status);

  const { data } = await q;
  const raw = (data as DonationRow[] | null) ?? [];
  const hasMore = raw.length > PAGE_SIZE;
  const rows = raw.slice(0, PAGE_SIZE).map((r) => ({
    id: r.id,
    amount: r.amount,
    currency: r.currency,
    amount_usd: r.amount_usd,
    status: r.status,
    is_anonymous: r.is_anonymous,
    is_recurring: r.is_recurring,
    provider: r.provider,
    donor_name: r.donor_name,
    donor_email: r.donor_email,
    message: r.message,
    country_code: r.country_code,
    created_at: r.created_at,
    completed_at: r.completed_at,
    project_id: r.project_id,
    project_title: r.projects?.title_es ?? null,
    project_slug: r.projects?.slug ?? null,
  }));
  return { rows, page, hasMore, pageSize: PAGE_SIZE };
}

export type AuditEntry = {
  id: number;
  actor_id: string | null;
  actor_email: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  ip_country: string | null;
  created_at: string;
};

export type AuditPage = {
  rows: AuditEntry[];
  page: number;
  hasMore: boolean;
  pageSize: number;
};

/** Bitácora de auditoría inviolable (sólo lectura; RLS admin). */
export async function listAuditLog(opts: {
  page?: number;
}): Promise<AuditPage> {
  const page = Math.max(0, opts.page ?? 0);
  const supabase = await getServerAuthClient();
  if (!supabase) return { rows: [], page, hasMore: false, pageSize: PAGE_SIZE };

  const { data } = await supabase
    .from("audit_log")
    .select(
      "id, actor_id, actor_email, action, entity_type, entity_id, ip_country, created_at",
    )
    .order("created_at", { ascending: false })
    .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);
  const raw = (data as AuditEntry[] | null) ?? [];
  const hasMore = raw.length > PAGE_SIZE;
  return { rows: raw.slice(0, PAGE_SIZE), page, hasMore, pageSize: PAGE_SIZE };
}
