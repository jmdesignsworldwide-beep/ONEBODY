import "server-only";
import { getServerAuthClient } from "@/lib/supabase/server-auth";
import type {
  ProjectCategory,
  ProjectStatus,
  BudgetItem,
} from "@/lib/supabase/types";

export type AdminProjectRow = {
  id: string;
  slug: string;
  status: ProjectStatus;
  title_es: string;
  category: ProjectCategory;
  goal_amount: number;
  raised_amount: number;
  currency: string;
  featured: boolean;
  sort_order: number;
  updated_at: string;
};

export type AdminProjectDetail = AdminProjectRow & {
  summary_es: string;
  story_es: string;
  cover_image: string | null;
  location_name: string | null;
  location_lat: number | null;
  location_lng: number | null;
  deadline: string | null;
};

export type AdminUpdateRow = {
  id: string;
  title_es: string;
  body_es: string;
  published_at: string | null;
  created_at: string;
};

const LIST_COLUMNS =
  "id, slug, status, title_es, category, goal_amount, raised_amount, currency, featured, sort_order, updated_at";

/** Todos los proyectos (cualquier estado). RLS: sólo admin ve borradores. */
export async function listAdminProjects(): Promise<AdminProjectRow[]> {
  const supabase = await getServerAuthClient();
  if (!supabase) return [];
  const { data } = await supabase
    .from("projects")
    .select(LIST_COLUMNS)
    .order("sort_order", { ascending: true })
    .order("updated_at", { ascending: false });
  return (data as AdminProjectRow[] | null) ?? [];
}

/** Un proyecto completo para edición (o null). */
export async function getAdminProject(
  id: string,
): Promise<AdminProjectDetail | null> {
  const supabase = await getServerAuthClient();
  if (!supabase) return null;
  const { data } = await supabase
    .from("projects")
    .select(
      `${LIST_COLUMNS}, summary_es, story_es, cover_image, location_name, location_lat, location_lng, deadline`,
    )
    .eq("id", id)
    .maybeSingle();
  return (data as AdminProjectDetail | null) ?? null;
}

/** Partidas presupuestarias de un proyecto, ordenadas. */
export async function getProjectBudget(
  projectId: string,
): Promise<BudgetItem[]> {
  const supabase = await getServerAuthClient();
  if (!supabase) return [];
  const { data } = await supabase
    .from("project_budget_items")
    .select("id, label_es, amount, sort_order")
    .eq("project_id", projectId)
    .order("sort_order", { ascending: true });
  return (data as BudgetItem[] | null) ?? [];
}

/** Bitácora de avances de un proyecto (todas, publicadas o no). */
export async function getProjectUpdates(
  projectId: string,
): Promise<AdminUpdateRow[]> {
  const supabase = await getServerAuthClient();
  if (!supabase) return [];
  const { data } = await supabase
    .from("project_updates")
    .select("id, title_es, body_es, published_at, created_at")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });
  return (data as AdminUpdateRow[] | null) ?? [];
}
