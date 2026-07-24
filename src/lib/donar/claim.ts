import "server-only";
import { cookies } from "next/headers";

/**
 * Vínculo de "propiedad" de una donación con el navegador que la hizo. La
 * conversión de un clic (Sección 5.3) sólo debe permitirse a quien realmente
 * donó — no a un tercero que obtenga la URL de /gracias/{id}. Guardamos los ids
 * de las donaciones creadas en una cookie httpOnly firmada por el navegador
 * (no accesible por JS) y exigimos coincidencia al convertir. Esto cierra el
 * secuestro de cuenta por URL filtrada y la conversión de donaciones ajenas.
 */
const COOKIE = "ob_claim";
const MAX = 5;

export async function addDonationClaim(donationId: string): Promise<void> {
  const store = await cookies();
  const current = (store.get(COOKIE)?.value ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const next = [donationId, ...current.filter((id) => id !== donationId)].slice(
    0,
    MAX,
  );
  store.set(COOKIE, next.join(","), {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    maxAge: 60 * 60 * 24 * 2, // 48h: ventana de conversión post-donación
    path: "/",
  });
}

export async function hasDonationClaim(donationId: string): Promise<boolean> {
  const store = await cookies();
  return (store.get(COOKIE)?.value ?? "")
    .split(",")
    .map((s) => s.trim())
    .includes(donationId);
}
