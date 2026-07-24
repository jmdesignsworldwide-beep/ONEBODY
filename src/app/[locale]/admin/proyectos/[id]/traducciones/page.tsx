import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getAdminProject } from "@/lib/admin/projects-queries";
import { getProjectTranslations } from "@/lib/admin/translations-queries";
import { TranslationsEditor } from "@/components/admin/translations-editor";

export default async function ProjectTranslationsPage(props: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const { id } = await props.params;
  const project = await getAdminProject(id);
  if (!project) notFound();
  const [initial, t] = await Promise.all([
    getProjectTranslations(id),
    getTranslations("Admin"),
  ]);

  return (
    <div className="max-w-2xl">
      <Link
        href={`/admin/proyectos/${id}`}
        className="text-sm text-ob-smoke transition-colors hover:text-ob-bone"
      >
        ← {t("editProject")}
      </Link>
      <h1 className="mt-4 font-display text-3xl text-ob-bone">
        {t("translationsTitle")}
      </h1>
      <p className="mt-2 text-ob-smoke">{t("translationsSubtitle")}</p>
      <p className="mt-1 truncate text-sm text-ob-smoke">{project.title_es}</p>

      <div className="mt-8">
        <TranslationsEditor
          projectId={id}
          base={{
            title: project.title_es,
            summary: project.summary_es,
            story: project.story_es,
          }}
          initial={initial}
        />
      </div>
    </div>
  );
}
