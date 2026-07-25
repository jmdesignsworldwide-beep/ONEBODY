import type { ComponentProps, ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/cn";

/**
 * Botón del sistema ONEBODY.
 *
 * DISCIPLINA DEL ROJO (Sección 2.2): la variante `donate` es el ÚNICO botón
 * rojo del sistema — reservado a la acción de donación. `primary` (bone),
 * `secondary` (contorno) y `ghost` son monocromos. Nunca uses `donate` para
 * algo que no sea donar.
 */
type Variant = "donate" | "primary" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-semibold whitespace-nowrap " +
  "transition-[background-color,border-color,color,transform] duration-200 ease-[var(--ease-expo-out)] " +
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 " +
  "disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]";

const variants: Record<Variant, string> = {
  donate:
    "bg-ob-red text-ob-white shadow-[0_0_28px_var(--color-ob-red-glow)] hover:bg-ob-red-deep",
  primary: "bg-ob-bone text-ob-black hover:opacity-90",
  secondary:
    "border border-ob-ash text-ob-bone hover:border-ob-bone hover:bg-ob-bone/5",
  ghost: "text-ob-smoke hover:text-ob-bone hover:bg-ob-bone/5",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-6 text-base",
  lg: "h-14 px-8 text-base",
};

type CommonProps = {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
};

type ButtonAsButton = CommonProps &
  Omit<ComponentProps<"button">, "className" | "children"> & { href?: undefined };

type ButtonAsLink = CommonProps &
  Omit<ComponentProps<typeof Link>, "className" | "children" | "href"> & {
    href: string;
  };

export function Button(props: ButtonAsButton | ButtonAsLink) {
  const { variant = "primary", size = "md", className, children, ...rest } = props;
  const classes = cn(base, variants[variant], sizes[size], className);

  if ("href" in props && props.href !== undefined) {
    return (
      <Link className={classes} {...(rest as ComponentProps<typeof Link>)}>
        {children}
      </Link>
    );
  }

  const buttonRest = { ...rest } as Record<string, unknown>;
  delete buttonRest.href;
  return (
    <button className={classes} {...(buttonRest as ComponentProps<"button">)}>
      {children}
    </button>
  );
}
