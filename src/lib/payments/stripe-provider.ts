import type {
  PaymentProvider,
  CheckoutParams,
  CheckoutSession,
  SubscriptionParams,
  Subscription,
  RefundResult,
  WebhookEvent,
} from "./types";
import { NotImplementedError } from "./types";

/**
 * Esqueleto de Stripe. Implementa la misma interfaz; se rellena cuando la
 * estructura legal permita operar con Stripe. Nota: Stripe no opera en RD, así
 * que este proveedor puede no ser el elegido. NO importar el SDK de Stripe
 * fuera de este archivo.
 */
export class StripeProvider implements PaymentProvider {
  readonly name = "stripe" as const;

  async createCheckout(_params: CheckoutParams): Promise<CheckoutSession> {
    throw new NotImplementedError(this.name, "createCheckout");
  }
  async createSubscription(
    _params: SubscriptionParams,
  ): Promise<Subscription> {
    throw new NotImplementedError(this.name, "createSubscription");
  }
  async cancelSubscription(_id: string): Promise<void> {
    throw new NotImplementedError(this.name, "cancelSubscription");
  }
  async handleWebhook(
    _payload: string,
    _signature: string,
  ): Promise<WebhookEvent> {
    throw new NotImplementedError(this.name, "handleWebhook");
  }
  async refund(
    _transactionId: string,
    _amountUsd?: number,
  ): Promise<RefundResult> {
    throw new NotImplementedError(this.name, "refund");
  }
}
