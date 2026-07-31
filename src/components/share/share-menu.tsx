"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";
import { shareTargets, type ShareNetwork } from "@/lib/share";
import {
  WhatsAppIcon,
  FacebookIcon,
  XIcon,
  EmailIcon,
  InstagramIcon,
  LinkIcon,
  ShareIcon,
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

export function ShareMenu({
  url,
  text,
  subject,
  variant = "button",
  className,
}: {
  url: string;
  /** Mensaje pre-armado (sin el enlace; el enlace se añade por red). */
  text: string;
  /** Asunto para el correo (normalmente el título del proyecto). */
  subject: string;
  variant?: "button" | "icon";
  className?: string;
}) {
  const t = useTranslations("Share");
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [canNative, setCanNative] = useState(false);
  const [copied, setCopied] = useState(false);
  const [igCopied, setIgCopied] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const targets = shareTargets(url, text, subject);

  useEffect(() => {
    setCanNative(typeof navigator !== "undefined" && typeof navigator.share === "function");
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  async function nativeShare() {
    try {
      await navigator.share({ title: subject, text, url });
      setOpen(false);
    } catch {
      // Cancelado o no disponible: mantenemos el menú de marca abierto.
    }
  }

  async function onCopyLink() {
    await copyText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function onCopyInstagram() {
    await copyText(url);
    setIgCopied(true);
    setTimeout(() => setIgCopied(false), 3500);
  }

  const trigger =
    variant === "icon" ? (
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={t("cta")}
        aria-haspopup="dialog"
        className={
          "grid h-10 w-10 place-items-center rounded-full border border-ob-ash/60 bg-ob-black/70 text-ob-bone shadow-sm backdrop-blur-md transition-colors hover:bg-ob-black " +
          (className ?? "")
        }
      >
        <ShareIcon />
      </button>
    ) : (
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        className={
          "inline-flex items-center justify-center gap-2 rounded-full border border-ob-ash bg-ob-white px-5 py-3 font-medium text-ob-bone transition-colors hover:bg-ob-sand " +
          (className ?? "")
        }
      >
        <ShareIcon />
        {t("cta")}
      </button>
    );

  return (
    <>
      {trigger}

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Fondo */}
            <button
              type="button"
              aria-label={t("close")}
              onClick={() => setOpen(false)}
              className="absolute inset-0 bg-ob-bone/40 backdrop-blur-sm"
            />

            {/* Panel: hoja inferior en móvil, tarjeta centrada en desktop */}
            <motion.div
              ref={panelRef}
              tabIndex={-1}
              role="dialog"
              aria-modal="true"
              aria-label={t("title")}
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, y: 24 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-md rounded-t-3xl border border-ob-ash bg-ob-graphite p-6 shadow-[0_-10px_60px_-20px_rgba(20,16,12,0.35)] outline-none sm:rounded-3xl sm:shadow-[0_20px_60px_-20px_rgba(20,16,12,0.35)]"
            >
              <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-ob-ash sm:hidden" />
              <h2 className="font-display text-xl text-ob-bone">{t("title")}</h2>
              <p className="mt-1 text-sm text-ob-smoke">{t("subtitle")}</p>

              {canNative && (
                <button
                  type="button"
                  onClick={nativeShare}
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-ob-bone py-3.5 font-semibold text-ob-white transition-opacity hover:opacity-90"
                >
                  <ShareIcon />
                  {t("native")}
                </button>
              )}

              <div className="mt-5 grid grid-cols-4 gap-2">
                {targets.map(({ key, href }) => {
                  const Icon = NET_ICON[key];
                  return (
                    <a
                      key={key}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setOpen(false)}
                      className="flex flex-col items-center gap-2 rounded-2xl border border-ob-ash bg-ob-carbon px-2 py-3 text-xs text-ob-bone transition-colors hover:bg-ob-sand"
                    >
                      <Icon />
                      <span>{t(key)}</span>
                    </a>
                  );
                })}
              </div>

              {/* Copiar enlace */}
              <div className="mt-3 flex items-center gap-2 rounded-2xl border border-ob-ash bg-ob-carbon p-2">
                <span className="min-w-0 flex-1 truncate pl-2 font-mono text-xs text-ob-smoke">
                  {url}
                </span>
                <button
                  type="button"
                  onClick={onCopyLink}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-ob-bone px-4 py-2 text-sm font-semibold text-ob-white transition-opacity hover:opacity-90"
                >
                  {copied ? <CheckIcon /> : <LinkIcon />}
                  {copied ? t("copied") : t("copyLink")}
                </button>
              </div>

              {/* Instagram */}
              <button
                type="button"
                onClick={onCopyInstagram}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-full border border-ob-ash bg-ob-carbon py-3 text-sm font-medium text-ob-bone transition-colors hover:bg-ob-sand"
              >
                {igCopied ? <CheckIcon /> : <InstagramIcon />}
                {igCopied ? t("instagramDone") : t("instagram")}
              </button>
              <p className="mt-2 text-center text-xs text-ob-smoke">
                {t("instagramHint")}
              </p>

              <button
                type="button"
                onClick={() => setOpen(false)}
                className="mt-4 w-full rounded-full py-2 text-sm text-ob-smoke transition-colors hover:text-ob-bone"
              >
                {t("close")}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
