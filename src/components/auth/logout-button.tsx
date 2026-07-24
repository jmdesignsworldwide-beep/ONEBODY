"use client";

import { useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { signOutAction } from "@/lib/auth/actions";

export function LogoutButton() {
  const t = useTranslations("Auth");
  const locale = useLocale();
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => start(async () => void (await signOutAction(locale)))}
      className="rounded-full border border-ob-ash px-5 py-2 text-sm text-ob-smoke transition-colors hover:border-ob-bone hover:text-ob-bone disabled:opacity-60"
    >
      {t("logout")}
    </button>
  );
}
