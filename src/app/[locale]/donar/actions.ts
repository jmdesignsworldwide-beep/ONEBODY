"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { donationSchema } from "@/lib/validation/donation";
import { getAdminClient } from "@/lib/supabase/admin";
import { getPaymentProvider, MockProvider } from "@/lib/payments";
import { processPaymentWebhook } from "@/lib/payments/process-webhook";
import { rateLimit, clientKey } from "@/lib/rate-limit";
import { addDonationClaim } from "@/lib/donar/claim";

async function originFromHeaders(): Promise<string> {
  const h = await headers();
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (envUrl) return envUrl.replace(/\/$/, "");
  const proto = h.get("x-forwarded-proto") ?? "https";
  const host = h.get("host") ?? "localhost:3000";
  return `${proto}://${host}`;
}

export type CreateDonationResult =
  | { ok: true; checkoutUrl: string }
  | { ok: false; error: string };

/**
 * Crea la donación (pending) y abre el checkout del proveedor. Validación con
 * Zod y rate limiting en el servidor (Sección 9.4/9.6). El sistema SIEMPRE
 * registra quién donó; `is_anonymous` sólo controla la visibilidad pública.
 */
export async function createDonation(
  raw: unknown,
): Promise<CreateDonationResult> {
  const h = await headers();
  const rl = rateLimit(clientKey(h, "donate"), 8, 60_000);
  if (!rl.ok) return { ok: false, error: "Demasiados intentos. Espera un momento." };

  const parsed = donationSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }
  const d = parsed.data;

  const supabase = getAdminClient();
  if (!supabase) return { ok: false, error: "Servicio no disponible temporalmente." };

  const country = h.get("x-vercel-ip-country") ?? null;
  const provider = getPaymentProvider();

  const { data: inserted, error } = await supabase
    .from("donations")
    .insert({
      amount: d.amountUsd,
      amount_usd: d.amountUsd,
      currency: "USD",
      status: "pending",
      is_anonymous: d.isAnonymous,
      is_recurring: d.recurring,
      provider: provider.name,
      project_id: d.projectId ?? null,
      donor_name: d.donorName,
      donor_email: d.donorEmail,
      message: d.message ?? null,
      country_code: country,
    })
    .select("id")
    .single();

  if (error || !inserted) {
    return { ok: false, error: "No se pudo registrar la donación." };
  }
  const donationId = inserted.id as string;
  // Vincula la donación a este navegador para la conversión de un clic (Sección
  // 5.3): sólo quien donó puede crear la cuenta desde /gracias.
  await addDonationClaim(donationId);
  const origin = await originFromHeaders();

  const session = await provider.createCheckout({
    donationId,
    amountUsd: d.amountUsd,
    currency: "USD",
    projectId: d.projectId ?? null,
    donorEmail: d.donorEmail,
    donorName: d.donorName,
    isAnonymous: d.isAnonymous,
    message: d.message ?? undefined,
    locale: d.locale,
    successUrl: `${origin}/${d.locale}/gracias/${donationId}`,
    cancelUrl: `${origin}/${d.locale}/donar`,
  });

  return { ok: true, checkoutUrl: session.url };
}

/**
 * Confirma un pago simulado (solo MockProvider): construye un webhook FIRMADO
 * y lo procesa por la misma ruta que un proveedor real, ejercitando la
 * verificación de firma. Redirige a la página de gracias.
 */
export async function confirmMockPayment(
  donationId: string,
  outcome: "success" | "fail",
  locale: string,
): Promise<void> {
  const provider = getPaymentProvider();
  if (!(provider instanceof MockProvider)) {
    redirect(`/${locale}/gracias/${donationId}`);
  }

  const supabase = getAdminClient();
  let amountUsd = 0;
  if (supabase) {
    const { data } = await supabase
      .from("donations")
      .select("amount_usd")
      .eq("id", donationId)
      .maybeSingle();
    amountUsd = Number(data?.amount_usd ?? 0);
  }

  const { payload, signature } = (provider as MockProvider).buildSignedWebhook(
    outcome === "success" ? "checkout.completed" : "checkout.failed",
    { donationId, amountUsd },
  );
  await processPaymentWebhook(payload, signature);

  redirect(`/${locale}/gracias/${donationId}`);
}
