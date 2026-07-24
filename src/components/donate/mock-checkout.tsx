"use client";

import { useState, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { confirmMockPayment } from "@/app/[locale]/donar/actions";

/**
 * Checkout SIMULADO (solo MockProvider). Reemplaza al checkout alojado de un
 * proveedor real. «Pagar» genera un webhook firmado server-side que se procesa
 * por la misma ruta que un proveedor real; «Fallar» simula un pago rechazado.
 */
export function MockCheckout({ donationId }: { donationId: string }) {
  const t = useTranslations("Donar");
  const locale = useLocale();
  const [pending, startTransition] = useTransition();
  const [choice, setChoice] = useState<"success" | "fail" | null>(null);

  function go(outcome: "success" | "fail") {
    setChoice(outcome);
    startTransition(async () => {
      await confirmMockPayment(donationId, outcome, locale);
    });
  }

  return (
    <div className="space-y-4">
      <button
        type="button"
        disabled={pending}
        onClick={() => go("success")}
        className="w-full rounded-full bg-ob-red py-4 text-base font-semibold text-ob-white shadow-[0_0_28px_var(--color-ob-red-glow)] transition-colors hover:bg-ob-red-deep disabled:opacity-60"
      >
        {pending && choice === "success" ? t("processing") : t("mockPay")}
      </button>
      <button
        type="button"
        disabled={pending}
        onClick={() => go("fail")}
        className="w-full rounded-full border border-ob-ash py-3 text-sm font-medium text-ob-smoke transition-colors hover:border-ob-bone hover:text-ob-bone disabled:opacity-60"
      >
        {t("mockFail")}
      </button>
    </div>
  );
}
