"use client";

import { useEffect } from "react";
import { Wordmark } from "@/components/wordmark";

// Límite de error a nivel de locale. No filtra detalles internos al usuario;
// ofrece reintentar y volver al inicio.
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // El detalle queda en los logs del servidor/plataforma, no en pantalla.
  }, [error]);

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <Wordmark className="h-10 w-auto" />
      <p className="mt-10 font-display text-3xl text-ob-bone">
        Algo no salió como esperábamos
      </p>
      <p className="mt-4 max-w-sm text-ob-smoke">
        Ha ocurrido un error inesperado. Puedes intentarlo de nuevo.
      </p>
      <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-full bg-ob-bone px-7 py-3 text-sm font-semibold text-ob-black transition-colors hover:opacity-90"
        >
          Reintentar
        </button>
        <button
          type="button"
          onClick={() => window.location.assign("/")}
          className="rounded-full border border-ob-ash px-7 py-3 text-sm font-medium text-ob-bone transition-colors hover:border-ob-bone"
        >
          Volver al inicio
        </button>
      </div>
    </main>
  );
}
