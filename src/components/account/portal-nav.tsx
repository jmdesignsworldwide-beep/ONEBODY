"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/cn";

const items = [
  { href: "/cuenta", key: "navDashboard" },
  { href: "/cuenta/historial", key: "navHistory" },
  { href: "/cuenta/impacto", key: "navImpact" },
  { href: "/cuenta/suscripcion", key: "navSubscription" },
  { href: "/cuenta/configuracion", key: "navSettings" },
] as const;

export function PortalNav() {
  const t = useTranslations("Account");
  const pathname = usePathname();
  return (
    <nav
      aria-label="Portal"
      className="flex gap-1 overflow-x-auto border-b border-ob-ash/30 pb-px"
    >
      {items.map((it) => {
        const active =
          it.href === "/cuenta"
            ? pathname === "/cuenta"
            : pathname.startsWith(it.href);
        return (
          <Link
            key={it.href}
            href={it.href}
            className={cn(
              "whitespace-nowrap border-b-2 px-4 py-3 text-sm transition-colors",
              active
                ? "border-ob-red text-ob-bone"
                : "border-transparent text-ob-smoke hover:text-ob-bone",
            )}
          >
            {t(it.key)}
          </Link>
        );
      })}
    </nav>
  );
}
