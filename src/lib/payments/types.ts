// ============================================================================
// ONEBODY · Tanda 8 — Capa de pagos abstraída (Sección 8)
//
// El proveedor de pagos NO está definido todavía (la fundación está en RD y la
// estructura legal está en definición). Ningún componente de UI, endpoint de
// negocio ni lógica de donación importa un SDK de proveedor: todo pasa por la
// interfaz PaymentProvider. Conectar el proveedor real = rellenar una clase y
// cambiar PAYMENT_PROVIDER. Cero refactorización.
// ============================================================================

export type ProviderName = "mock" | "stripe" | "paypal";

export type CheckoutParams = {
  /** Id interno de la donación (Supabase). Sirve de clave de idempotencia. */
  donationId: string;
  amountUsd: number;
  currency: string;
  projectId?: string | null;
  donorEmail?: string;
  donorName?: string;
  isAnonymous?: boolean;
  message?: string;
  locale: string;
  /** URL de retorno tras éxito y tras cancelación. */
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
};

export type CheckoutSession = {
  id: string;
  provider: ProviderName;
  /** URL del checkout alojado al que se redirige al donante. */
  url: string;
  status: "pending";
  expiresAt: string;
};

export type SubscriptionParams = Omit<
  CheckoutParams,
  "successUrl" | "cancelUrl"
> & {
  interval: "month" | "year";
  successUrl: string;
  cancelUrl: string;
};

export type Subscription = {
  id: string;
  provider: ProviderName;
  status: "active" | "paused" | "cancelled";
  interval: "month" | "year";
  amountUsd: number;
  currency: string;
  nextChargeAt: string | null;
};

export type RefundResult = {
  id: string;
  provider: ProviderName;
  status: "refunded" | "failed";
  amountUsd: number;
  /** Referencia externa de la transacción reembolsada. */
  providerRef: string;
};

export type WebhookEventType =
  | "checkout.completed"
  | "checkout.failed"
  | "subscription.created"
  | "subscription.cancelled"
  | "refund.completed";

export type WebhookEvent = {
  /** Id del evento del proveedor. Clave de idempotencia anti-replay. */
  id: string;
  type: WebhookEventType;
  provider: ProviderName;
  /** Referencia interna (donationId o subscriptionId). */
  donationId?: string;
  subscriptionId?: string;
  /** Id de la transacción externa del proveedor. */
  providerRef: string;
  amountUsd?: number;
  createdAt: string;
  raw: unknown;
};

/**
 * Interfaz única de proveedor de pagos (Sección 8). Toda operación de pago del
 * sistema pasa por aquí.
 */
export interface PaymentProvider {
  readonly name: ProviderName;
  createCheckout(params: CheckoutParams): Promise<CheckoutSession>;
  createSubscription(params: SubscriptionParams): Promise<Subscription>;
  cancelSubscription(id: string): Promise<void>;
  /**
   * Verifica la firma del webhook y devuelve el evento tipado. DEBE lanzar si
   * la firma es inválida — sin verificación de firma, sin procesamiento
   * (Sección 9.11). La idempotencia anti-replay se aplica con `event.id`.
   */
  handleWebhook(payload: string, signature: string): Promise<WebhookEvent>;
  refund(transactionId: string, amountUsd?: number): Promise<RefundResult>;
}

/** Error de firma de webhook inválida. */
export class InvalidSignatureError extends Error {
  constructor(message = "Firma de webhook inválida") {
    super(message);
    this.name = "InvalidSignatureError";
  }
}

/** Operación no implementada (esqueletos de proveedores reales). */
export class NotImplementedError extends Error {
  constructor(provider: ProviderName, op: string) {
    super(`${provider}: ${op} aún no implementado`);
    this.name = "NotImplementedError";
  }
}
