import { Wordmark } from "@/components/wordmark";

// Estado de carga a nivel de segmento: marca centrada con pulso suave. Respeta
// prefers-reduced-motion (la animación se desactiva vía media query global).
export default function Loading() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-6">
      <div className="motion-safe:animate-pulse">
        <Wordmark className="text-2xl opacity-70" />
      </div>
      <span className="sr-only">Cargando…</span>
    </div>
  );
}
