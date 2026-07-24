import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ProjectForm } from "@/components/admin/project-form";

export default async function NewProjectPage() {
  const t = await getTranslations("Admin");
  return (
    <div className="max-w-2xl">
      <Link
        href="/admin/proyectos"
        className="text-sm text-ob-smoke transition-colors hover:text-ob-bone"
      >
        ← {t("navProjects")}
      </Link>
      <h1 className="mt-4 font-display text-3xl text-ob-bone">
        {t("newProject")}
      </h1>
      <p className="mt-2 text-ob-smoke">{t("newProjectSubtitle")}</p>
      <div className="mt-8">
        <ProjectForm />
      </div>
    </div>
  );
}
