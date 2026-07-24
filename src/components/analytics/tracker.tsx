"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useLocale } from "next-intl";

/**
 * Registro de vistas de página, fire-and-forget. No rastrea a personas: el
 * servidor sólo deriva país de la cabecera de Vercel, hashea el user-agent y usa
 * una sesión anónima. No se envía nada en /admin ni /cuenta (páginas privadas).
 */
export function Tracker() {
  const pathname = usePathname();
  const locale = useLocale();
  const last = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname || last.current === pathname) return;
    if (/\/(admin|cuenta|entrar|registro|recuperar)(\/|$)/.test(pathname))
      return;
    last.current = pathname;

    const payload = JSON.stringify({ path: pathname, locale });
    try {
      if (navigator.sendBeacon) {
        navigator.sendBeacon("/api/track", new Blob([payload], { type: "application/json" }));
      } else {
        void fetch("/api/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: payload,
          keepalive: true,
        });
      }
    } catch {
      // La analítica nunca debe romper la navegación.
    }
  }, [pathname, locale]);

  return null;
}
