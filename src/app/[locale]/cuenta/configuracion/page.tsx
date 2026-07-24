import { getLocale, getTranslations } from "next-intl/server";
import { getMyProfile } from "@/lib/account-queries";
import { ProfileForm } from "@/components/account/profile-form";
import { DeleteAccount } from "@/components/account/delete-account";

export default async function SettingsPage() {
  const t = await getTranslations("Account");
  const locale = await getLocale();
  const profile = await getMyProfile();

  return (
    <div className="max-w-lg space-y-12">
      <div>
        <h1 className="font-display text-3xl text-ob-bone">{t("navSettings")}</h1>
        {profile && (
          <div className="mt-8">
            <ProfileForm profile={profile} />
          </div>
        )}
      </div>

      <div>
        <h2 className="font-display text-xl text-ob-bone">{t("privacyTitle")}</h2>
        <p className="mt-2 text-sm text-ob-smoke">{t("privacyBody")}</p>
        <a
          href={`/${locale}/cuenta/datos`}
          className="mt-4 inline-block rounded-full border border-ob-ash px-5 py-2 text-sm text-ob-bone transition-colors hover:border-ob-bone"
        >
          {t("exportData")}
        </a>
      </div>

      <DeleteAccount />
    </div>
  );
}
