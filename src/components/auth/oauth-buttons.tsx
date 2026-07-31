"use client";

import { useState, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { signInWithOAuthAction } from "@/lib/auth/actions";
import {
  enabledOAuthProviders,
  type OAuthProvider,
} from "@/lib/auth/oauth";

const LABEL: Record<OAuthProvider, string> = {
  google: "Google",
  apple: "Apple",
  facebook: "Facebook",
};

/* Íconos oficiales de marca (SVG inline, sin dependencias externas). */
function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden focusable="false">
      <path
        fill="#4285F4"
        d="M23.52 12.27c0-.82-.07-1.6-.2-2.36H12v4.47h6.47a5.53 5.53 0 0 1-2.4 3.63v3h3.87c2.27-2.09 3.58-5.17 3.58-8.74Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.08 7.94-2.92l-3.87-3c-1.08.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.28v3.09A12 12 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.27a7.2 7.2 0 0 1 0-4.54V6.64H1.28a12 12 0 0 0 0 10.72l3.99-3.09Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.77c1.77 0 3.35.61 4.6 1.8l3.42-3.42A11.94 11.94 0 0 0 12 0 12 12 0 0 0 1.28 6.64l3.99 3.09C6.22 6.88 8.87 4.77 12 4.77Z"
      />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      aria-hidden
      focusable="false"
      fill="currentColor"
    >
      <path d="M17.05 12.54c-.03-2.6 2.12-3.85 2.22-3.91-1.21-1.77-3.09-2.01-3.76-2.04-1.6-.16-3.12.94-3.93.94-.81 0-2.06-.92-3.39-.89-1.74.03-3.35 1.01-4.25 2.57-1.81 3.14-.46 7.79 1.3 10.34.86 1.25 1.88 2.65 3.22 2.6 1.29-.05 1.78-.83 3.34-.83 1.56 0 2 .83 3.37.81 1.39-.03 2.27-1.27 3.12-2.53.98-1.45 1.39-2.85 1.41-2.93-.03-.01-2.7-1.04-2.72-4.13ZM14.5 4.9c.71-.86 1.19-2.06 1.06-3.25-1.02.04-2.26.68-2.99 1.54-.66.76-1.23 1.98-1.08 3.15 1.14.09 2.3-.58 3.01-1.44Z" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden focusable="false">
      <path
        fill="#1877F2"
        d="M24 12c0-6.63-5.37-12-12-12S0 5.37 0 12c0 5.99 4.39 10.95 10.13 11.85v-8.38H7.08V12h3.05V9.36c0-3.01 1.79-4.67 4.53-4.67 1.31 0 2.68.23 2.68.23v2.95h-1.51c-1.49 0-1.95.92-1.95 1.87V12h3.32l-.53 3.47h-2.79v8.38C19.61 22.95 24 17.99 24 12Z"
      />
      <path
        fill="#fff"
        d="m16.67 15.47.53-3.47h-3.32v-2.26c0-.95.46-1.87 1.95-1.87h1.51V4.92s-1.37-.23-2.68-.23c-2.74 0-4.53 1.66-4.53 4.67V12H7.08v3.47h3.05v8.38a12.1 12.1 0 0 0 3.75 0v-8.38h2.79Z"
      />
    </svg>
  );
}

const ICON: Record<OAuthProvider, () => React.ReactElement> = {
  google: GoogleIcon,
  apple: AppleIcon,
  facebook: FacebookIcon,
};

function Spinner() {
  return (
    <svg
      className="animate-spin"
      viewBox="0 0 24 24"
      width="20"
      height="20"
      aria-hidden
      focusable="false"
    >
      <circle
        cx="12"
        cy="12"
        r="9"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeOpacity="0.25"
      />
      <path
        d="M21 12a9 9 0 0 0-9-9"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * Botones de inicio de sesión / registro social. Un toque, sin contraseña.
 * Los proveedores mostrados se controlan con `NEXT_PUBLIC_AUTH_PROVIDERS`
 * (por defecto: los tres). Si un proveedor aún no está habilitado en Supabase,
 * el clic devuelve un mensaje claro en vez de romper.
 */
export function OAuthButtons() {
  const t = useTranslations("Auth");
  const locale = useLocale();
  const [pending, start] = useTransition();
  const [active, setActive] = useState<OAuthProvider | null>(null);
  const [error, setError] = useState<string | null>(null);
  const providers = enabledOAuthProviders();

  if (providers.length === 0) return null;

  return (
    <div className="space-y-3">
      {providers.map((provider) => {
        const Icon = ICON[provider];
        const isActive = active === provider;
        return (
          <button
            key={provider}
            type="button"
            disabled={pending}
            aria-label={t("continueWith", { provider: LABEL[provider] })}
            onClick={() => {
              setError(null);
              setActive(provider);
              start(async () => {
                const res = await signInWithOAuthAction(provider, locale);
                // Sólo vuelve aquí si falló (en éxito, redirige al proveedor).
                if (res && !res.ok) {
                  setError(res.error);
                  setActive(null);
                }
              });
            }}
            className="flex w-full items-center justify-center gap-3 rounded-full border border-ob-ash bg-ob-white px-5 py-3.5 font-medium text-ob-bone transition-colors hover:bg-ob-sand disabled:opacity-60"
          >
            <span className="flex h-5 w-5 items-center justify-center">
              {isActive && pending ? <Spinner /> : <Icon />}
            </span>
            <span>{t("continueWith", { provider: LABEL[provider] })}</span>
          </button>
        );
      })}
      {error && (
        <p role="alert" className="text-center text-sm text-ob-red">
          {error}
        </p>
      )}
    </div>
  );
}
