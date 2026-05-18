import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./dictionaries/en.json";
import fr from "./dictionaries/fr.json";
import ar from "./dictionaries/ar.json";
import es from "./dictionaries/es.json";

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
