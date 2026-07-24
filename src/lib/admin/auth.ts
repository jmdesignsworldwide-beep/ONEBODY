import "server-only";
import type { User } from "@supabase/supabase-js";
import { getAdminClient } from "@/lib/supabase/admin";
import { getCurrentUser } from "@/lib/supabase/server-auth";

export type AdminRole = "superadmin" | "editor" | "viewer";

/**
 * Correos que se auto-provisionan como superadmin la primera vez que entran al
 * panel. Se controla EXCLUSIVAMENTE por variable de entorno del servidor
 * (SUPERADMIN_EMAILS, separada por comas) — nunca desde el cliente ni desde la
 * base. Es el único mecanismo de arranque; luego un superadmin gestiona el resto
 * de administradores desde el panel. No es un secreto, pero vive fuera del repo.
 */
function bootstrapEmails(): string[] {
  return (process.env.SUPERADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

/**
 * Rol admin del usuario indicado (o null si no es administrador). Lee
 * admin_users con el cliente service_role (server-only) porque la política RLS
 * de esa tabla es superadmin-only y un editor no podría leer su propia fila.
 * Si el correo está en SUPERADMIN_EMAILS y aún no existe fila, lo provisiona
 * como superadmin (arranque del primer administrador).
 */
export async function getAdminRole(
  user: User | null,
): Promise<AdminRole | null> {
  if (!user) return null;
  const admin = getAdminClient();
  if (!admin) return null;

  const { data } = await admin
    .from("admin_users")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (data?.role) return data.role as AdminRole;

  // Arranque del PRIMER administrador únicamente. Una vez existe cualquier admin,
  // este atajo por variable de entorno queda inerte: la gestión de roles pasa a
  // hacerse desde el panel. Así, aunque un correo de SUPERADMIN_EMAILS aún no
  // esté registrado, nadie puede auto-elevarse a superadmin si ya hay un admin
  // (cierra la escalada por creación de cuenta con email forjado).
  const email = user.email?.toLowerCase();
  if (email && bootstrapEmails().includes(email)) {
    const { count } = await admin
      .from("admin_users")
      .select("id", { count: "exact", head: true });
    if ((count ?? 0) === 0) {
      const { error } = await admin
        .from("admin_users")
        .insert({ id: user.id, role: "superadmin", created_by: user.id });
      if (!error) return "superadmin";
    }
  }
  return null;
}

/** Rol admin del usuario autenticado actual (o null). */
export async function getCurrentAdminRole(): Promise<AdminRole | null> {
  const user = await getCurrentUser();
  return getAdminRole(user);
}

/** true si el rol puede editar contenido (superadmin o editor). */
export function canEdit(role: AdminRole | null): boolean {
  return role === "superadmin" || role === "editor";
}
