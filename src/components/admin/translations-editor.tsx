"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { locales } from "@/i18n/routing";
import { localeNames } from "@/i18n/locale-names";
import {
  upsertTranslationAction,
  deleteTranslationAction,
} from "@/lib/admin/translations-actions";
import type { ProjectTranslation } from "@/lib/admin/translations-queries";

type Base = { title: string; summary: string; story: string };

const inputCls =
  "w-full rounded-xl border border-ob-ash bg-ob-carbon px-4 py-2.5 text-ob-bone outline-none focus:border-ob-bone";
const labelCls = "mb-1 block text-xs uppercase tracking-[0.2em] text-ob-smoke";

function statusLabel(
  t: ReturnType<typeof useTranslations>,
  tr: ProjectTranslation | undefined,
): { text: string; tone: string } {
  if (!tr || (!tr.title && !tr.summary && !tr.story))
    return { text: t("trNotTranslated"), tone: "text-ob-smoke" };
  if (tr.reviewed) return { text: t("trReviewed"), tone: "text-ob-bone" };
  return { text: t("trMachine"), tone: "text-ob-smoke" };
}

function LocalePanel({
  projectId,
  locale,
  base,
  initial,
}: {
  projectId: string;
  locale: string;
  base: Base;
  initial?: ProjectTranslation;
}) {
  const t = useTranslations("Admin");
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState(initial?.title ?? "");
  const [summary, setSummary] = useState(initial?.summary ?? "");
  const [story, setStory] = useState(initial?.story ?? "");
  const [reviewed, setReviewed] = useState(initial?.reviewed ?? false);
  const [status, setStatus] = useState(statusLabel(t, initial));

  const copyFromSpanish = () => {
    setTitle(base.title);
    setSummary(base.summary);
    setStory(base.story);
  };

  const save = () =>
    start(async () => {
      setSaved(false);
      setError(null);
      const res = await upsertTranslationAction(projectId, {
        locale,
        title,
        summary,
        story,
        reviewed,
      });
      if (res.ok) {
        setSaved(true);
        setStatus(
          statusLabel(t, {
            locale,
            title,
            summary,
            story,
            reviewed,
            is_machine_translated: !reviewed,
            updated_at: null,
          }),
        );
      } else setError(res.error);
    });

  const remove = () =>
    start(async () => {
      setError(null);
      const res = await deleteTranslationAction(projectId, locale);
      if (res.ok) {
        setTitle("");
        setSummary("");
        setStory("");
        setReviewed(false);
        setStatus(statusLabel(t, undefined));
        setSaved(false);
      } else setError(res.error);
    });

  const hasContent = Boolean(title || summary || story);

  return (
    <div className="overflow-hidden rounded-[var(--radius-ob)] border border-ob-ash/40">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-4 bg-ob-graphite px-5 py-4 text-left transition-colors hover:bg-ob-ash/20"
      >
        <span className="flex items-center gap-3">
          <span className="text-ob-bone">{localeNames[locale as keyof typeof localeNames] ?? locale}</span>
          <span className="text-xs uppercase tracking-widest text-ob-smoke">
            {locale}
          </span>
        </span>
        <span className={`text-xs uppercase tracking-widest ${status.tone}`}>
          {status.text}
        </span>
      </button>

      {open && (
        <div className="space-y-4 border-t border-ob-ash/30 p-5">
          <button
            type="button"
            onClick={copyFromSpanish}
            className="text-xs text-ob-smoke underline underline-offset-4 transition-colors hover:text-ob-bone"
          >
            {t("trCopyFromSpanish")}
          </button>

          <div>
            <label className={labelCls}>{t("fieldTitle")}</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={160}
              className={inputCls}
            />
            <p className="mt-1 text-xs text-ob-smoke">ES: {base.title}</p>
          </div>

          <div>
            <label className={labelCls}>{t("fieldSummary")}</label>
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              rows={2}
              maxLength={400}
              className={inputCls}
            />
            {base.summary && (
              <p className="mt-1 text-xs text-ob-smoke">ES: {base.summary}</p>
            )}
          </div>

          <div>
            <label className={labelCls}>{t("fieldStory")}</label>
            <textarea
              value={story}
              onChange={(e) => setStory(e.target.value)}
              rows={6}
              maxLength={20000}
              className={inputCls}
            />
          </div>

          <label className="flex items-center gap-3 text-sm text-ob-smoke">
            <input
              type="checkbox"
              checked={reviewed}
              onChange={(e) => setReviewed(e.target.checked)}
              className="size-4 accent-ob-red"
            />
            <span>{t("trMarkReviewed")}</span>
          </label>

          {error && <p className="text-sm text-ob-red">{error}</p>}
          {saved && <p className="text-sm text-ob-bone">{t("saved")}</p>}

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              disabled={pending}
              onClick={save}
              className="rounded-full bg-ob-bone px-5 py-2.5 text-sm font-semibold text-ob-black transition-colors hover:opacity-90 disabled:opacity-60"
            >
              {pending ? t("saving") : t("save")}
            </button>
            {hasContent && (
              <button
                type="button"
                disabled={pending}
                onClick={remove}
                className="rounded-full border border-ob-ash px-5 py-2.5 text-sm text-ob-smoke transition-colors hover:border-ob-red hover:text-ob-red disabled:opacity-60"
              >
                {t("remove")}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function TranslationsEditor({
  projectId,
  base,
  initial,
}: {
  projectId: string;
  base: Base;
  initial: Record<string, ProjectTranslation>;
}) {
  const targets = locales.filter((l) => l !== "es");
  return (
    <div className="space-y-3">
      {targets.map((l) => (
        <LocalePanel
          key={l}
          projectId={projectId}
          locale={l}
          base={base}
          initial={initial[l]}
        />
      ))}
    </div>
  );
}
