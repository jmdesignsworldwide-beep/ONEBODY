import { Link } from "@/i18n/navigation";
import { GrowthMark } from "@/components/motion/growth-mark";

/**
 * Estado vacío premium del panel (Sección 8 del protocolo: "estados vacíos
 * premium con CTA"). Reemplaza los textos planos por una tarjeta con marca,
 * mensaje y, opcionalmente, una acción para empezar.
 */
export function AdminEmptyState({
  title,
  body,
  ctaLabel,
  ctaHref,
}: {
  title: string;
  body?: string;
  ctaLabel?: string;
  ctaHref?: string;
}) {
  return (
    <div className="mt-8 flex flex-col items-center gap-4 rounded-[var(--radius-ob)] border border-dashed border-ob-ash/50 bg-ob-graphite/40 px-6 py-16 text-center">
      <GrowthMark className="h-10 w-10 text-ob-bone/40" />
      <p className="max-w-sm font-display text-xl text-ob-bone">{title}</p>
      {body && <p className="max-w-sm text-sm text-ob-smoke">{body}</p>}
      {ctaLabel && ctaHref && (
        <Link
          href={ctaHref}
          className="mt-2 rounded-full bg-ob-bone px-5 py-2.5 text-sm font-semibold text-ob-black transition-colors hover:opacity-90"
        >
          {ctaLabel}
        </Link>
      )}
    </div>
  );
}
