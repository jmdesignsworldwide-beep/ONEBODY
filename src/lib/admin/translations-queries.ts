import "server-only";
import { getServerAuthClient } from "@/lib/supabase/server-auth";

export type ProjectTranslation = {
  locale: string;
  title: string;
  summary: string;
  story: string;
  is_machine_translated: boolean;
  reviewed: boolean;
  updated_at: string | null;
};

type Row = {
  locale: string;
  title: string | null;
  summary: string | null;
  story: string | null;
  is_machine_translated: boolean;
  reviewed_by: string | null;
  updated_at: string | null;
};

/**
 * Traducciones existentes de un proyecto, indexadas por locale. RLS permite al
 * admin leerlas. El texto base en español vive en la propia fila del proyecto,
 * no aquí.
 */
export async function getProjectTranslations(
  projectId: string,
): Promise<Record<string, ProjectTranslation>> {
  const supabase = await getServerAuthClient();
  if (!supabase) return {};
  const { data } = await supabase
    .from("project_translations")
    .select("locale, title, summary, story, is_machine_translated, reviewed_by, updated_at")
    .eq("project_id", projectId);

  const out: Record<string, ProjectTranslation> = {};
  for (const r of (data as Row[] | null) ?? []) {
    out[r.locale] = {
      locale: r.locale,
      title: r.title ?? "",
      summary: r.summary ?? "",
      story: r.story ?? "",
      is_machine_translated: r.is_machine_translated,
      reviewed: r.reviewed_by !== null,
      updated_at: r.updated_at,
    };
  }
  return out;
}
