import "server-only";
import { getServerAuthClient } from "@/lib/supabase/server-auth";
import type { ProjectCategory } from "@/lib/supabase/types";

export type Point = { label: string; value: number };
export type DayPoint = { date: string; value: number };

export type Analytics = {
  totalRaised: number;
  donationCount: number;
  avgGift: number;
  recurringShare: number; // 0..1
  byCategory: Point[];
  byCountry: Point[];
  raisedByDay: DayPoint[];
  // Tráfico
  pageviews: number;
  sessions: number;
  conversion: number; // donaciones completadas / sesiones
  topPaths: Point[];
  trafficByCountry: Point[];
  trafficByLocale: Point[];
  hasTraffic: boolean;
};

type DonationRow = {
  amount_usd: number;
  is_recurring: boolean;
  country_code: string | null;
  created_at: string;
  projects: { category: ProjectCategory } | null;
};

type AnalyticsRow = {
  path: string | null;
  locale: string | null;
  country_code: string | null;
  session_id: string | null;
  created_at: string;
};

const DAYS = 30;

function dayKey(iso: string): string {
  return iso.slice(0, 10);
}

function topN(counts: Map<string, number>, n: number): Point[] {
  return [...counts.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, n);
}

const EMPTY: Analytics = {
  totalRaised: 0,
  donationCount: 0,
  avgGift: 0,
  recurringShare: 0,
  byCategory: [],
  byCountry: [],
  raisedByDay: [],
  pageviews: 0,
  sessions: 0,
  conversion: 0,
  topPaths: [],
  trafficByCountry: [],
  trafficByLocale: [],
  hasTraffic: false,
};

/** Agregados de analítica a partir de datos reales (RLS admin). Agrega en JS
 *  para no introducir vistas/RPC security-definer (Advisor limpio). */
export async function getAnalytics(): Promise<Analytics> {
  const supabase = await getServerAuthClient();
  if (!supabase) return EMPTY;

  const since = new Date(Date.now() - DAYS * 24 * 60 * 60 * 1000).toISOString();

  const [donRes, anaRes] = await Promise.all([
    supabase
      .from("donations")
      .select("amount_usd, is_recurring, country_code, created_at, projects ( category )")
      .eq("status", "completed")
      .order("created_at", { ascending: false })
      .limit(5000),
    supabase
      .from("site_analytics")
      .select("path, locale, country_code, session_id, created_at")
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .limit(20000),
  ]);

  const donations = (donRes.data as DonationRow[] | null) ?? [];
  const traffic = (anaRes.data as AnalyticsRow[] | null) ?? [];

  // Donaciones
  let totalRaised = 0;
  let recurring = 0;
  const byCategory = new Map<string, number>();
  const byCountry = new Map<string, number>();
  const byDay = new Map<string, number>();
  for (const d of donations) {
    const amt = Number(d.amount_usd);
    totalRaised += amt;
    if (d.is_recurring) recurring += 1;
    const cat = d.projects?.category ?? "general";
    byCategory.set(cat, (byCategory.get(cat) ?? 0) + amt);
    if (d.country_code)
      byCountry.set(d.country_code, (byCountry.get(d.country_code) ?? 0) + amt);
  }

  // Serie diaria de los últimos DAYS días
  for (let i = DAYS - 1; i >= 0; i--) {
    const key = dayKey(
      new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
    );
    byDay.set(key, 0);
  }
  for (const d of donations) {
    const key = dayKey(d.created_at);
    if (byDay.has(key)) byDay.set(key, (byDay.get(key) ?? 0) + Number(d.amount_usd));
  }

  // Tráfico
  const sessions = new Set<string>();
  const paths = new Map<string, number>();
  const trafficCountry = new Map<string, number>();
  const trafficLocale = new Map<string, number>();
  for (const a of traffic) {
    if (a.session_id) sessions.add(a.session_id);
    if (a.path) paths.set(a.path, (paths.get(a.path) ?? 0) + 1);
    if (a.country_code)
      trafficCountry.set(
        a.country_code,
        (trafficCountry.get(a.country_code) ?? 0) + 1,
      );
    if (a.locale)
      trafficLocale.set(a.locale, (trafficLocale.get(a.locale) ?? 0) + 1);
  }

  const donationCount = donations.length;
  const sessionCount = sessions.size;

  return {
    totalRaised,
    donationCount,
    avgGift: donationCount > 0 ? totalRaised / donationCount : 0,
    recurringShare: donationCount > 0 ? recurring / donationCount : 0,
    byCategory: topN(byCategory, 8),
    byCountry: topN(byCountry, 8),
    raisedByDay: [...byDay.entries()].map(([date, value]) => ({ date, value })),
    pageviews: traffic.length,
    sessions: sessionCount,
    conversion: sessionCount > 0 ? donationCount / sessionCount : 0,
    topPaths: topN(paths, 8),
    trafficByCountry: topN(trafficCountry, 8),
    trafficByLocale: topN(trafficLocale, 15),
    hasTraffic: traffic.length > 0,
  };
}
