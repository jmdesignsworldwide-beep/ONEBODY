import { randomUUID } from "node:crypto";
import type {
  PaymentProvider,
  CheckoutParams,
  CheckoutSession,
  SubscriptionParams,
  Subscription,
  RefundResult,
  WebhookEvent,
  WebhookEventType,
} from "./types";
import { InvalidSignatureError } from "./types";
import { signPayload, verifySignature } from "./signature";

/**
 * MockProvider — implementación totalmente funcional que simula el ciclo
 * completo (checkout, éxito, fallo, webhook firmado, suscripción, reembolso)
 * para que todo el sistema sea testeable de punta a punta sin proveedor real.
 */
export class MockProvider implements PaymentProvider {
  readonly name = "mock" as const;
  private readonly secret: string;

  constructor(secret: string) {
    this.secret = secret;
  }

  async createCheckout(params: CheckoutParams): Promise<CheckoutSession> {
    // Id determinista por donación → idempotencia (reintentos no duplican).
    const id = `mock_cs_${params.donationId}`;
    const origin = safeOrigin(params.successUrl);
    // Página de checkout simulado, bajo el locale (real, dentro del middleware).
    const url = `${origin}/${params.locale}/donar/simular/${encodeURIComponent(id)}`;
    return {
      id,
      provider: this.name,
      url,
      status: "pending",
      expiresAt: new Date(Date.now() + 30 * 60_000).toISOString(),
    };
  }

  async createSubscription(params: SubscriptionParams): Promise<Subscription> {
    const next = new Date();
    if (params.interval === "year") next.setFullYear(next.getFullYear() + 1);
    else next.setMonth(next.getMonth() + 1);
    return {
      id: `mock_sub_${params.donationId}`,
      provider: this.name,
      status: "active",
      interval: params.interval,
      amountUsd: params.amountUsd,
      currency: params.currency,
      nextChargeAt: next.toISOString(),
    };
  }

  async cancelSubscription(id: string): Promise<void> {
    // El mock no mantiene estado remoto; la cancelación siempre resuelve.
    void id;
    return;
  }

  async handleWebhook(
    payload: string,
    signature: string,
  ): Promise<WebhookEvent> {
    if (!verifySignature(payload, signature, this.secret)) {
      throw new InvalidSignatureError();
    }
    const parsed = JSON.parse(payload) as WebhookEvent;
    return parsed;
  }

  async refund(
    transactionId: string,
    amountUsd?: number,
  ): Promise<RefundResult> {
    return {
      id: `mock_re_${randomUUID()}`,
      provider: this.name,
      status: "refunded",
      amountUsd: amountUsd ?? 0,
      providerRef: transactionId,
    };
  }

  // ----- Helpers SOLO del mock (no forman parte de la interfaz) -----

  /**
   * Construye un evento de webhook firmado, como lo emitiría un proveedor real.
   * Lo usan la página de checkout simulado y las pruebas para cerrar el ciclo.
   */
  buildSignedWebhook(
    type: WebhookEventType,
    data: {
      donationId?: string;
      subscriptionId?: string;
      providerRef?: string;
      amountUsd?: number;
    },
  ): { payload: string; signature: string; event: WebhookEvent } {
    const event: WebhookEvent = {
      id: `mock_evt_${randomUUID()}`,
      type,
      provider: this.name,
      donationId: data.donationId,
      subscriptionId: data.subscriptionId,
      providerRef: data.providerRef ?? `mock_txn_${randomUUID()}`,
      amountUsd: data.amountUsd,
      createdAt: new Date().toISOString(),
      raw: { simulated: true },
    };
    const payload = JSON.stringify(event);
    return { payload, signature: signPayload(payload, this.secret), event };
  }
}

/** Origen (protocolo+host) de una URL, con fallback seguro. */
function safeOrigin(url: string): string {
  try {
    return new URL(url).origin;
  } catch {
    return "";
  }
}
