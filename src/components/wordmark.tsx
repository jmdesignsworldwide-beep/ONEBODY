/**
 * Wordmark ONEBODY — el nodo rojo reemplaza la "O" de BODY (Sección 2.1).
 * El rojo aquí es legítimo: es la marca (uno de los tres contextos permitidos).
 */
export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-baseline font-display text-ob-bone ${className}`}
      aria-label="ONEBODY"
    >
      <span aria-hidden>ONEB</span>
      <span
        aria-hidden
        className="mx-[0.02em] inline-block size-[0.62em] translate-y-[-0.02em] rounded-full bg-ob-red"
        style={{ boxShadow: "0 0 12px var(--color-ob-red-glow)" }}
      />
      <span aria-hidden>DY</span>
    </span>
  );
}
