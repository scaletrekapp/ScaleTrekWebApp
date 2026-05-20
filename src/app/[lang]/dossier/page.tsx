"use client";

import { useTranslation } from "react-i18next";
import { useAuthStore } from "@/stores/useAuthStore";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-client";
import { useRouter } from "next/navigation";
import type { User } from "@/types";

export default function DossierPage({ params: { lang } }: { params: { lang: string } }) {
  const { t } = useTranslation();
  const router = useRouter();
  const authUser = useAuthStore((s) => s.user);
  const [profile, setProfile] = useState<User | null>(null);
  const [posts, setPosts] = useState<number>(0);

  useEffect(() => {
    if (!authUser) { router.push(`/${lang}`); return; }
    setProfile(authUser);
    const supabase = createClient();
    supabase.from("posts").select("id", { count: "exact", head: true }).eq("user_id", authUser.id).then(({ count }) => {
      if (count !== null) setPosts(count);
    });
  }, [authUser, router, lang]);

  const handlePrint = () => window.print();

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-graphite">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 print:py-0 print:px-0">
        <div className="flex items-center justify-between mb-8 print:hidden">
          <button onClick={() => router.back()} className="flex items-center gap-1.5 text-sm text-slate-muted hover:text-white transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            {t("common.back")}
          </button>
          <button onClick={handlePrint} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-violet text-white text-sm font-semibold hover:brightness-110 transition-all">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z" />
            </svg>
            {t("dossier.download") || "Print"}
          </button>
        </div>

        <div className="print:block">
          <div className="text-center mb-10 print:mb-6">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-violet to-cyan flex items-center justify-center">
              <span className="text-white font-bold text-2xl">{profile.handle?.charAt(0).toUpperCase() || "?"}</span>
            </div>
            <h1 className="text-2xl font-bold text-midnight dark:text-white print:text-black mb-1">@{profile.handle}</h1>
            <p className="text-sm text-slate-muted print:text-gray-600">{profile.headline || profile.role}</p>
            <p className="text-xs text-slate-muted print:text-gray-500 mt-2">
              {t("dossier.generated")}: {new Date().toLocaleDateString()}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6 mb-8">
            <div className="p-5 rounded-2xl bg-black/5 dark:bg-white/5 print:bg-gray-50 border border-slate-border">
              <h2 className="text-xs font-semibold text-slate-muted uppercase tracking-wider mb-3">{t("dossier.profile")}</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-muted">{t("profile.momentum")}</span>
                  <span className="font-semibold text-midnight dark:text-white print:text-black">{profile.momentumScore}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-muted">{t("profile.realityScore")}</span>
                  <span className="font-semibold text-midnight dark:text-white print:text-black">{profile.realityScore}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-muted">{t("profile.verified")}</span>
                  <span className="font-semibold text-midnight dark:text-white print:text-black">{profile.verified ? "✓" : "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-muted">{t("profile.joined")}</span>
                  <span className="font-semibold text-midnight dark:text-white print:text-black">{new Date(profile.joinedAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-black/5 dark:bg-white/5 print:bg-gray-50 border border-slate-border">
              <h2 className="text-xs font-semibold text-slate-muted uppercase tracking-wider mb-3">{t("dossier.metrics")}</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-muted">{t("dossier.momentumScore")}</span>
                  <span className="font-semibold text-midnight dark:text-white print:text-black">{profile.momentumScore}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-muted">{t("dossier.realityScore")}</span>
                  <span className="font-semibold text-midnight dark:text-white print:text-black">{profile.realityScore}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-muted">{t("feed.posts") || "Posts"}</span>
                  <span className="font-semibold text-midnight dark:text-white print:text-black">{posts}</span>
                </div>
              </div>
            </div>
          </div>

          {profile.location && (
            <div className="p-5 rounded-2xl bg-black/5 dark:bg-white/5 print:bg-gray-50 border border-slate-border mb-8">
              <div className="flex items-center gap-2 text-sm">
                <svg className="w-4 h-4 text-slate-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
                <span className="text-midnight dark:text-white print:text-black">{profile.location}</span>
              </div>
            </div>
          )}
        </div>

        <div className="print:hidden text-center text-xs text-slate-muted mt-8 pb-8">
          <button onClick={handlePrint} className="text-violet hover:text-violet-light transition-colors font-medium">{t("dossier.print")}</button>
        </div>
      </div>
    </div>
  );
}
