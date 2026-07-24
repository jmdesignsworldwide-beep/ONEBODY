"use client";

import { useState, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { deleteAccountAction } from "@/lib/account/actions";

export function DeleteAccount() {
  const t = useTranslations("Account");
  const locale = useLocale();
  const [confirming, setConfirming] = useState(false);
  const [pending, start] = useTransition();

  return (
    <div className="rounded-[var(--radius-ob)] border border-ob-ash/40 p-6">
      <p className="font-medium text-ob-bone">{t("dangerTitle")}</p>
      <p className="mt-1 text-sm text-ob-smoke">{t("dangerBody")}</p>
      {!confirming ? (
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className="mt-4 rounded-full border border-ob-ash px-5 py-2 text-sm text-ob-smoke transition-colors hover:border-ob-red hover:text-ob-red"
        >
          {t("deleteAccount")}
        </button>
      ) : (
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            disabled={pending}
            onClick={() =>
              start(async () => void (await deleteAccountAction(locale)))
            }
            className="rounded-full bg-ob-red px-5 py-2 text-sm font-semibold text-ob-white disabled:opacity-60"
          >
            {pending ? t("saving") : t("confirmDelete")}
          </button>
          <button
            type="button"
            onClick={() => setConfirming(false)}
            className="rounded-full border border-ob-ash px-5 py-2 text-sm text-ob-smoke hover:border-ob-bone hover:text-ob-bone"
          >
            {t("cancel")}
          </button>
        </div>
      )}
    </div>
  );
}
