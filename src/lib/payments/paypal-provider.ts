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
 * Esqueleto de PayPal. Implementa la misma interfaz; se rellena cuando la
 * estructura legal lo permita. NO importar el SDK de PayPal fuera de este
 * archivo.
 */
export class PayPalProvider implements PaymentProvider {
  readonly name = "paypal" as const;

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
