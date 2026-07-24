"use client";

import { useRef, useState, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  addBudgetItemAction,
  deleteBudgetItemAction,
} from "@/lib/admin/projects-actions";
import type { BudgetItem } from "@/lib/supabase/types";

export function BudgetEditor({
  projectId,
  items,
  currency,
}: {
  projectId: string;
  items: BudgetItem[];
  currency: string;
}) {
  const t = useTranslations("Admin");
  const locale = useLocale();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const money = (n: number) =>
    new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currency || "USD",
      maximumFractionDigits: 0,
    }).format(n);

  const total = items.reduce((s, it) => s + Number(it.amount), 0);

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <h2 className="font-display text-xl text-ob-bone">{t("budgetTitle")}</h2>
        <span className="tabular text-sm text-ob-smoke">
          {t("budgetTotal")}: <span className="text-ob-bone">{money(total)}</span>
        </span>
      </div>

      {items.length > 0 && (
        <ul className="mt-4 divide-y divide-ob-ash/30 rounded-[var(--radius-ob)] border border-ob-ash/40">
          {items.map((it) => (
            <li
              key={it.id}
              className="flex items-center gap-4 bg-ob-graphite px-4 py-3"
            >
              <span className="min-w-0 flex-1 truncate text-ob-bone">
                {it.label_es}
              </span>
              <span className="tabular text-sm text-ob-bone">
                {money(Number(it.amount))}
              </span>
              <button
                type="button"
                disabled={pending}
                onClick={() =>
                  start(async () => {
                    const res = await deleteBudgetItemAction(projectId, it.id);
                    if (!res.ok) setError(res.error);
                  })
                }
                className="text-xs text-ob-smoke transition-colors hover:text-ob-red disabled:opacity-60"
              >
                {t("remove")}
              </button>
            </li>
          ))}
        </ul>
      )}

      <form
        ref={formRef}
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          setError(null);
          start(async () => {
            const res = await addBudgetItemAction(projectId, {
              label_es: String(fd.get("label_es")).trim(),
              amount: Number(fd.get("amount") || 0),
              sort_order: items.length,
            });
            if (res.ok) formRef.current?.reset();
            else setError(res.error);
          });
        }}
        className="mt-4 flex flex-wrap items-end gap-3"
      >
        <div className="min-w-[12rem] flex-1">
          <label className="mb-1 block text-xs uppercase tracking-[0.2em] text-ob-smoke">
            {t("budgetLabel")}
          </label>
          <input
            name="label_es"
            required
            maxLength={200}
            className="w-full rounded-xl border border-ob-ash bg-ob-carbon px-4 py-2.5 text-ob-bone outline-none focus:border-ob-bone"
          />
        </div>
        <div className="w-32">
          <label className="mb-1 block text-xs uppercase tracking-[0.2em] text-ob-smoke">
            {t("budgetAmount")}
          </label>
          <input
            name="amount"
            type="number"
            min={0}
            step="1"
            required
            className="w-full rounded-xl border border-ob-ash bg-ob-carbon px-4 py-2.5 text-ob-bone outline-none focus:border-ob-bone"
          />
        </div>
        <button
          type="submit"
          disabled={pending}
          className="rounded-full border border-ob-ash px-5 py-2.5 text-sm text-ob-bone transition-colors hover:border-ob-bone disabled:opacity-60"
        >
          {t("add")}
        </button>
      </form>
      {error && <p className="mt-2 text-sm text-ob-red">{error}</p>}
    </div>
  );
}
