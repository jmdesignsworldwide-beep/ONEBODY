"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useLocale, useTranslations } from "next-intl";
import { cn } from "@/lib/cn";
import { PRESET_AMOUNTS } from "@/lib/validation/donation";
import { createDonation } from "@/app/[locale]/donar/actions";

type FormValues = {
  donorName: string;
  donorEmail: string;
  message: string;
  isAnonymous: boolean;
};

export function DonationForm({
  projectId = null,
  projectTitle,
}: {
  projectId?: string | null;
  projectTitle?: string;
}) {
  const t = useTranslations("Donar");
  const tImpact = useTranslations("Landing");
  const locale = useLocale();
  const [amount, setAmount] = useState<number>(50);
  const [recurring, setRecurring] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: { donorName: "", donorEmail: "", message: "", isAnonymous: false },
  });

  const money = (n: number) =>
    new Intl.NumberFormat(locale, {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(n);

  const impact =
    amount >= 250
      ? tImpact("impact250")
      : amount >= 100
        ? tImpact("impact100")
        : amount >= 50
          ? tImpact("impact50")
          : amount >= 25
            ? tImpact("impact25")
            : null;

  async function onSubmit(values: FormValues) {
    setError(null);
    if (!amount || amount < 1) {
      setError(t("errorAmount"));
      return;
    }
    setSubmitting(true);
    const res = await createDonation({
      amountUsd: amount,
      recurring,
      projectId,
      locale,
      donorName: values.donorName,
      donorEmail: values.donorEmail,
      isAnonymous: values.isAnonymous,
      message: values.message || null,
    });
    if (res.ok) {
      window.location.href = res.checkoutUrl;
    } else {
      setError(res.error);
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {projectTitle && (
        <p className="text-sm text-ob-smoke">
          {t("forProject")}{" "}
          <span className="text-ob-bone">{projectTitle}</span>
        </p>
      )}

      {/* Monto: presets + libre. El rojo aquí es legítimo (acción de donación). */}
      <div>
        <label className="mb-3 block text-xs uppercase tracking-[0.2em] text-ob-smoke">
          {t("amountLabel")}
        </label>
        <div className="grid grid-cols-4 gap-3">
          {PRESET_AMOUNTS.map((a) => (
            <button
              key={a}
              type="button"
              onClick={() => setAmount(a)}
              className={cn(
                "tabular rounded-full border py-3 font-semibold transition-colors",
                amount === a
                  ? "border-ob-red bg-ob-red text-ob-white"
                  : "border-ob-ash text-ob-bone hover:border-ob-bone",
              )}
            >
              {money(a)}
            </button>
          ))}
        </div>
        <div className="mt-3">
          <div className="flex items-center gap-2 rounded-full border border-ob-ash px-4 py-2 focus-within:border-ob-bone">
            <span className="text-ob-smoke">$</span>
            <input
              type="number"
              min={1}
              inputMode="numeric"
              value={amount || ""}
              onChange={(e) => setAmount(Math.floor(Number(e.target.value)))}
              aria-label={t("customAmount")}
              className="tabular w-full bg-transparent text-ob-bone outline-none placeholder:text-ob-ash"
              placeholder={t("customAmount")}
            />
            <span className="text-xs text-ob-smoke">USD</span>
          </div>
        </div>
        {impact && (
          <p className="mt-3 text-sm text-ob-smoke">
            {money(amount)}{" "}
            {impact}
          </p>
        )}
      </div>

      {/* Única vs mensual */}
      <div className="flex rounded-full border border-ob-ash p-1">
        <button
          type="button"
          onClick={() => setRecurring(false)}
          className={cn(
            "flex-1 rounded-full py-2 text-sm font-medium transition-colors",
            !recurring ? "bg-ob-graphite text-ob-bone" : "text-ob-smoke",
          )}
        >
          {t("once")}
        </button>
        <button
          type="button"
          onClick={() => setRecurring(true)}
          className={cn(
            "flex-1 rounded-full py-2 text-sm font-medium transition-colors",
            recurring ? "bg-ob-graphite text-ob-bone" : "text-ob-smoke",
          )}
        >
          {t("monthly")}
        </button>
      </div>

      {/* Nombre + email (mínimo legal indispensable) */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <input
            {...register("donorName", { required: true, maxLength: 120 })}
            placeholder={t("name")}
            aria-label={t("name")}
            className="w-full rounded-xl border border-ob-ash bg-ob-carbon px-4 py-3 text-ob-bone outline-none placeholder:text-ob-smoke focus:border-ob-bone"
          />
          {errors.donorName && (
            <p className="mt-1 text-xs text-ob-red">{t("errorName")}</p>
          )}
        </div>
        <div>
          <input
            {...register("donorEmail", { required: true })}
            type="email"
            placeholder={t("email")}
            aria-label={t("email")}
            className="w-full rounded-xl border border-ob-ash bg-ob-carbon px-4 py-3 text-ob-bone outline-none placeholder:text-ob-smoke focus:border-ob-bone"
          />
          {errors.donorEmail && (
            <p className="mt-1 text-xs text-ob-red">{t("errorEmail")}</p>
          )}
        </div>
      </div>

      {/* Mensaje opcional */}
      <textarea
        {...register("message", { maxLength: 500 })}
        placeholder={t("messagePlaceholder")}
        aria-label={t("messagePlaceholder")}
        rows={3}
        className="w-full rounded-xl border border-ob-ash bg-ob-carbon px-4 py-3 text-ob-bone outline-none placeholder:text-ob-smoke focus:border-ob-bone"
      />

      {/* Anónimo */}
      <label className="flex cursor-pointer items-start gap-3 text-sm text-ob-smoke">
        <input
          {...register("isAnonymous")}
          type="checkbox"
          className="mt-0.5 size-4 accent-ob-red"
        />
        <span>{t("anonymous")}</span>
      </label>

      {error && <p className="text-sm text-ob-red">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-full bg-ob-red py-4 text-base font-semibold text-ob-white shadow-[0_0_28px_var(--color-ob-red-glow)] transition-colors hover:bg-ob-red-deep disabled:opacity-60"
      >
        {submitting
          ? t("processing")
          : `${t("submit")} ${money(amount)}${recurring ? t("perMonth") : ""}`}
      </button>
      <p className="text-center text-xs text-ob-smoke">{t("secure")}</p>
    </form>
  );
}
