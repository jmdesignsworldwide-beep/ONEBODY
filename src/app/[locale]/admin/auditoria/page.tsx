import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { listAuditLog } from "@/lib/admin/data-queries";

export default async function AdminAuditPage(props: {
  searchParams: Promise<{ page?: string }>;
}) {
  const sp = await props.searchParams;
  const t = await getTranslations("Admin");
  const locale = await getLocale();
  const page = Number.parseInt(sp.page ?? "0", 10) || 0;
  const { rows, hasMore } = await listAuditLog({ page });

  const when = (s: string) =>
    new Intl.DateTimeFormat(locale, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(s));

  return (
    <div>
      <h1 className="font-display text-3xl text-ob-bone">{t("navAudit")}</h1>
      <p className="mt-2 text-ob-smoke">{t("auditSubtitle")}</p>

      {rows.length === 0 ? (
        <p className="mt-8 text-ob-smoke">{t("noAudit")}</p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-[var(--radius-ob)] border border-ob-ash/40">
          <table className="w-full min-w-[44rem] text-sm">
            <thead>
              <tr className="border-b border-ob-ash/30 text-left text-xs uppercase tracking-widest text-ob-smoke">
                <th className="px-4 py-3 font-normal">{t("colWhen")}</th>
                <th className="px-4 py-3 font-normal">{t("colActor")}</th>
                <th className="px-4 py-3 font-normal">{t("colAction")}</th>
                <th className="px-4 py-3 font-normal">{t("colEntity")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ob-ash/20">
              {rows.map((e) => (
                <tr key={e.id} className="bg-ob-graphite">
                  <td className="whitespace-nowrap px-4 py-3 text-ob-smoke">
                    {when(e.created_at)}
                  </td>
                  <td className="px-4 py-3 text-ob-smoke">
                    {e.actor_email ?? e.actor_id ?? t("systemActor")}
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded bg-ob-ash/30 px-2 py-0.5 text-xs uppercase tracking-widest text-ob-bone">
                      {e.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-ob-smoke">
                    {e.entity_type}
                    {e.entity_id && (
                      <span className="ml-2 font-mono text-xs text-ob-smoke/70">
                        {e.entity_id.slice(0, 8)}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {(page > 0 || hasMore) && (
        <div className="mt-6 flex items-center justify-between">
          {page > 0 ? (
            <Link
              href={`/admin/auditoria?page=${page - 1}`}
              className="text-sm text-ob-smoke transition-colors hover:text-ob-bone"
            >
              ← {t("prev")}
            </Link>
          ) : (
            <span />
          )}
          {hasMore && (
            <Link
              href={`/admin/auditoria?page=${page + 1}`}
              className="text-sm text-ob-smoke transition-colors hover:text-ob-bone"
            >
              {t("next")} →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
