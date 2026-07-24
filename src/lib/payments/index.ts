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
  const rawSecret = process.env.PAYMENT_WEBHOOK_SECRET;
  const secret = rawSecret ?? "dev-mock-secret";

  // Fail-closed: un proveedor real NUNCA debe firmar/verificar con el secreto de
  // desarrollo por defecto. Si se activa Stripe/PayPal sin PAYMENT_WEBHOOK_SECRET,
  // se aborta en lugar de operar con un secreto conocido.
  if (name !== "mock" && !rawSecret) {
    throw new Error(
      "PAYMENT_WEBHOOK_SECRET es obligatorio para un proveedor de pagos real.",
    );
  }

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
