import { NextResponse } from "next/server";
import { processPaymentWebhook } from "@/lib/payments/process-webhook";
import { InvalidSignatureError } from "@/lib/payments";
import { rateLimit, clientKey } from "@/lib/rate-limit";

export const runtime = "nodejs";

/**
 * Endpoint de webhooks de pago (Sección 9.11). Rate limit agresivo, firma
 * obligatoria, idempotencia en el procesador. Sin firma válida, 400.
 */
export async function POST(req: Request) {
  const rl = rateLimit(clientKey(req.headers, "webhook"), 60, 60_000);
  if (!rl.ok) {
    return new NextResponse("Too Many Requests", { status: 429 });
  }

  const signature = req.headers.get("x-ob-signature") ?? "";
  const body = await req.text();

  try {
    const event = await processPaymentWebhook(body, signature);
    return NextResponse.json({ received: true, id: event.id });
  } catch (e) {
    if (e instanceof InvalidSignatureError) {
      return new NextResponse("Invalid signature", { status: 400 });
    }
    return new NextResponse("Webhook error", { status: 400 });
  }
}
