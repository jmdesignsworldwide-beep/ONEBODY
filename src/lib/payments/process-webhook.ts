import "server-only";
import { getPaymentProvider } from "./index";
import { getAdminClient } from "../supabase/admin";
import { ensureSubscriptionForDonation } from "./subscriptions";
import type { WebhookEvent } from "./types";

/**
 * Procesa un webhook de pago de punta a punta. Verifica la firma vía el
 * proveedor (lanza si es inválida — sin firma, sin proceso, Sección 9.11) y
 * aplica el efecto de forma IDEMPOTENTE: la transición sólo ocurre si la
 * donación sigue `pending`, así un reenvío del mismo evento no duplica nada.
 * Al completar, los triggers de la base recalculan meta, stats y muro.
 */
export async function processPaymentWebhook(
  payload: string,
  signature: string,
): Promise<WebhookEvent> {
  const provider = getPaymentProvider();
  const event = await provider.handleWebhook(payload, signature);

  const supabase = getAdminClient();
  if (!supabase) throw new Error("Supabase no configurado (service_role).");

  if (event.donationId) {
    if (event.type === "checkout.completed") {
      await supabase
        .from("donations")
        .update({
          status: "completed",
          provider_ref: event.providerRef,
          completed_at: event.createdAt,
        })
        .eq("id", event.donationId)
        .eq("status", "pending");
      // Donación recurrente con cuenta → crea/enlaza su suscripción (idempotente).
      await ensureSubscriptionForDonation(event.donationId);
    } else if (event.type === "checkout.failed") {
      await supabase
        .from("donations")
        .update({ status: "failed" })
        .eq("id", event.donationId)
        .eq("status", "pending");
    }
  }

  return event;
}
