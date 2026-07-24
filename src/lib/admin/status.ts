import type { ProjectStatus } from "@/lib/supabase/types";

/**
 * Espejo en cliente/servidor de la función SQL `public.project_is_public`:
 * un proyecto es visible al público cuando su estado es activo, financiado o
 * completado. La verdad la impone RLS en la base; esto sólo decide qué enlaces
 * mostrar en el panel.
 */
export function project_is_public_client(status: ProjectStatus): boolean {
  return status === "active" || status === "funded" || status === "completed";
}
