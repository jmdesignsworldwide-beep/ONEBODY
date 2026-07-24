import "server-only";

/**
 * Rate limiting server-side por clave (IP o usuario), ventana deslizante en
 * memoria (Sección 9.6). Best-effort: en serverless es por-instancia; el
 * endurecimiento con un store distribuido (Upstash/Redis) llega en la Tanda 16.
 * Aun así detiene ráfagas abusivas dentro de una misma instancia.
 */
type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): { ok: boolean; retryAfterMs: number } {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || now > b.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfterMs: 0 };
  }
  if (b.count >= limit) {
    return { ok: false, retryAfterMs: b.resetAt - now };
  }
  b.count += 1;
  return { ok: true, retryAfterMs: 0 };
}

/** Deriva una clave de cliente de las cabeceras (sin almacenar IP cruda). */
export function clientKey(headers: Headers, scope: string): string {
  const ip =
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headers.get("x-real-ip") ||
    "unknown";
  return `${scope}:${ip}`;
}
