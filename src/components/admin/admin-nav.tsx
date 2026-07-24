"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/cn";

const items = [
  { href: "/admin", key: "navOverview" },
  { href: "/admin/proyectos", key: "navProjects" },
  { href: "/admin/donaciones", key: "navDonations" },
  { href: "/admin/analitica", key: "navAnalytics" },
  { href: "/admin/auditoria", key: "navAudit" },
] as const;

export function AdminNav() {
  const t = useTranslations("Admin");
  const pathname = usePathname();
  return (
    <nav
      aria-label="Panel"
      className="flex gap-1 overflow-x-auto border-b border-ob-ash/30 pb-px"
    >
      {items.map((it) => {
        const active =
          it.href === "/admin"
            ? pathname === "/admin"
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
