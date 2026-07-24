"use client";

import { useRef, useState, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  addProjectUpdateAction,
  toggleUpdatePublishAction,
  deleteProjectUpdateAction,
} from "@/lib/admin/projects-actions";
import type { AdminUpdateRow } from "@/lib/admin/projects-queries";

export function UpdatesEditor({
  projectId,
  updates,
}: {
  projectId: string;
  updates: AdminUpdateRow[];
}) {
  const t = useTranslations("Admin");
  const locale = useLocale();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const fmt = (iso: string) =>
    new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(
      new Date(iso),
    );

  return (
    <div>
      <h2 className="font-display text-xl text-ob-bone">{t("updatesTitle")}</h2>

      {updates.length > 0 && (
        <ul className="mt-4 space-y-3">
          {updates.map((u) => (
            <li
              key={u.id}
              className="rounded-[var(--radius-ob)] border border-ob-ash/40 bg-ob-graphite p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="truncate text-ob-bone">{u.title_es}</p>
                  <p className="mt-0.5 text-xs text-ob-smoke">
                    {u.published_at
                      ? `${t("published")} · ${fmt(u.published_at)}`
                      : t("draft")}
                  </p>
                </div>
                <div className="flex shrink-0 gap-3">
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() =>
                      start(async () => {
                        const res = await toggleUpdatePublishAction(
                          projectId,
                          u.id,
                          !u.published_at,
                        );
                        if (!res.ok) setError(res.error);
                      })
                    }
                    className="text-xs text-ob-smoke transition-colors hover:text-ob-bone disabled:opacity-60"
                  >
                    {u.published_at ? t("unpublish") : t("publish")}
                  </button>
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() =>
                      start(async () => {
                        const res = await deleteProjectUpdateAction(
                          projectId,
                          u.id,
                        );
                        if (!res.ok) setError(res.error);
                      })
                    }
                    className="text-xs text-ob-smoke transition-colors hover:text-ob-red disabled:opacity-60"
                  >
                    {t("remove")}
                  </button>
                </div>
              </div>
              <p className="mt-2 line-clamp-2 text-sm text-ob-smoke">{u.body_es}</p>
            </li>
          ))}
        </ul>
      )}

      <form
        ref={formRef}
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          setError(null);
          start(async () => {
            const res = await addProjectUpdateAction(projectId, {
              title_es: String(fd.get("title_es")).trim(),
              body_es: String(fd.get("body_es")).trim(),
              publish: fd.get("publish") === "on",
            });
            if (res.ok) formRef.current?.reset();
            else setError(res.error);
          });
        }}
        className="mt-6 space-y-4 rounded-[var(--radius-ob)] border border-ob-ash/40 p-4"
      >
        <p className="text-xs uppercase tracking-[0.2em] text-ob-smoke">
          {t("newUpdate")}
        </p>
        <input
          name="title_es"
          required
          maxLength={160}
          placeholder={t("updateTitlePlaceholder")}
          className="w-full rounded-xl border border-ob-ash bg-ob-carbon px-4 py-2.5 text-ob-bone outline-none focus:border-ob-bone"
        />
        <textarea
          name="body_es"
          required
          rows={3}
          maxLength={20000}
          placeholder={t("updateBodyPlaceholder")}
          className="w-full rounded-xl border border-ob-ash bg-ob-carbon px-4 py-2.5 text-ob-bone outline-none focus:border-ob-bone"
        />
        <div className="flex items-center justify-between gap-4">
          <label className="flex items-center gap-3 text-sm text-ob-smoke">
            <input
              name="publish"
              type="checkbox"
              defaultChecked
              className="size-4 accent-ob-red"
            />
            <span>{t("publishNow")}</span>
          </label>
          <button
            type="submit"
            disabled={pending}
            className="rounded-full border border-ob-ash px-5 py-2.5 text-sm text-ob-bone transition-colors hover:border-ob-bone disabled:opacity-60"
          >
            {t("add")}
          </button>
        </div>
      </form>
      {error && <p className="mt-2 text-sm text-ob-red">{error}</p>}
    </div>
  );
}
