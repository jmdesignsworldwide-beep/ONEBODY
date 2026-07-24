import "server-only";
import { headers } from "next/headers";

/** Origen (protocolo+host) del sitio, desde env o cabeceras. Server-only. */
export async function getOrigin(): Promise<string> {
  const env = process.env.NEXT_PUBLIC_SITE_URL;
  if (env) return env.replace(/\/$/, "");
  const h = await headers();
  const proto = h.get("x-forwarded-proto") ?? "https";
  const host = h.get("host") ?? "localhost:3000";
  return `${proto}://${host}`;
}
