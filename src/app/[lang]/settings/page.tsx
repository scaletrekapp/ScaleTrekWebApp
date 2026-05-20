"use client";

import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/Badge";
import { LanguageSelector } from "@/components/ui/LanguageSelector";
import { useTheme } from "next-themes";

export default function SettingsPage({ params: { lang } }: { params: { lang: string } }) {
  const { t } = useTranslation();
  const { theme, setTheme } = useTheme();

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--bg-primary)" }}>
      <main className="max-w-page mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-heading" style={{ color: "var(--text-primary)" }}>{t("settings.title")}</h1>

        <div className="space-y-6 mt-8">
          <div className="surface-card p-5">
            <h2 className="text-caption text-muted uppercase tracking-wider mb-4">
              {t("settings.appearance")}
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-body font-medium" style={{ color: "var(--text-primary)" }}>{t("settings.theme")}</span>
                <div className="flex items-center gap-1 rounded-lg p-0.5" style={{ backgroundColor: "color-mix(in srgb, var(--text-primary) 5%, transparent)" }}>
                  <button
                    onClick={() => setTheme("dark")}
                    className={`px-3 py-1.5 rounded-lg text-caption font-semibold transition-all ${
                      theme === "dark"
                        ? "bg-onyx-900 text-white shadow-sm"
                        : "text-muted hover:opacity-80"
                    }`}
                  >
                    {t("settings.dark")}
                  </button>
                  <button
                    onClick={() => setTheme("light")}
                    className={`px-3 py-1.5 rounded-lg text-caption font-semibold transition-all ${
                      theme === "light"
                        ? "bg-white text-charcoal shadow-sm"
                        : "text-muted hover:opacity-80"
                    }`}
                  >
                    {t("settings.light")}
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-body font-medium" style={{ color: "var(--text-primary)" }}>{t("settings.language")}</span>
                <LanguageSelector />
              </div>
            </div>
          </div>

          <div className="surface-card p-5">
            <h2 className="text-caption text-muted uppercase tracking-wider mb-4">
              {t("settings.about")}
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-body text-muted">ScaleTrek</span>
                <span className="text-body font-medium" style={{ color: "var(--text-primary)" }}>v1.0.0</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-body text-muted">{t("settings.version")}</span>
                <Badge label="Web" color="#8B5CF6" size="sm" />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
