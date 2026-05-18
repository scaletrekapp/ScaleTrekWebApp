import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en";
import fr from "./locales/fr";
import ar from "./locales/ar";
import es from "./locales/es";

i18n.use(initReactI18next).init({
  resources: { en: { translation: en }, fr: { translation: fr }, ar: { translation: ar }, es: { translation: es } },
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

export default i18n;

export const languages = [
  { code: "en", label: "English", dir: "ltr" },
  { code: "fr", label: "Français", dir: "ltr" },
  { code: "ar", label: "العربية", dir: "rtl" },
  { code: "es", label: "Español", dir: "ltr" },
] as const;

export type LangCode = (typeof languages)[number]["code"];
