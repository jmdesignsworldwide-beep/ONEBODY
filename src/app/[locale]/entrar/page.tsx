import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { AuthShell } from "@/components/auth/auth-shell";
import { AuthPanel } from "@/components/auth/auth-panel";

export const metadata: Metadata = { title: "Entrar", robots: { index: false } };

export default async function LoginPage(props: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations("Auth");
  return (
    <AuthShell
      eyebrow={t("loginEyebrow")}
      title={t("loginTitle")}
      subtitle={t("loginSubtitle")}
    >
      <AuthPanel initialMode="login" />
    </AuthShell>
  );
}
