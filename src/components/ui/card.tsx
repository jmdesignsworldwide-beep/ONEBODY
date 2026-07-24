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
        "rounded-[var(--radius-ob)] border border-ob-ash/40 bg-ob-graphite p-6",
        interactive &&
          "transition-colors duration-200 ease-[var(--ease-expo-out)] hover:border-ob-ash",
        className,
      )}
    >
      {children}
    </div>
  );
}
