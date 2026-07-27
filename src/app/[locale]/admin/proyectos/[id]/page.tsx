import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import {
  getAdminProject,
  getProjectBudget,
  getProjectUpdates,
} from "@/lib/admin/projects-queries";
import { ProjectForm } from "@/components/admin/project-form";
import { CopyLinkField } from "@/components/admin/copy-link-field";
import { BudgetEditor } from "@/components/admin/budget-editor";
import { UpdatesEditor } from "@/components/admin/updates-editor";
import { DeleteProject } from "@/components/admin/delete-project";
import { project_is_public_client } from "@/lib/admin/status";
import { getOrigin } from "@/lib/site-url";
import { defaultLocale } from "@/i18n/routing";

export default async function EditProjectPage(props: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const { id } = await props.params;
  const project = await getAdminProject(id);
  if (!project) notFound();
  const [budget, updates, t] = await Promise.all([
    getProjectBudget(id),
    getProjectUpdates(id),
    getTranslations("Admin"),
  ]);

  const isPublic = project_is_public_client(project.status);
  const shareUrl = `${await getOrigin()}/${defaultLocale}/proyectos/${project.slug}`;

  return (
    <div className="max-w-2xl space-y-14">
      <div>
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/admin/proyectos"
            className="text-sm text-ob-smoke transition-colors hover:text-ob-bone"
          >
            ← {t("navProjects")}
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href={`/admin/proyectos/${project.id}/traducciones`}
              className="text-sm text-ob-smoke transition-colors hover:text-ob-bone"
            >
              {t("navTranslations")}
            </Link>
            {isPublic && (
              <Link
                href={`/proyectos/${project.slug}`}
                className="text-sm text-ob-smoke transition-colors hover:text-ob-bone"
              >
                {t("viewPublic")} →
              </Link>
            )}
          </div>
        </div>
        <h1 className="mt-4 font-display text-3xl text-ob-bone">
          {t("editProject")}
        </h1>
        <div className="mt-8">
          <ProjectForm project={project} />
        </div>
        <div className="mt-10 rounded-[var(--radius-ob)] border border-ob-ash/40 bg-ob-graphite p-6">
          <CopyLinkField url={shareUrl} />
        </div>
      </div>

      <BudgetEditor
        projectId={project.id}
        items={budget}
        currency={project.currency}
      />

      <UpdatesEditor projectId={project.id} updates={updates} />

      <DeleteProject projectId={project.id} />
    </div>
  );
}
