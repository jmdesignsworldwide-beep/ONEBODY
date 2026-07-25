import type { ElementType, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Reveal } from "@/components/motion/reveal";
import { RevealHeading } from "@/components/motion/reveal-heading";

/** Contenedor central con ancho máximo y padding lateral consistentes. */
export function Container({
  children,
  className,
  as: As = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: ElementType;
}) {
  return <As className={cn("mx-auto w-full max-w-6xl px-6", className)}>{children}</As>;
}

/** Sección con ritmo vertical generoso (los titulares deben respirar). */
export function Section({
  children,
  className,
  id,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={cn("py-24 md:py-32", className)}>
      {children}
    </section>
  );
}

/** Encabezado de sección: antetítulo + título serif + descripción opcional. */
export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "start",
  className,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: "start" | "center";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4",
        align === "center" && "items-center text-center",
        className,
      )}
    >
      {eyebrow && (
        <Reveal y={8}>
          <span className="text-xs uppercase tracking-[0.25em] text-ob-smoke">
            {eyebrow}
          </span>
        </Reveal>
      )}
      <h2 className="font-display text-[clamp(2rem,5vw,3.5rem)] text-ob-bone">
        <RevealHeading delay={0.12}>{title}</RevealHeading>
      </h2>
      {description && (
        <Reveal delay={0.25}>
          <p
            className={cn(
              "max-w-xl text-lg leading-relaxed text-ob-smoke",
              align === "center" && "mx-auto",
            )}
          >
            {description}
          </p>
        </Reveal>
      )}
    </div>
  );
}
