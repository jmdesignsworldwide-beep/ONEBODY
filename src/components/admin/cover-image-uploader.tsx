"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { uploadCoverImageAction } from "@/lib/admin/projects-actions";

const ALLOWED = ["image/jpeg", "image/png", "image/webp"];
const MAX = 5 * 1024 * 1024;

/**
 * Subida real de imagen de portada. Reemplaza el antiguo campo de URL: abre el
 * selector del dispositivo (o drag-and-drop), sube a Supabase Storage vía un
 * server action admin-gated, muestra preview y estados, y guarda la URL en el
 * input oculto `cover_image` para que el formulario la envíe. Mantiene
 * compatibilidad: si el proyecto ya tenía una URL, se muestra como preview.
 */
export function CoverImageUploader({
  name = "cover_image",
  defaultValue,
}: {
  name?: string;
  defaultValue?: string | null;
}) {
  const t = useTranslations("Admin");
  const [url, setUrl] = useState<string | null>(defaultValue ?? null);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [pending, start] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(file: File | undefined) {
    setError(null);
    if (!file) return;
    if (!ALLOWED.includes(file.type)) {
      setError(t("imageBadType"));
      return;
    }
    if (file.size > MAX) {
      setError(t("imageTooLarge"));
      return;
    }
    const fd = new FormData();
    fd.set("file", file);
    start(async () => {
      const res = await uploadCoverImageAction(fd);
      if (res.ok && res.data) setUrl(res.data.url);
      else if (!res.ok) setError(res.error);
    });
  }

  return (
    <div>
      <label className="mb-2 block text-xs uppercase tracking-[0.2em] text-ob-smoke">
        {t("fieldCoverImage")}
      </label>

      {/* La URL viaja al formulario por este input oculto. */}
      <input type="hidden" name={name} value={url ?? ""} readOnly />

      <input
        ref={inputRef}
        type="file"
        accept={ALLOWED.join(",")}
        className="sr-only"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      {url ? (
        <div className="flex items-center gap-4">
          <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-ob-ash bg-ob-carbon">
            <Image
              src={url}
              alt=""
              fill
              sizes="96px"
              className="object-cover"
              unoptimized
            />
          </div>
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={pending}
              className="rounded-full border border-ob-ash px-4 py-2 text-sm text-ob-bone transition-colors hover:border-ob-bone disabled:opacity-60"
            >
              {pending ? t("imageUploading") : t("imageChange")}
            </button>
            <button
              type="button"
              onClick={() => {
                setUrl(null);
                setError(null);
              }}
              disabled={pending}
              className="text-left text-sm text-ob-smoke transition-colors hover:text-ob-red disabled:opacity-60"
            >
              {t("imageRemove")}
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            handleFile(e.dataTransfer.files?.[0]);
          }}
          disabled={pending}
          className={`flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed px-6 py-8 text-sm transition-colors disabled:opacity-60 ${
            dragOver
              ? "border-ob-bone bg-ob-carbon"
              : "border-ob-ash bg-ob-carbon text-ob-smoke hover:border-ob-bone"
          }`}
        >
          <span className="text-ob-bone">
            {pending ? t("imageUploading") : t("imageUpload")}
          </span>
          <span className="text-xs text-ob-smoke">{t("imageHint")}</span>
        </button>
      )}

      {error && <p className="mt-2 text-sm text-ob-red">{error}</p>}
    </div>
  );
}
