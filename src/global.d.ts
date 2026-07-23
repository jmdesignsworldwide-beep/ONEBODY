import type { routing } from "@/i18n/routing";
import type messages from "../messages/es.json";

// Tipado estricto de next-intl: locales válidos y claves de mensajes.
declare module "next-intl" {
  interface AppConfig {
    Locale: (typeof routing.locales)[number];
    Messages: typeof messages;
  }
}
