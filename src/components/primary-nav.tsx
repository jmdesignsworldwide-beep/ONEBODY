"use client";

import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/cn";

type Item = { href: string; label: string };

/**
 * Navegación principal con estado activo (Parte A). El estado activo se calcula
 * con el pathname consciente del locale, así "Inicio" se resalta en la home.
 */
export function PrimaryNav({ items }: { items: Item[] }) {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Principal"
      className="hidden items-center gap-8 text-sm text-ob-smoke md:flex"
    >
      {items.map(({ href, label }) => {
        const active =
          href === "/" ? pathname === "/" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "transition-colors hover:text-ob-bone",
              active && "text-ob-bone",
            )}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
