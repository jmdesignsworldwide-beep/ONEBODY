"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { deleteProjectAction } from "@/lib/admin/projects-actions";

export function DeleteProject({ projectId }: { projectId: string }) {
  const t = useTranslations("Admin");
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="rounded-[var(--radius-ob)] border border-ob-ash/40 p-6">
      <p className="font-medium text-ob-bone">{t("deleteTitle")}</p>
      <p className="mt-1 text-sm text-ob-smoke">{t("deleteBody")}</p>
      {!confirming ? (
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className="mt-4 rounded-full border border-ob-ash px-5 py-2 text-sm text-ob-smoke transition-colors hover:border-ob-red hover:text-ob-red"
        >
          {t("deleteProject")}
        </button>
      ) : (
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            disabled={pending}
            onClick={() =>
              start(async () => {
                const res = await deleteProjectAction(projectId);
                if (res.ok) router.push("/admin/proyectos");
                else setError(res.error);
              })
            }
            className="rounded-full bg-ob-red px-5 py-2 text-sm font-semibold text-ob-white disabled:opacity-60"
          >
            {pending ? t("saving") : t("confirmDelete")}
          </button>
          <button
            type="button"
            onClick={() => setConfirming(false)}
            className="rounded-full border border-ob-ash px-5 py-2 text-sm text-ob-smoke hover:border-ob-bone hover:text-ob-bone"
          >
            {t("cancel")}
          </button>
        </div>
      )}
      {error && <p className="mt-3 text-sm text-ob-red">{error}</p>}
    </div>
  );
}
