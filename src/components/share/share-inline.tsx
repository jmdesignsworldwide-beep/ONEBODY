"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { shareTargets, type ShareNetwork } from "@/lib/share";
import {
  WhatsAppIcon,
  FacebookIcon,
  XIcon,
  EmailIcon,
  LinkIcon,
  CheckIcon,
} from "@/components/share/share-icons";

const NET_ICON: Record<ShareNetwork, (p: { className?: string }) => React.ReactElement> = {
  whatsapp: WhatsAppIcon,
  facebook: FacebookIcon,
  x: XIcon,
  email: EmailIcon,
};

async function copyText(value: string) {
  try {
    await navigator.clipboard.writeText(value);
  } catch {
    const el = document.createElement("textarea");
    el.value = value;
    el.style.position = "fixed";
    el.style.opacity = "0";
    document.body.appendChild(el);
    el.select();
    document.execCommand("copy");
    document.body.removeChild(el);
  }
}

/**
 * Fila de compartir SIEMPRE visible (sin menú): el multiplicador de la pantalla
 * de gracias. Botones directos a cada red con el mensaje pre-armado + copiar.
 */
export function ShareInline({
  url,
  text,
  subject,
}: {
  url: string;
  text: string;
  subject: string;
}) {
  const t = useTranslations("Share");
  const [copied, setCopied] = useState(false);
  const targets = shareTargets(url, text, subject);

  async function onCopy() {
    await copyText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div>
      <div className="grid grid-cols-4 gap-2">
        {targets.map(({ key, href }) => {
          const Icon = NET_ICON[key];
          return (
            <a
              key={key}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-2 rounded-2xl border border-ob-ash bg-ob-graphite px-2 py-3 text-xs text-ob-bone transition-colors hover:bg-ob-sand"
            >
              <Icon />
              <span>{t(key)}</span>
            </a>
          );
        })}
      </div>
      <button
        type="button"
        onClick={onCopy}
        className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full bg-ob-bone py-3 text-sm font-semibold text-ob-white transition-opacity hover:opacity-90"
      >
        {copied ? <CheckIcon /> : <LinkIcon />}
        {copied ? t("copied") : t("copyLink")}
      </button>
    </div>
  );
}
