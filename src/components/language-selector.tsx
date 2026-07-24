"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { locales, type Locale } from "@/i18n/routing";
import { localeNames } from "@/i18n/locale-names";

/**
 * Selector de idioma: los 15 locales por nombre nativo. Cambia el locale
 * preservando la ruta y persiste la elección en cookie (next-intl). Elemento
 * de navegación monocromo — sin rojo (disciplina del rojo, Sección 2.2).
 * Accesible: teclado, foco, aria, cierre por Escape y clic exterior.
 */
export function LanguageSelector() {
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function choose(next: Locale) {
    setOpen(false);
    if (next === locale) return;
    startTransition(() => {
      router.replace(pathname, { locale: next });
    });
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Cambiar idioma"
        data-pending={isPending || undefined}
        className="flex items-center gap-1.5 rounded-full border border-ob-ash/60 px-3 py-1.5 text-xs font-medium text-ob-smoke transition-colors hover:border-ob-bone hover:text-ob-bone data-[pending]:opacity-60"
      >
        <GlobeIcon />
        <span>{localeNames[locale]}</span>
        <ChevronIcon open={open} />
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label="Idiomas"
          className="absolute end-0 z-50 mt-2 max-h-80 w-44 overflow-y-auto rounded-xl border border-ob-ash/50 bg-ob-carbon/95 p-1.5 shadow-2xl backdrop-blur-md"
        >
          {locales.map((l) => {
            const active = l === locale;
            return (
              <li key={l}>
                <button
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => choose(l)}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-start text-sm transition-colors ${
                    active
                      ? "bg-ob-graphite text-ob-bone"
                      : "text-ob-smoke hover:bg-ob-graphite/60 hover:text-ob-bone"
                  }`}
                >
                  <span>{localeNames[l]}</span>
                  <span className="text-[10px] uppercase tracking-widest text-ob-ash">
                    {l}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function GlobeIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      aria-hidden
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 2.5 2.5 15 0 18M12 3c-2.5 2.5-2.5 15 0 18" />
    </svg>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
      className={`transition-transform ${open ? "rotate-180" : ""}`}
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}
