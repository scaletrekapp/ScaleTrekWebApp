"use client";

import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Navbar } from "@/components/layout/Navbar";
import { GlassCard } from "@/components/ui/GlassCard";
import { Badge } from "@/components/ui/Badge";
import { useSubscriptionStore } from "@/stores/useSubscriptionStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { createClient } from "@/lib/supabase-client";

export default function SubscriptionPage({ params: { lang } }: { params: { lang: string } }) {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const { tier, isPro, interestRegistered, setSubscription, setInterestRegistered } = useSubscriptionStore();

  useEffect(() => {
    if (!user) return;
    const supabase = createClient();
    supabase.from("subscriptions").select("*").eq("user_id", user.id).single().then(({ data }) => {
      if (data) {
        setSubscription(data.tier, data.status);
        setInterestRegistered(data.interest_registered);
      }
    });
  }, [user, setSubscription, setInterestRegistered]);

  const handleInterest = async () => {
    const supabase = createClient();
    const newVal = !interestRegistered;
    setInterestRegistered(newVal);
    if (user) {
      await supabase.from("subscriptions").upsert({
        user_id: user.id,
        tier: "free",
        status: "active",
        interest_registered: newVal,
      }, { onConflict: "user_id" });
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-midnight">
      <Navbar lang={lang} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet/10 text-violet text-xs font-semibold tracking-wide uppercase mb-4">
            {t("subscription.title")}
          </div>
          <h1 className="text-3xl font-extrabold text-midnight dark:text-white mb-2">
            {isPro ? t("subscription.youArePro") : t("subscription.goPro")}
          </h1>
          <p className="text-slate-muted text-sm max-w-md mx-auto">
            {t("subscription.comingSoon")}
          </p>
        </div>

        <GlassCard variant="dark" className="mb-6 text-center">
          <div className="py-4">
            <Badge
              label={isPro ? t("subscription.pro") : t("subscription.free")}
              color={isPro ? "#8B5CF6" : "#6B7280"}
              variant={isPro ? "glow" : "outline"}
              size="md"
            />
            <p className="text-slate-muted text-sm mt-3 max-w-md mx-auto">
              {t("subscription.comingSoon")}
            </p>
            <button
              onClick={handleInterest}
              className={`mt-4 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                interestRegistered
                  ? "bg-green-500/10 text-green-500 border border-green-500/20 cursor-default"
                  : "bg-violet text-white hover:brightness-110 active:scale-[0.98]"
              }`}
            >
              {interestRegistered ? t("subscription.registered") : t("subscription.registerInterest")}
            </button>
          </div>
        </GlassCard>

        <GlassCard variant="dark">
          <h2 className="text-xs font-semibold text-slate-muted uppercase tracking-wider mb-4">
            {t("subscription.perksTitle")}
          </h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { label: t("subscription.perks.video"), icon: "M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" },
              { label: t("subscription.perks.media"), icon: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" },
              { label: t("subscription.perks.badge"), icon: "M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" },
              { label: t("subscription.perks.analytics"), icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" },
            ].map((perk, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-black/5 dark:bg-white/5">
                <div className="w-8 h-8 rounded-lg bg-violet/10 flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4 text-violet" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={perk.icon} />
                  </svg>
                </div>
                <span className="text-sm text-midnight dark:text-white font-medium pt-1">{perk.label}</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </main>
    </div>
  );
}
