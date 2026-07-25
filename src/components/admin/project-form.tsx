"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { slugify } from "@/lib/admin/slug";
import {
  createProjectAction,
  updateProjectAction,
} from "@/lib/admin/projects-actions";
import type { AdminProjectDetail } from "@/lib/admin/projects-queries";
import type { ProjectCategory, ProjectStatus } from "@/lib/supabase/types";

const CATEGORIES: ProjectCategory[] = [
  "vivienda",
  "alimentacion",
  "educacion",
  "maternidad",
  "adiccion",
  "emergencia",
  "salud",
  "general",
];

const STATUSES: ProjectStatus[] = [
  "draft",
  "active",
  "funded",
  "completed",
  "archived",
];

const inputCls =
  "w-full rounded-xl border border-ob-ash bg-ob-carbon px-4 py-3 text-ob-bone outline-none focus:border-ob-bone";
const labelCls =
  "mb-2 block text-xs uppercase tracking-[0.2em] text-ob-smoke";

export function ProjectForm({
  project,
}: {
  project?: AdminProjectDetail;
}) {
  const t = useTranslations("Admin");
  const tc = useTranslations("Categories");
  const router = useRouter();
  const [pending, start] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [slug, setSlug] = useState(project?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(project));

  const isEdit = Boolean(project);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        setSaved(false);
        setError(null);
        const payload = {
          slug: String(fd.get("slug")).trim(),
          title_es: String(fd.get("title_es")).trim(),
          summary_es: String(fd.get("summary_es")).trim(),
          story_es: String(fd.get("story_es")).trim(),
          category: String(fd.get("category")) as ProjectCategory,
          status: String(fd.get("status")) as ProjectStatus,
          goal_amount: Number(fd.get("goal_amount") || 0),
          currency: String(fd.get("currency") || "USD").trim().toUpperCase(),
          cover_image: (String(fd.get("cover_image")).trim() || null) as
            | string
            | null,
          location_name: (String(fd.get("location_name")).trim() || null) as
            | string
            | null,
          featured: fd.get("featured") === "on",
          sort_order: Number(fd.get("sort_order") || 0),
        };
        start(async () => {
          if (isEdit && project) {
            const res = await updateProjectAction(project.id, payload);
            if (res.ok) setSaved(true);
            else setError(res.error);
          } else {
            const res = await createProjectAction(payload);
            if (res.ok && res.data) router.push(`/admin/proyectos/${res.data.id}`);
            else if (!res.ok) setError(res.error);
          }
        });
      }}
      className="space-y-6"
    >
      <div>
        <label className={labelCls} htmlFor="title_es">
          {t("fieldTitle")}
        </label>
        <input
          id="title_es"
          name="title_es"
          required
          maxLength={160}
          defaultValue={project?.title_es ?? ""}
          onChange={(e) => {
            if (!slugTouched) setSlug(slugify(e.target.value));
          }}
          className={inputCls}
        />
      </div>

      <div>
        <label className={labelCls} htmlFor="slug">
          {t("fieldSlug")}
        </label>
        <input
          id="slug"
          name="slug"
          required
          maxLength={80}
          value={slug}
          onChange={(e) => {
            setSlugTouched(true);
            setSlug(slugify(e.target.value));
          }}
          className={`${inputCls} font-mono text-sm`}
        />
        <p className="mt-1 text-xs text-ob-smoke">/proyectos/{slug || "…"}</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label className={labelCls} htmlFor="category">
            {t("fieldCategory")}
          </label>
          <select
            id="category"
            name="category"
            defaultValue={project?.category ?? "general"}
            className={inputCls}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c} className="bg-ob-carbon">
                {tc(c)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelCls} htmlFor="status">
            {t("fieldStatus")}
          </label>
          <select
            id="status"
            name="status"
            defaultValue={project?.status ?? "draft"}
            className={inputCls}
          >
            {STATUSES.map((s) => (
              <option key={s} value={s} className="bg-ob-carbon">
                {t(`status_${s}` as "status_draft")}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className={labelCls} htmlFor="summary_es">
          {t("fieldSummary")}
        </label>
        <textarea
          id="summary_es"
          name="summary_es"
          rows={2}
          maxLength={400}
          defaultValue={project?.summary_es ?? ""}
          className={inputCls}
        />
      </div>

      <div>
        <label className={labelCls} htmlFor="story_es">
          {t("fieldStory")}
        </label>
        <textarea
          id="story_es"
          name="story_es"
          rows={8}
          maxLength={20000}
          defaultValue={project?.story_es ?? ""}
          className={inputCls}
        />
      </div>

      <div className="grid gap-6 sm:grid-cols-3">
        <div>
          <label className={labelCls} htmlFor="goal_amount">
            {t("fieldGoal")}
          </label>
          <input
            id="goal_amount"
            name="goal_amount"
            type="number"
            min={0}
            step="1"
            defaultValue={project?.goal_amount ?? 0}
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls} htmlFor="currency">
            {t("fieldCurrency")}
          </label>
          <input
            id="currency"
            name="currency"
            maxLength={3}
            defaultValue={project?.currency ?? "USD"}
            className={`${inputCls} uppercase`}
          />
        </div>
        <div>
          <label className={labelCls} htmlFor="sort_order">
            {t("fieldSortOrder")}
          </label>
          <input
            id="sort_order"
            name="sort_order"
            type="number"
            min={0}
            step="1"
            defaultValue={project?.sort_order ?? 0}
            className={inputCls}
          />
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label className={labelCls} htmlFor="location_name">
            {t("fieldLocation")}
          </label>
          <input
            id="location_name"
            name="location_name"
            maxLength={200}
            defaultValue={project?.location_name ?? ""}
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls} htmlFor="cover_image">
            {t("fieldCoverImage")}
          </label>
          <input
            id="cover_image"
            name="cover_image"
            type="url"
            maxLength={2000}
            placeholder="https://…"
            defaultValue={project?.cover_image ?? ""}
            className={inputCls}
          />
        </div>
      </div>

      <label className="flex items-start gap-3 text-sm text-ob-smoke">
        <input
          name="featured"
          type="checkbox"
          defaultChecked={project?.featured ?? false}
          className="mt-0.5 size-4 accent-ob-red"
        />
        <span>{t("fieldFeatured")}</span>
      </label>

      {error && <p className="text-sm text-ob-red">{error}</p>}
      {saved && <p className="text-sm text-ob-bone">{t("saved")}</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-ob-bone px-6 py-3 font-semibold text-ob-black transition-colors hover:opacity-90 disabled:opacity-60"
      >
        {pending ? t("saving") : isEdit ? t("save") : t("create")}
      </button>
    </form>
  );
}
