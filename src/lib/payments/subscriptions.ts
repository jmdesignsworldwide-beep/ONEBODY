import "server-only";
import { getAdminClient } from "@/lib/supabase/admin";
import { getPaymentProvider } from "./index";

/**
 * Crea la suscripción de una donación recurrente COMPLETADA (idempotente).
 *
 * La tabla `subscriptions` referencia `donor_profiles` (donor_id NOT NULL): solo
 * un donante CON cuenta puede tener una suscripción. Para donaciones recurrentes
 * de invitado, la fila no se crea aquí; se materializa cuando el donante crea su
 * cuenta desde /gracias (createAccountFromDonationAction), que vuelve a invocar
 * esta función una vez que la donación ya tiene donor_id.
 *
 * Idempotente: no hace nada si la donación no es recurrente, no está completada,
 * no tiene donor_id, o ya tiene subscription_id.
 */
export async function ensureSubscriptionForDonation(
  donationId: string,
): Promise<void> {
  const supabase = getAdminClient();
  if (!supabase) return;

  const { data: d } = await supabase
    .from("donations")
    .select(
      "id, donor_id, amount_usd, currency, is_recurring, status, subscription_id",
    )
    .eq("id", donationId)
    .maybeSingle();

  if (
    !d ||
    !d.is_recurring ||
    d.status !== "completed" ||
    !d.donor_id ||
    d.subscription_id
  ) {
    return;
  }

  const provider = getPaymentProvider();
  const currency = (d.currency as string) || "USD";
  const sub = await provider.createSubscription({
    donationId: d.id as string,
    amountUsd: Number(d.amount_usd),
    currency,
    interval: "month",
    locale: "es",
    successUrl: "",
    cancelUrl: "",
  });

  const { data: insSub, error } = await supabase
    .from("subscriptions")
    .insert({
      donor_id: d.donor_id,
      amount: Number(d.amount_usd),
      currency,
      interval: sub.interval,
      status: "active",
      provider: provider.name,
      provider_ref: sub.id,
      next_charge_at: sub.nextChargeAt,
    })
    .select("id")
    .single();

  if (error || !insSub) return;

  // Enlaza la donación con su suscripción (sólo si aún no lo estaba: idempotencia).
  await supabase
    .from("donations")
    .update({ subscription_id: insSub.id })
    .eq("id", d.id)
    .is("subscription_id", null);
}
