"use client";

import { useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  pauseSubscriptionAction,
  resumeSubscriptionAction,
  cancelSubscriptionAction,
} from "@/lib/account/actions";
import type { MySubscription } from "@/lib/account-queries";

export function SubscriptionCard({ sub }: { sub: MySubscription }) {
  const t = useTranslations("Account");
  const locale = useLocale();
  const [pending, start] = useTransition();

  const money = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: sub.currency || "USD",
    maximumFractionDigits: 0,
  }).format(Number(sub.amount));

  const cancelled = sub.status === "cancelled";
  const paused = sub.status === "paused";

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

      {!cancelled && (
        <div className="mt-5 flex flex-wrap gap-3">
          {paused ? (
            <button
              type="button"
              disabled={pending}
              onClick={() => start(async () => void (await resumeSubscriptionAction(sub.id)))}
              className="rounded-full border border-ob-ash px-4 py-2 text-sm text-ob-bone hover:border-ob-bone disabled:opacity-60"
            >
              {t("resume")}
            </button>
          ) : (
            <button
              type="button"
              disabled={pending}
              onClick={() => start(async () => void (await pauseSubscriptionAction(sub.id)))}
              className="rounded-full border border-ob-ash px-4 py-2 text-sm text-ob-bone hover:border-ob-bone disabled:opacity-60"
            >
              {t("pause")}
            </button>
          )}
          <button
            type="button"
            disabled={pending}
            onClick={() => start(async () => void (await cancelSubscriptionAction(sub.id)))}
            className="rounded-full border border-ob-ash px-4 py-2 text-sm text-ob-smoke hover:border-ob-red hover:text-ob-red disabled:opacity-60"
          >
            {t("cancelSub")}
          </button>
        </div>
      )}
    </div>
  );
}
