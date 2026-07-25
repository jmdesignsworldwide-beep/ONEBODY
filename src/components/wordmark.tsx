import Image from "next/image";

/**
 * Logo ONE BODY (marca oficial): "ONE" en negro + "BODY" en rojo con el emblema
 * de convergencia como la "O". Imagen con fondo transparente; se dimensiona por
 * altura vía className (p. ej. `h-8 w-auto`).
 */
export function Wordmark({
  className = "h-8 w-auto",
  priority = false,
}: {
  className?: string;
  priority?: boolean;
}) {
  return (
    <Image
      src="/onebody-wordmark.png"
      alt="ONE BODY"
      width={1446}
      height={288}
      priority={priority}
      className={className}
    />
  );
}
