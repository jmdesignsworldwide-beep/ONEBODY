"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { locales } from "@/i18n/routing";
import { localeNames } from "@/i18n/locale-names";
import { updateProfileAction } from "@/lib/account/actions";
import type { MyProfile } from "@/lib/account-queries";

export function ProfileForm({ profile }: { profile: MyProfile }) {
  const t = useTranslations("Account");
  const [pending, start] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        setSaved(false);
        setError(null);
        start(async () => {
          const res = await updateProfileAction({
            display_name: (String(fd.get("display_name")).trim() || null) as
              | string
              | null,
            preferred_locale: String(fd.get("preferred_locale")),
            show_publicly: fd.get("show_publicly") === "on",
            email_updates: fd.get("email_updates") === "on",
          });
          if (res.ok) setSaved(true);
          else setError(res.error);
        });
      }}
      className="space-y-6"
    >
      <div>
        <label className="mb-2 block text-xs uppercase tracking-[0.2em] text-ob-smoke">
          {t("displayName")}
        </label>
        <input
          name="display_name"
          defaultValue={profile.display_name ?? ""}
          maxLength={120}
          className="w-full rounded-xl border border-ob-ash bg-ob-carbon px-4 py-3 text-ob-bone outline-none focus:border-ob-bone"
        />
      </div>

      <div>
        <label className="mb-2 block text-xs uppercase tracking-[0.2em] text-ob-smoke">
          {t("preferredLocale")}
        </label>
        <select
          name="preferred_locale"
          defaultValue={profile.preferred_locale}
          className="w-full rounded-xl border border-ob-ash bg-ob-carbon px-4 py-3 text-ob-bone outline-none focus:border-ob-bone"
        >
          {locales.map((l) => (
            <option key={l} value={l} className="bg-ob-carbon">
              {localeNames[l]}
            </option>
          ))}
        </select>
      </div>

      <label className="flex items-start gap-3 text-sm text-ob-smoke">
        <input
          name="show_publicly"
          type="checkbox"
          defaultChecked={profile.show_publicly}
          className="mt-0.5 size-4 accent-ob-red"
        />
        <span>{t("showPublicly")}</span>
      </label>

      <label className="flex items-start gap-3 text-sm text-ob-smoke">
        <input
          name="email_updates"
          type="checkbox"
          defaultChecked={profile.email_updates}
          className="mt-0.5 size-4 accent-ob-red"
        />
        <span>{t("emailUpdates")}</span>
      </label>

      {error && <p className="text-sm text-ob-red">{error}</p>}
      {saved && <p className="text-sm text-ob-bone">{t("saved")}</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-ob-bone px-6 py-3 font-semibold text-ob-black transition-colors hover:opacity-90 disabled:opacity-60"
      >
        {pending ? t("saving") : t("save")}
      </button>
    </form>
  );
}
