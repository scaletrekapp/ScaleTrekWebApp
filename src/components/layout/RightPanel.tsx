"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/stores/useAuthStore";
import { useTranslation } from "react-i18next";

interface RightPanelProps {
  lang: string;
}

export function RightPanel({ lang }: RightPanelProps) {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const [open, setOpen] = useState(true);
  const isSuperAdmin = user?.role === "super_admin" || user?.role === "admin";

  return (
    <>
      {/* Toggle button (floating, on mobile shown always) */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed right-4 top-4 z-50 w-8 h-8 rounded-lg bg-onyx-800 border border-onyx-700/60 flex items-center justify-center text-slate-muted hover:text-white hover:bg-onyx-700/60 transition-colors lg:right-auto lg:static"
        aria-label={open ? "Close panel" : "Open panel"}
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d={open ? "M6 18L18 6M6 6l12 12" : "M3.75 3.75l16.5 16.5M3.75 20.25l16.5-16.5"} />
        </svg>
      </button>

      <AnimatePresence>
        {open && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 320, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="h-screen sticky top-0 right-0 z-40 flex flex-col bg-onyx-900 border-l border-onyx-700/60 overflow-hidden shrink-0"
          >
            {/* Header */}
            <div className="flex items-center justify-between h-14 px-4 shrink-0 border-b border-onyx-700/60">
              <span className="text-xs font-semibold text-slate-muted uppercase tracking-[0.12em]">
                {t("rightPanel.overview")}
              </span>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
              {/* Momentum ticker placeholder */}
              <div className="panel p-4 space-y-3">
                <p className="text-executive">{t("rightPanel.liveMomentum")}</p>
                <div className="space-y-2">
                  {[
                    { label: t("rightPanel.avgTraction"), value: "+18.4%", delta: "positive" },
                    { label: t("rightPanel.activeDeals"), value: "7", delta: "neutral" },
                    { label: t("rightPanel.verifiedMilestones"), value: "43", delta: "positive" },
                  ].map((metric) => (
                    <div key={metric.label} className="flex items-center justify-between py-1.5">
                      <span className="text-xs text-slate-muted">{metric.label}</span>
                      <span className={`ticker-text ${metric.delta === "positive" ? "text-emerald" : "text-white"}`}>{metric.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Active chat heads */}
              {user && (
                <div className="panel p-4 space-y-3">
                  <p className="text-executive">{t("rightPanel.activeChats")}</p>
                  <div className="space-y-2">
                    {[1, 2].map((i) => (
                      <div key={i} className="flex items-center gap-3 py-2 px-2 rounded-lg hover:bg-white/[0.03] transition-colors cursor-pointer">
                        <div className="relative shrink-0">
                          <div className="w-8 h-8 rounded-full bg-violet/10 flex items-center justify-center text-xs font-bold text-violet-light">
                            {String.fromCharCode(64 + i)}
                          </div>
                          <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald border-2 border-onyx-900" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-white truncate">User {i}</p>
                          <p className="text-[11px] text-slate-muted truncate">Encrypted message...</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick actions for admin */}
              {isSuperAdmin && (
                <div className="panel p-4 space-y-3">
                  <p className="text-executive">{t("rightPanel.quickActions")}</p>
                  <div className="space-y-1.5">
                    <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-white bg-violet/10 hover:bg-violet/20 transition-colors">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                      </svg>
                      {t("rightPanel.newInvoice")}
                    </button>
                    <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-emerald bg-emerald/10 hover:bg-emerald/20 transition-colors">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      {t("rightPanel.verify")}
                    </button>
                  </div>
                </div>
              )}

              {/* Subscription CTA for non-pro users */}
              {user && !user.isPro && (
                <div className="panel p-4 space-y-3 border-violet/10">
                  <p className="text-executive text-violet-light">{t("rightPanel.upgrade")}</p>
                  <p className="text-[11px] text-slate-muted leading-relaxed">{t("rightPanel.upgradeDesc")}</p>
                  <a
                    href={`/${lang}/subscription`}
                    className="block w-full text-center px-3 py-2 rounded-lg text-xs font-semibold bg-violet text-white hover:brightness-110 transition-all"
                  >
                    {t("rightPanel.viewPlans")}
                  </a>
                </div>
              )}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
