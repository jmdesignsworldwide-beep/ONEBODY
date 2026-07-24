"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { refundDonationAction } from "@/lib/admin/data-actions";

export function RefundButton({ id }: { id: string }) {
  const t = useTranslations("Admin");
  const [confirming, setConfirming] = useState(false);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (error)
    return <span className="text-xs text-ob-red">{error}</span>;

  if (!confirming)
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="text-xs text-ob-smoke transition-colors hover:text-ob-red"
      >
        {t("refund")}
      </button>
    );

  return (
    <span className="inline-flex items-center gap-2">
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          start(async () => {
            const res = await refundDonationAction(id);
            if (!res.ok) setError(res.error);
          })
        }
        className="text-xs font-semibold text-ob-red disabled:opacity-60"
      >
        {pending ? t("saving") : t("confirmRefund")}
      </button>
      <button
        type="button"
        onClick={() => setConfirming(false)}
        className="text-xs text-ob-smoke hover:text-ob-bone"
      >
        {t("cancel")}
      </button>
    </span>
  );
}
