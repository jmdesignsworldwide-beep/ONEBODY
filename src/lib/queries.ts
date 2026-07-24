import { getPublicServerClient } from "./supabase/server";
import type {
  PublicStats,
  WallEntry,
  FeaturedProject,
  ProjectFull,
  BudgetItem,
  ProjectUpdate,
} from "./supabase/types";

const PROJECT_COLS =
  "id, slug, title_es, summary_es, goal_amount, raised_amount, currency, category, cover_image, location_name";

const EMPTY_STATS: PublicStats = {
  total_raised_usd: 0,
  donation_count: 0,
  donor_count: 0,
  country_count: 0,
  active_projects: 0,
  completed_projects: 0,
  updated_at: new Date(0).toISOString(),
};

/** Agregados públicos para los contadores del hero. */
export async function getPublicStats(): Promise<PublicStats> {
  const supabase = getPublicServerClient();
  if (!supabase) return EMPTY_STATS;
  const { data } = await supabase
    .from("public_stats")
    .select(
      "total_raised_usd, donation_count, donor_count, country_count, active_projects, completed_projects, updated_at",
    )
    .maybeSingle();
  return (data as PublicStats | null) ?? EMPTY_STATS;
}

/** Proyectos destacados (máximo 3). Sólo lee lo que RLS expone (publicados). */
export async function getFeaturedProjects(): Promise<FeaturedProject[]> {
  const supabase = getPublicServerClient();
  if (!supabase) return [];
  const { data } = await supabase
    .from("projects")
    .select(
      "id, slug, title_es, summary_es, goal_amount, raised_amount, currency, category, cover_image, location_name",
    )
    .eq("featured", true)
    .in("status", ["active", "funded", "completed"])
    .order("sort_order", { ascending: true })
    .limit(3);
  return (data as FeaturedProject[] | null) ?? [];
}

/** Todos los proyectos publicados, para el índice. */
export async function getPublishedProjects(): Promise<FeaturedProject[]> {
  const supabase = getPublicServerClient();
  if (!supabase) return [];
  const { data } = await supabase
    .from("projects")
    .select(PROJECT_COLS)
    .in("status", ["active", "funded", "completed"])
    .order("sort_order", { ascending: true });
  return (data as FeaturedProject[] | null) ?? [];
}

export type ProjectDetail = {
  project: ProjectFull;
  budget: BudgetItem[];
  updates: ProjectUpdate[];
  donors: WallEntry[];
} | null;

/** Detalle completo de un proyecto por slug: historia, presupuesto, avances y
 *  donantes recientes. Devuelve null si no existe o no es público. */
export async function getProjectDetail(slug: string): Promise<ProjectDetail> {
  const supabase = getPublicServerClient();
  if (!supabase) return null;

  const { data: project } = await supabase
    .from("projects")
    .select(`${PROJECT_COLS}, story_es, status, deadline`)
    .eq("slug", slug)
    .in("status", ["active", "funded", "completed"])
    .maybeSingle();
  if (!project) return null;
  const p = project as ProjectFull;

  const [budgetRes, updatesRes, donorsRes] = await Promise.all([
    supabase
      .from("project_budget_items")
      .select("id, label_es, amount, sort_order")
      .eq("project_id", p.id)
      .order("sort_order", { ascending: true }),
    supabase
      .from("project_updates")
      .select("id, title_es, body_es, images, published_at")
      .eq("project_id", p.id)
      .not("published_at", "is", null)
      .order("published_at", { ascending: false }),
    supabase
      .from("public_wall")
      .select(
        "id, display_name, amount_usd, project_id, project_title, message, country_code, created_at",
      )
      .eq("project_id", p.id)
      .order("created_at", { ascending: false })
      .limit(8),
  ]);

  return {
    project: p,
    budget: (budgetRes.data as BudgetItem[] | null) ?? [],
    updates: (updatesRes.data as ProjectUpdate[] | null) ?? [],
    donors: (donorsRes.data as WallEntry[] | null) ?? [],
  };
}

/** Entradas recientes del muro de donantes. */
export async function getWallEntries(limit = 12): Promise<WallEntry[]> {
  const supabase = getPublicServerClient();
  if (!supabase) return [];
  const { data } = await supabase
    .from("public_wall")
    .select(
      "id, display_name, amount_usd, project_id, project_title, message, country_code, created_at",
    )
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data as WallEntry[] | null) ?? [];
}
