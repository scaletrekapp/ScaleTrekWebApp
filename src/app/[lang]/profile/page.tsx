"use client";

import { useTranslation } from "react-i18next";
import { Navbar } from "@/components/layout/Navbar";
import { GlassCard } from "@/components/ui/GlassCard";
import { Badge } from "@/components/ui/Badge";
import { MomentumPill } from "@/components/ui/MomentumPill";
import Link from "next/link";

const MOCK_USER = {
  handle: "neon_pioneer",
  role: "dreamer" as const,
  verified: true,
  realityScore: 82,
  momentumScore: 72,
  headline: "Building the next generation of BCI technology",
  location: "Rabat, Morocco",
  website: "neonpioneer.tech",
  companyName: "Neon Systems",
  sector: "Deep Tech",
  joinedAt: new Date(Date.now() - 86400000 * 120).toISOString(),
};

export default function ProfilePage({ params: { lang } }: { params: { lang: string } }) {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-white dark:bg-midnight">
      <Navbar lang={lang} />
      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* Cover */}
        <div className="h-40 sm:h-56 rounded-2xl bg-gradient-to-br from-violet/20 via-cyan/10 to-midnight3 border border-slate-border overflow-hidden mb-6 relative">
          <div className="absolute inset-0 bg-gradient-to-t from-midnight/60 via-transparent to-transparent" />
        </div>

        <div className="relative -mt-20 mb-8 flex items-end gap-5 px-2">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet to-violet-dark border-4 border-white dark:border-midnight flex items-center justify-center shadow-xl">
            <span className="text-white font-bold text-2xl">N</span>
          </div>
          <div className="pb-1 flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-midnight dark:text-white">@{MOCK_USER.handle}</h1>
              {MOCK_USER.verified && (
                <svg className="w-4 h-4 text-cyan" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              )}
            </div>
            <p className="text-sm text-slate-muted">{MOCK_USER.headline}</p>
            <div className="flex items-center gap-3 mt-1.5">
              <Badge label={MOCK_USER.role} color="#8B5CF6" size="sm" variant="outline" />
              <MomentumPill score={MOCK_USER.momentumScore} size="sm" />
            </div>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid sm:grid-cols-2 gap-4 mb-8">
          <GlassCard variant="dark">
            <div className="space-y-3 text-sm">
              {MOCK_USER.location && (
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-slate-muted shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                  </svg>
                  <span className="text-slate-muted">{MOCK_USER.location}</span>
                </div>
              )}
              {MOCK_USER.companyName && (
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-slate-muted shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
                  </svg>
                  <span className="text-midnight dark:text-white font-medium">{MOCK_USER.companyName}</span>
                  {MOCK_USER.sector && (
                    <Badge label={MOCK_USER.sector} color="#06B6D4" size="sm" />
                  )}
                </div>
              )}
              {MOCK_USER.website && (
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-slate-muted shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
                  </svg>
                  <a
                    href={`https://${MOCK_USER.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-violet hover:text-violet-light transition-colors"
                  >
                    {MOCK_USER.website}
                  </a>
                </div>
              )}
            </div>
          </GlassCard>

          <GlassCard variant="dark">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg font-bold text-midnight dark:text-white">4</div>
                <div className="text-[10px] text-slate-muted uppercase tracking-wide mt-0.5">{t("profile.showcases")}</div>
              </div>
              <div>
                <div className="text-lg font-bold text-cyan">{MOCK_USER.momentumScore}</div>
                <div className="text-[10px] text-slate-muted uppercase tracking-wide mt-0.5">{t("profile.momentum")}</div>
              </div>
              <div>
                <div className="text-lg font-bold text-green-500">{MOCK_USER.realityScore}</div>
                <div className="text-[10px] text-slate-muted uppercase tracking-wide mt-0.5">{t("profile.realityScore")}</div>
              </div>
            </div>
          </GlassCard>
        </div>
      </main>
    </div>
  );
}
