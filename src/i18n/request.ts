import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "./routing";

type Messages = Record<string, unknown>;

// Fusión profunda: cualquier clave ausente en un locale cae al español (fuente
// de verdad), evitando errores o strings vacíos durante la construcción por
// tandas. Los idiomas se completan progresivamente.
function deepMerge(base: Messages, override: Messages): Messages {
  const out: Messages = { ...base };
  for (const [key, value] of Object.entries(override)) {
    const prev = out[key];
    if (
      value &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      prev &&
      typeof prev === "object" &&
      !Array.isArray(prev)
    ) {
      out[key] = deepMerge(prev as Messages, value as Messages);
    } else {
      out[key] = value;
    }
  }
  return out;
}

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  const base = (await import(`../../messages/${routing.defaultLocale}.json`))
    .default as Messages;

  if (locale === routing.defaultLocale) {
    return { locale, messages: base };
  }

  const localeMessages = (
    await import(`../../messages/${locale}.json`).catch(() => ({ default: {} }))
  ).default as Messages;

  return { locale, messages: deepMerge(base, localeMessages) };
});
