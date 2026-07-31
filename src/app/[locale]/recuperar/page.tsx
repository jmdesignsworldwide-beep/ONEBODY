import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { AuthShell } from "@/components/auth/auth-shell";
import { ResetForm } from "@/components/auth/forms";

export const metadata: Metadata = { title: "Recuperar", robots: { index: false } };

export default async function RecoverPage(props: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations("Auth");
  return (
    <AuthShell
      eyebrow={t("resetEyebrow")}
      title={t("resetTitle")}
      subtitle={t("resetSubtitle")}
    >
      <ResetForm />
    </AuthShell>
  );
}
