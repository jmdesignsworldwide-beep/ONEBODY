"use client";

import { useState, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  requestResetAction,
  createAccountFromDonationAction,
} from "@/lib/auth/actions";

const field =
  "w-full rounded-xl border border-ob-ash bg-ob-carbon px-4 py-3 text-ob-bone outline-none placeholder:text-ob-smoke focus:border-ob-bone";
const submit =
  "w-full rounded-full bg-ob-bone py-3.5 font-semibold text-ob-white transition-colors hover:opacity-90 disabled:opacity-60";

function useAuthState() {
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  return { error, setError, pending, start };
}

export function ResetForm() {
  const t = useTranslations("Auth");
  const locale = useLocale();
  const { error, setError, pending, start } = useAuthState();
  const [sent, setSent] = useState(false);
  if (sent)
    return (
      <p className="rounded-xl border border-ob-ash bg-ob-sand/60 px-4 py-4 text-center text-ob-bone">
        {t("resetSent")}
      </p>
    );
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        setError(null);
        start(async () => {
          const res = await requestResetAction(String(fd.get("email")), locale);
          if (res.ok) setSent(true);
          else setError(res.error);
        });
      }}
      className="space-y-4"
    >
      <input name="email" type="email" autoComplete="email" required placeholder={t("email")} className={field} />
      {error && <p role="alert" className="text-sm text-ob-red">{error}</p>}
      <button type="submit" disabled={pending} className={submit}>
        {pending ? t("loading") : t("resetCta")}
      </button>
      <div className="text-center text-sm text-ob-smoke">
        <Link href="/entrar" className="hover:text-ob-bone">{t("toLogin")}</Link>
      </div>
    </form>
  );
}

/** Conversión de un clic desde la pantalla de gracias. */
export function ConvertForm({ donationId }: { donationId: string }) {
  const t = useTranslations("Auth");
  const locale = useLocale();
  const { error, setError, pending, start } = useAuthState();
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        setError(null);
        start(async () => {
          const res = await createAccountFromDonationAction(
            donationId,
            String(fd.get("password")),
            locale,
          );
          if (res && !res.ok) setError(res.error);
        });
      }}
      className="mx-auto mt-4 flex max-w-sm flex-col gap-3 sm:flex-row"
    >
      <input
        name="password"
        type="password"
        autoComplete="new-password"
        required
        minLength={8}
        placeholder={t("passwordNew")}
        className={`${field} flex-1`}
      />
      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-ob-bone px-6 py-3 font-semibold text-ob-white transition-colors hover:opacity-90 disabled:opacity-60"
      >
        {pending ? t("loading") : t("createAccount")}
      </button>
      {error && <p role="alert" className="w-full text-sm text-ob-red">{error}</p>}
    </form>
  );
}
