import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Wordmark } from "@/components/wordmark";

export default function NotFound() {
  // El locale ya está en el segmento; el layout envuelve esta página.
  setRequestLocale("es");
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <Wordmark className="h-10 w-auto" />
      <p className="mt-10 font-display text-7xl text-ob-bone">404</p>
      <p className="mt-4 max-w-sm text-ob-smoke">
        No encontramos esta página. Puede que se haya movido o que el enlace
        esté incompleto.
      </p>
      <Link
        href="/"
        className="mt-10 rounded-full border border-ob-ash px-7 py-3 text-sm font-medium text-ob-bone transition-colors hover:border-ob-bone"
      >
        Volver al inicio
      </Link>
    </main>
  );
}
