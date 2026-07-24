import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Firma HMAC-SHA256 de webhooks. Server-only. La verificación es de tiempo
 * constante para evitar timing attacks. El secreto vive en PAYMENT_WEBHOOK_SECRET
 * (nunca en el cliente).
 */
export function signPayload(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload, "utf8").digest("hex");
}

export function verifySignature(
  payload: string,
  signature: string,
  secret: string,
): boolean {
  const expected = signPayload(payload, secret);
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(signature, "utf8");
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
