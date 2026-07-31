import type { ReactNode } from "react";
import { NodeMark } from "@/components/motion/node-mark";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

/**
 * Marco de las pantallas de acceso. Cálido y on-brand: el nodo de convergencia
 * de ONEBODY, un mensaje que conecta con la causa y una tarjeta de marfil
 * elevada. Responsive impecable desde 360–390px. Reutilizado por entrar,
 * registro y recuperar.
 */
export function AuthShell({
  eyebrow,
  title,
  subtitle,
  children,
  footer,
}: {
  eyebrow: string;
  title: ReactNode;
  subtitle?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <>
      <SiteHeader />
      <main id="main" className="relative overflow-hidden pt-16">
        {/* Aura cálida ambiental detrás de la tarjeta (barata en GPU). */}
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <div className="ob-aurora-1 absolute left-1/2 top-24 h-72 w-72 -translate-x-1/2 rounded-full bg-ob-red-glow blur-3xl" />
        </div>

        <section className="flex min-h-[calc(100vh-16rem)] items-center justify-center px-5 py-16 sm:py-24">
          <div className="w-full max-w-md">
            <div className="flex flex-col items-center text-center">
              <NodeMark className="h-12 w-12 text-ob-bone" />
              <span className="mt-6 text-xs uppercase tracking-[0.25em] text-ob-smoke">
                {eyebrow}
              </span>
              <h1 className="font-display mt-3 text-[clamp(1.9rem,6vw,2.6rem)] text-ob-bone">
                {title}
              </h1>
              {subtitle && (
                <p className="mt-3 max-w-sm text-balance text-ob-smoke">
                  {subtitle}
                </p>
              )}
            </div>

            <div className="ob-lift mt-8 rounded-3xl border border-ob-ash bg-ob-graphite p-6 shadow-[0_18px_50px_-24px_rgba(20,16,12,0.25)] sm:p-8">
              {children}
            </div>

            {footer && (
              <p className="mt-6 text-center text-sm text-ob-smoke">{footer}</p>
            )}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
