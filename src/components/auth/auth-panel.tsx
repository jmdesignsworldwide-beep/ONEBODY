"use client";

import { useState, useTransition } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { signInAction, signUpAction } from "@/lib/auth/actions";
import { OAuthButtons } from "@/components/auth/oauth-buttons";

const field =
  "w-full rounded-xl border border-ob-ash bg-ob-carbon px-4 py-3 text-ob-bone outline-none placeholder:text-ob-smoke focus:border-ob-bone";
const submit =
  "w-full rounded-full bg-ob-bone py-3.5 font-semibold text-ob-white transition-colors hover:opacity-90 disabled:opacity-60";

type Mode = "login" | "signup";

function LoginFields() {
  const t = useTranslations("Auth");
  const locale = useLocale();
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
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
      className="space-y-3"
    >
      <input name="email" type="email" autoComplete="email" required placeholder={t("email")} className={field} />
      <input name="password" type="password" autoComplete="current-password" required placeholder={t("password")} className={field} />
      {error && <p role="alert" className="text-sm text-ob-red">{error}</p>}
      <button type="submit" disabled={pending} className={submit}>
        {pending ? t("loading") : t("loginCta")}
      </button>
      <div className="pt-1 text-center text-sm">
        <Link href="/recuperar" className="text-ob-smoke hover:text-ob-bone">
          {t("forgot")}
        </Link>
      </div>
    </form>
  );
}

function SignupFields() {
  const t = useTranslations("Auth");
  const locale = useLocale();
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const [sent, setSent] = useState(false);
  if (sent)
    return (
      <p className="rounded-xl border border-ob-ash bg-ob-sand/60 px-4 py-4 text-center text-ob-bone">
        {t("checkEmail")}
      </p>
    );
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
      className="space-y-3"
    >
      <input name="name" autoComplete="name" required placeholder={t("name")} className={field} />
      <input name="email" type="email" autoComplete="email" required placeholder={t("email")} className={field} />
      <input name="password" type="password" autoComplete="new-password" required minLength={8} placeholder={t("passwordNew")} className={field} />
      {error && <p role="alert" className="text-sm text-ob-red">{error}</p>}
      <button type="submit" disabled={pending} className={submit}>
        {pending ? t("loading") : t("signupCta")}
      </button>
    </form>
  );
}

/**
 * Panel de acceso: social (un toque) + email/contraseña, con transición suave
 * entre entrar y crear cuenta SIN recargar la página. El modo inicial lo fija la
 * página (`/entrar` → login, `/registro` → signup); el usuario puede alternar
 * dentro de la misma pantalla.
 */
export function AuthPanel({ initialMode = "login" }: { initialMode?: Mode }) {
  const t = useTranslations("Auth");
  const reduce = useReducedMotion();
  const [mode, setMode] = useState<Mode>(initialMode);

  return (
    <div className="space-y-6">
      <OAuthButtons />

      <div className="flex items-center gap-4" aria-hidden>
        <span className="h-px flex-1 bg-ob-ash" />
        <span className="text-xs uppercase tracking-[0.2em] text-ob-smoke">
          {t("orEmail")}
        </span>
        <span className="h-px flex-1 bg-ob-ash" />
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={mode}
          initial={reduce ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, y: -6 }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
        >
          {mode === "login" ? <LoginFields /> : <SignupFields />}
        </motion.div>
      </AnimatePresence>

      <p className="text-center text-sm text-ob-smoke">
        {mode === "login" ? t("noAccount") : t("haveAccount")}{" "}
        <button
          type="button"
          onClick={() => setMode(mode === "login" ? "signup" : "login")}
          className="font-semibold text-ob-bone underline-offset-4 hover:underline"
        >
          {mode === "login" ? t("signupCta") : t("loginCta")}
        </button>
      </p>
    </div>
  );
}
