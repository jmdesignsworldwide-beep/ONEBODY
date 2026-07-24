import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Badge / eyebrow monocromo. Sin rojo (disciplina del rojo). Para etiquetas de
 * categoría, estados y antetítulos.
 */
export function Badge({
  children,
  className,
  tone = "outline",
}: {
  children: ReactNode;
  className?: string;
  tone?: "outline" | "solid";
}) {
  return (
    <span
      className={cn(
        "inline-block rounded-full px-3 py-1 text-xs uppercase tracking-[0.2em]",
        tone === "outline"
          ? "border border-ob-ash text-ob-smoke"
          : "bg-ob-graphite text-ob-bone",
        className,
      )}
    >
      {children}
    </span>
  );
}
