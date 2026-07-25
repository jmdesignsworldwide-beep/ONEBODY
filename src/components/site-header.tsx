import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Wordmark } from "./wordmark";
import { PrimaryNav } from "./primary-nav";
import { LanguageSelector } from "./language-selector";
import { Button } from "./ui/button";
import { getCurrentUser } from "@/lib/supabase/server-auth";
import { getAdminRole } from "@/lib/admin/auth";

export async function SiteHeader() {
  const t = await getTranslations("Nav");
  const ta = await getTranslations("Auth");
  const user = await getCurrentUser();
  const adminRole = await getAdminRole(user);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-ob-ash/30 bg-ob-black/70 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" aria-label={t("home")} className="flex items-center">
          <Wordmark className="h-8 w-auto md:h-9" priority />
        </Link>

        <PrimaryNav
          items={[
            { href: "/", label: t("home") },
            { href: "/proyectos", label: t("projects") },
            { href: "/nosotros", label: t("about") },
            { href: "/impacto", label: t("impact") },
            { href: "/transparencia", label: t("transparency") },
          ]}
        />

        <div className="flex items-center gap-3">
          <LanguageSelector />
          {adminRole && (
            <Link
              href="/admin"
              className="hidden text-sm text-ob-smoke transition-colors hover:text-ob-bone sm:block"
            >
              {ta("adminPanel")}
            </Link>
          )}
          <Link
            href={user ? "/cuenta" : "/entrar"}
            className="hidden text-sm text-ob-smoke transition-colors hover:text-ob-bone sm:block"
          >
            {user ? ta("account") : ta("login")}
          </Link>
          <Button href="/donar" variant="donate" size="sm">
            {t("donate")}
          </Button>
        </div>
      </div>
    </header>
  );
}
