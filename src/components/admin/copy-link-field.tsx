"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

/**
 * Enlace público compartible de un proyecto (para Instagram / redes) con botón
 * "Copiar enlace". Muestra la URL completa de producción y copia al portapapeles
 * con confirmación. La URL se calcula en el servidor (dominio real) y se pasa
 * como prop.
 */
export function CopyLinkField({ url }: { url: string }) {
  const t = useTranslations("Admin");
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // Fallback si el portapapeles no está disponible.
      const el = document.createElement("textarea");
      el.value = url;
      el.style.position = "fixed";
      el.style.opacity = "0";
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div>
      <label className="mb-2 block text-xs uppercase tracking-[0.2em] text-ob-smoke">
        {t("shareLabel")}
      </label>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          readOnly
          value={url}
          onFocus={(e) => e.currentTarget.select()}
          className="w-full rounded-xl border border-ob-ash bg-ob-carbon px-4 py-3 font-mono text-sm text-ob-bone outline-none focus:border-ob-bone"
        />
        <button
          type="button"
          onClick={copy}
          className="shrink-0 rounded-full bg-ob-bone px-5 py-3 text-sm font-semibold text-ob-black transition-colors hover:opacity-90"
        >
          {copied ? t("shareCopied") : t("shareCopy")}
        </button>
      </div>
    </div>
  );
}
