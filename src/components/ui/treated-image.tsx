import Image from "next/image";
import { cn } from "@/lib/cn";

/**
 * Tratamiento de imagen unificado (Sección 2.4). Hace que el material de campo
 * (fotos tomadas con teléfono) se vea intencional, no accidental:
 * - grado cálido sutil + ligero aumento de contraste (CSS filter)
 * - grano fino de película (overlay de ruido)
 * - degradado negro en la base para legibilidad del texto encima
 * - máscaras de aspecto consistentes (nunca proporciones arbitrarias)
 *
 * Cuando aún no hay foto real, renderiza un marcador cálido con el mismo
 * tratamiento, para no romper el layout ni la estética.
 */
const aspects = {
  "16/9": "aspect-[16/9]",
  "3/2": "aspect-[3/2]",
  "4/5": "aspect-[4/5]",
  "1/1": "aspect-square",
} as const;

export function TreatedImage({
  src,
  alt,
  aspect = "3/2",
  overlay = true,
  priority = false,
  sizes = "(max-width: 768px) 100vw, 50vw",
  className,
}: {
  src?: string;
  alt: string;
  aspect?: keyof typeof aspects;
  overlay?: boolean;
  priority?: boolean;
  sizes?: string;
  className?: string;
}) {
  return (
    <figure
      className={cn(
        "relative overflow-hidden rounded-[var(--radius-ob)] bg-ob-graphite",
        aspects[aspect],
        className,
      )}
    >
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover transition-transform duration-[650ms] ease-[var(--ease-expo-out)] group-hover:scale-[1.05] [filter:sepia(0.12)_saturate(1.05)_contrast(1.05)_brightness(1.02)]"
        />
      ) : (
        // Marcador cálido con el mismo grado, hasta que llegue la foto real.
        <div
          aria-label={alt}
          role="img"
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(130% 130% at 25% 15%, #f6ddce 0%, #eebfa6 42%, #d98e74 100%)",
          }}
        />
      )}

      {/* Grano de película fino */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.06] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      {/* Degradado en la base para texto legible encima */}
      {overlay && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent"
        />
      )}
    </figure>
  );
}
