import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

// Wrappers de navegación conscientes del locale. Usar estos en lugar de
// next/link y next/navigation para preservar el prefijo de idioma.
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
