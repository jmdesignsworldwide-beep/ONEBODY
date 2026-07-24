import "server-only";
import { getServerAuthClient } from "./supabase/server-auth";

export type MyProfile = {
  display_name: string | null;
  preferred_locale: string;
  country_code: string | null;
  total_donated_usd: number;
  donation_count: number;
  first_donation_at: string | null;
  show_publicly: boolean;
  email_updates: boolean;
  created_at: string;
};

export type MyDonation = {
  id: string;
  amount_usd: number;
  currency: string;
  status: string;
  is_recurring: boolean;
  project_id: string | null;
  created_at: string;
  completed_at: string | null;
};

export type MySubscription = {
  id: string;
  amount: number;
  currency: string;
  interval: string;
  status: string;
  next_charge_at: string | null;
};

export async function getMyProfile(): Promise<MyProfile | null> {
  const supabase = await getServerAuthClient();
  if (!supabase) return null;
  const { data } = await supabase
    .from("donor_profiles")
    .select(
      "display_name, preferred_locale, country_code, total_donated_usd, donation_count, first_donation_at, show_publicly, email_updates, created_at",
    )
    .maybeSingle();
  return (data as MyProfile | null) ?? null;
}

export async function getMyDonations(): Promise<MyDonation[]> {
  const supabase = await getServerAuthClient();
  if (!supabase) return [];
  const { data } = await supabase
    .from("donations")
    .select(
      "id, amount_usd, currency, status, is_recurring, project_id, created_at, completed_at",
    )
    .order("created_at", { ascending: false });
  return (data as MyDonation[] | null) ?? [];
}

/** Proyectos que el donante ha apoyado, con su avance más reciente. */
export async function getMySupportedProjects() {
  const supabase = await getServerAuthClient();
  if (!supabase) return [];
  const { data: donations } = await supabase
    .from("donations")
    .select("project_id")
    .eq("status", "completed")
    .not("project_id", "is", null);
  const ids = Array.from(
    new Set((donations ?? []).map((d) => d.project_id as string)),
  );
  if (ids.length === 0) return [];
  const { data: projects } = await supabase
    .from("projects")
    .select(
      "id, slug, title_es, category, location_name, location_lat, location_lng, goal_amount, raised_amount, cover_image",
    )
    .in("id", ids);
  return projects ?? [];
}

export async function getMySubscriptions(): Promise<MySubscription[]> {
  const supabase = await getServerAuthClient();
  if (!supabase) return [];
  const { data } = await supabase
    .from("subscriptions")
    .select("id, amount, currency, interval, status, next_charge_at")
    .order("started_at", { ascending: false });
  return (data as MySubscription[] | null) ?? [];
}
