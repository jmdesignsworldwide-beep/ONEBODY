import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  // Fallback a `es` para cualquier clave ausente durante la Fundación.
  // La Tanda 3 completa los 15 archivos de mensajes.
  const messages = (
    await import(`../../messages/${locale}.json`).catch(
      () => import(`../../messages/${routing.defaultLocale}.json`),
    )
  ).default;

  return { locale, messages };
});
