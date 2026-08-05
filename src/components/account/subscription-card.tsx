"use client";

import { useState, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import {
  pauseSubscriptionAction,
  resumeSubscriptionAction,
  cancelSubscriptionAction,
} from "@/lib/account/actions";
import type { MySubscription } from "@/lib/account-queries";

export function SubscriptionCard({ sub }: { sub: MySubscription }) {
  const t = useTranslations("Account");
  const locale = useLocale();
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const money = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: sub.currency || "USD",
    maximumFractionDigits: 0,
  }).format(Number(sub.amount));

  const cancelled = sub.status === "cancelled";
  const paused = sub.status === "paused";

  const nextCharge =
    sub.next_charge_at && sub.status === "active"
      ? new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(
          new Date(sub.next_charge_at),
        )
      : null;

  // Ejecuta una acción y refresca los datos del servidor (así el estado, el
  // botón y el próximo cargo se actualizan sin recargar la página).
  function run(action: (id: string) => Promise<{ ok: boolean; error?: string }>) {
    setError(null);
    start(async () => {
      const res = await action(sub.id);
      if (res && !res.ok) setError(res.error || t("actionError"));
      else router.refresh();
    });
  }

  return (
    <div className="rounded-[var(--radius-ob)] border border-ob-ash/40 bg-ob-graphite p-6">
      <div className="flex items-center justify-between">
        <p className="tabular font-display text-2xl text-ob-bone">
          {money}
          <span className="ml-1 text-sm text-ob-smoke">/{sub.interval}</span>
        </p>
        <span className="text-xs uppercase tracking-widest text-ob-smoke">
          {t(`subStatus_${sub.status}` as "subStatus_active")}
        </span>
      </div>

      {nextCharge && (
        <p className="mt-2 text-sm text-ob-smoke">
          {t("nextCharge")}: <span className="text-ob-bone">{nextCharge}</span>
        </p>
      )}

      {!cancelled && (
        <div className="mt-5 flex flex-wrap gap-3">
          {paused ? (
            <button
              type="button"
              disabled={pending}
              onClick={() => run(resumeSubscriptionAction)}
              className="rounded-full border border-ob-ash px-4 py-2 text-sm text-ob-bone hover:border-ob-bone disabled:opacity-60"
            >
              {t("resume")}
            </button>
          ) : (
            <button
              type="button"
              disabled={pending}
              onClick={() => run(pauseSubscriptionAction)}
              className="rounded-full border border-ob-ash px-4 py-2 text-sm text-ob-bone hover:border-ob-bone disabled:opacity-60"
            >
              {t("pause")}
            </button>
          )}
          <button
            type="button"
            disabled={pending}
            onClick={() => {
              if (window.confirm(t("cancelConfirm"))) run(cancelSubscriptionAction);
            }}
            className="rounded-full border border-ob-ash px-4 py-2 text-sm text-ob-smoke hover:border-ob-red hover:text-ob-red disabled:opacity-60"
          >
            {t("cancelSub")}
          </button>
        </div>
      )}

      {error && (
        <p role="alert" className="mt-3 text-sm text-ob-red">
          {error}
        </p>
      )}
    </div>
  );
}
