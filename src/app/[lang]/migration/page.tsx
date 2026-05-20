"use client";

import { useTranslation } from "react-i18next";
import { Navbar } from "@/components/layout/Navbar";
import { GlassCard } from "@/components/ui/GlassCard";
import { Badge } from "@/components/ui/Badge";
import { useAuthStore } from "@/stores/useAuthStore";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-client";
import { useRouter } from "next/navigation";

export default function MigrationPage({ params: { lang } }: { params: { lang: string } }) {
  const { t } = useTranslation();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [request, setRequest] = useState<{ id: string; status: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const isDreamer = user?.role === "dreamer";
  const isInvestor = user?.role === "investor";

  useEffect(() => {
    if (!user) { router.push(`/${lang}`); return; }
    const supabase = createClient();
    supabase.from("migration_requests").select("id, status").eq("user_id", user.id).maybeSingle().then(({ data }) => {
      if (data) setRequest(data);
    });
  }, [user, router, lang]);

  const handleMigrate = async () => {
    if (!user) return;
    setSubmitting(true);
    const supabase = createClient();
    const { data } = await supabase.from("migration_requests").insert({
      user_id: user.id,
      current_type: user.role,
      target_type: isDreamer ? "reality" : "dreamer",
      status: "pending",
    }).select().single();
    if (data) setRequest(data);
    setSubmitting(false);
  };

  const currentLabel = isDreamer ? t("profile.dreamer") : isInvestor ? t("profile.investor") : t("profile.dreamer");
  const targetLabel = isDreamer ? t("profile.investor") : t("profile.dreamer");

  return (
    <div className="min-h-screen bg-white dark:bg-midnight">
      <Navbar lang={lang} />
        <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-2xl font-bold text-midnight dark:text-white mb-2">{t("migration.title")}</h1>
        <p className="text-sm text-slate-muted mb-8">{t("migration.preserveHistory")}</p>

        <GlassCard variant="dark" className="mb-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-muted">{t("migration.currentType")}</span>
              <Badge label={currentLabel} color={isDreamer ? "#8B5CF6" : "#06B6D4"} size="sm" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-muted">{t("migration.targetType")}</span>
              <Badge label={targetLabel} color={isDreamer ? "#06B6D4" : "#8B5CF6"} size="sm" />
            </div>
          </div>
        </GlassCard>

        {request ? (
          <GlassCard variant="dark">
            <div className="text-center py-4">
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-3 ${
                request.status === "pending" ? "bg-yellow-500/10 text-yellow-500" :
                request.status === "approved" ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
              }`}>
                {request.status === "pending" && (
                  <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
                )}
                {request.status === "pending" ? t("migration.pending") :
                 request.status === "approved" ? t("migration.approved") : t("migration.rejected")}
              </div>
              <p className="text-sm text-slate-muted">
                {request.status === "pending" ? t("migration.pending") : ""}
              </p>
            </div>
          </GlassCard>
        ) : (
          <button
            onClick={handleMigrate}
            disabled={submitting}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-violet to-violet-dark text-white font-semibold text-sm hover:brightness-110 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {submitting ? t("common.loading") : t("migration.apply")}
          </button>
        )}
      </main>
    </div>
  );
}
