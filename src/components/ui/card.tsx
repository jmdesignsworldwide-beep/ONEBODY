import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Superficie tipo card: grafito, borde sutil, realce al hover. */
export function Card({
  children,
  className,
  interactive = false,
}: {
  children: ReactNode;
  className?: string;
  interactive?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-ob)] border border-ob-ash/40 bg-ob-graphite p-6 shadow-[0_1px_2px_rgba(20,16,12,0.04)]",
        interactive && "ob-lift hover:border-ob-red/40",
        className,
      )}
    >
      {children}
    </div>
  );
}
