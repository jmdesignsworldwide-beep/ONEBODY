import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Fredoka } from "next/font/google";
import { GeistSans } from "geist/font/sans";
import { routing, isRtl, type Locale } from "@/i18n/routing";
import { SmoothScroll } from "@/components/smooth-scroll";
import { ServiceWorkerRegister } from "@/components/service-worker-register";
import { Tracker } from "@/components/analytics/tracker";
import { WelcomeSplash } from "@/components/welcome-splash";
import "../globals.css";

// Titulares en una geométrica redondeada que hace eco del logo ONE BODY.
const fredoka = Fredoka({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-display",
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const viewport: Viewport = {
  themeColor: "#f7f3ec",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export async function generateMetadata(props: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: "Meta" });
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: t("title"),
      template: "%s · ONEBODY",
    },
    description: t("description"),
    applicationName: "ONEBODY",
    manifest: "/manifest.webmanifest",
    appleWebApp: {
      capable: true,
      statusBarStyle: "black-translucent",
      title: "ONEBODY",
    },
    openGraph: {
      type: "website",
      title: t("title"),
      description: t("description"),
      siteName: "ONEBODY",
    },
    // Los iconos (favicon PNG + apple-touch PNG) los generan
    // src/app/icon.tsx y src/app/apple-icon.tsx (convención de Next).
  };
}

export default async function LocaleLayout(props: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  // Habilita el renderizado estático para este locale (ya narrowed a Locale).
  setRequestLocale(locale);

  const dir = isRtl(locale) ? "rtl" : "ltr";

  return (
    <html
      lang={locale}
      dir={dir}
      className={`${GeistSans.variable} ${fredoka.variable}`}
      suppressHydrationWarning
    >
      <body className="grain min-h-dvh bg-ob-black text-ob-bone antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-ob-bone focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-ob-black"
        >
          Saltar al contenido
        </a>
        <NextIntlClientProvider>
          <SmoothScroll>{props.children}</SmoothScroll>
          <Tracker />
        </NextIntlClientProvider>
        <WelcomeSplash />
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
