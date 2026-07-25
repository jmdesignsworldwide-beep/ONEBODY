"use client";

import { useState, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  signInAction,
  signUpAction,
  requestResetAction,
  createAccountFromDonationAction,
} from "@/lib/auth/actions";

const field =
  "w-full rounded-xl border border-ob-ash bg-ob-carbon px-4 py-3 text-ob-bone outline-none placeholder:text-ob-smoke focus:border-ob-bone";
const submit =
  "w-full rounded-full bg-ob-bone py-3.5 font-semibold text-ob-black transition-colors hover:opacity-90 disabled:opacity-60";

function useAuthState() {
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  return { error, setError, pending, start };
}

export function LoginForm() {
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
          const res = await signInAction(
            String(fd.get("email")),
            String(fd.get("password")),
            locale,
          );
          if (res && !res.ok) setError(res.error);
        });
      }}
      className="space-y-4"
    >
      <input name="email" type="email" required placeholder={t("email")} className={field} />
      <input name="password" type="password" required placeholder={t("password")} className={field} />
      {error && <p className="text-sm text-ob-red">{error}</p>}
      <button type="submit" disabled={pending} className={submit}>
        {pending ? t("loading") : t("loginCta")}
      </button>
      <div className="flex justify-between text-sm text-ob-smoke">
        <Link href="/recuperar" className="hover:text-ob-bone">{t("forgot")}</Link>
        <Link href="/registro" className="hover:text-ob-bone">{t("toSignup")}</Link>
      </div>
    </form>
  );
}

export function SignupForm() {
  const t = useTranslations("Auth");
  const locale = useLocale();
  const { error, setError, pending, start } = useAuthState();
  const [sent, setSent] = useState(false);
  if (sent) return <p className="text-ob-bone">{t("checkEmail")}</p>;
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        setError(null);
        start(async () => {
          const res = await signUpAction(
            String(fd.get("email")),
            String(fd.get("password")),
            String(fd.get("name")),
            locale,
          );
          if (res && !res.ok) setError(res.error);
          else if (res && res.ok && res.needsConfirmation) setSent(true);
        });
      }}
      className="space-y-4"
    >
      <input name="name" required placeholder={t("name")} className={field} />
      <input name="email" type="email" required placeholder={t("email")} className={field} />
      <input name="password" type="password" required minLength={8} placeholder={t("passwordNew")} className={field} />
      {error && <p className="text-sm text-ob-red">{error}</p>}
      <button type="submit" disabled={pending} className={submit}>
        {pending ? t("loading") : t("signupCta")}
      </button>
      <div className="text-center text-sm text-ob-smoke">
        <Link href="/entrar" className="hover:text-ob-bone">{t("toLogin")}</Link>
      </div>
    </form>
  );
}

export function ResetForm() {
  const t = useTranslations("Auth");
  const locale = useLocale();
  const { error, setError, pending, start } = useAuthState();
  const [sent, setSent] = useState(false);
  if (sent) return <p className="text-ob-bone">{t("resetSent")}</p>;
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
      <input name="email" type="email" required placeholder={t("email")} className={field} />
      {error && <p className="text-sm text-ob-red">{error}</p>}
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
        required
        minLength={8}
        placeholder={t("passwordNew")}
        className={`${field} flex-1`}
      />
      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-ob-bone px-6 py-3 font-semibold text-ob-black transition-colors hover:opacity-90 disabled:opacity-60"
      >
        {pending ? t("loading") : t("createAccount")}
      </button>
      {error && <p className="w-full text-sm text-ob-red">{error}</p>}
    </form>
  );
}
