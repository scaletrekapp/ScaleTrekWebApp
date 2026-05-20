"use client";

import { useTranslation } from "react-i18next";
import { GlassCard } from "@/components/ui/GlassCard";
import { Badge } from "@/components/ui/Badge";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { LanguageSelector } from "@/components/ui/LanguageSelector";
import { useTheme } from "next-themes";

export default function SettingsPage({ params: { lang } }: { params: { lang: string } }) {
  const { t } = useTranslation();
  const { theme, setTheme } = useTheme();

  return (
    <div className="min-h-screen bg-white dark:bg-midnight">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-midnight dark:text-white mb-8">{t("settings.title")}</h1>

        <div className="space-y-6">
          {/* Appearance */}
          <GlassCard variant="dark">
            <h2 className="text-xs font-semibold text-slate-muted uppercase tracking-wider mb-4">
              {t("settings.appearance")}
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-midnight dark:text-white">{t("settings.theme")}</span>
                <div className="flex items-center gap-1 bg-black/5 dark:bg-white/5 rounded-lg p-0.5">
                  <button
                    onClick={() => setTheme("dark")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      theme === "dark"
                        ? "bg-midnight text-white shadow-sm"
                        : "text-slate-muted hover:text-midnight"
                    }`}
                  >
                    {t("settings.dark")}
                  </button>
                  <button
                    onClick={() => setTheme("light")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      theme === "light"
                        ? "bg-white text-midnight shadow-sm"
                        : "text-slate-muted hover:text-midnight"
                    }`}
                  >
                    {t("settings.light")}
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-midnight dark:text-white">{t("settings.language")}</span>
                <LanguageSelector />
              </div>
            </div>
          </GlassCard>

          {/* About */}
          <GlassCard variant="dark">
            <h2 className="text-xs font-semibold text-slate-muted uppercase tracking-wider mb-4">
              {t("settings.about")}
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-muted">ScaleTrek</span>
                <span className="text-sm text-midnight dark:text-white font-medium">v1.0.0</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-muted">{t("settings.version")}</span>
                <Badge label="Web" color="#8B5CF6" size="sm" />
              </div>
            </div>
          </GlassCard>
        </div>
      </main>
    </div>
  );
}
