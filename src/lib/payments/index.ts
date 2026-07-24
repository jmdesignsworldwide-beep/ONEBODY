import "server-only";
import type { PaymentProvider, ProviderName } from "./types";
import { MockProvider } from "./mock-provider";
import { StripeProvider } from "./stripe-provider";
import { PayPalProvider } from "./paypal-provider";

export * from "./types";
export { MockProvider } from "./mock-provider";

/**
 * Selección de proveedor por variable de entorno: PAYMENT_PROVIDER=mock|stripe|paypal
 * (por defecto `mock`). Server-only: el secreto de webhook nunca llega al
 * cliente. Conectar el proveedor real = cambiar esta variable + rellenar la
 * clase correspondiente. Cero refactorización aguas arriba.
 */
let cached: PaymentProvider | null = null;

export function getPaymentProvider(): PaymentProvider {
  if (cached) return cached;
  const name = (process.env.PAYMENT_PROVIDER ?? "mock") as ProviderName;
  const secret = process.env.PAYMENT_WEBHOOK_SECRET ?? "dev-mock-secret";

  switch (name) {
    case "stripe":
      cached = new StripeProvider();
      break;
    case "paypal":
      cached = new PayPalProvider();
      break;
    case "mock":
    default:
      cached = new MockProvider(secret);
      break;
  }
  return cached;
}
