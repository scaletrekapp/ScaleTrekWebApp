"use client";

import { useTranslation } from "react-i18next";
import { GlassCard } from "@/components/ui/GlassCard";
import { useNotificationStore } from "@/stores/useNotificationStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { useEffect } from "react";
import { createClient } from "@/lib/supabase-client";
import { useRouter } from "next/navigation";

export default function NotificationsPage({ params: { lang } }: { params: { lang: string } }) {
  const { t } = useTranslation();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const { notifications, setNotifications, markRead, markAllRead } = useNotificationStore();

  useEffect(() => {
    if (!user) { router.push(`/${lang}`); return; }
    const supabase = createClient();
    supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (data) setNotifications(data.map(mapNotification));
      });
  }, [user, setNotifications, router, lang]);

  return (
    <div className="min-h-screen bg-white dark:bg-midnight">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-midnight dark:text-white">{t("notification.title")}</h1>
          <button
            onClick={markAllRead}
            className="px-4 py-2 rounded-xl bg-violet/10 text-violet text-xs font-semibold hover:bg-violet/20 transition-colors"
          >
            {t("notification.markAllRead")}
          </button>
        </div>

        <div className="space-y-2">
          {notifications.length === 0 ? (
            <GlassCard variant="dark">
              <div className="text-center py-10">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center">
                  <svg className="w-6 h-6 text-slate-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                  </svg>
                </div>
                <p className="text-sm text-slate-muted">{t("notification.empty")}</p>
              </div>
            </GlassCard>
          ) : (
            notifications.map((n) => (
              <button
                key={n.id}
                onClick={() => markRead(n.id)}
                className={`w-full flex items-start gap-4 px-4 py-3.5 rounded-xl text-left transition-colors border border-slate-border ${
                  !n.read
                    ? "bg-violet/5 dark:bg-violet/5 border-violet/10 dark:border-violet/10"
                    : "bg-white dark:bg-midnight2 hover:bg-black/5 dark:hover:bg-white/5"
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet/20 to-cyan/20 flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-violet">{n.fromHandle?.charAt(0).toUpperCase() || "?"}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-midnight dark:text-white">{n.title}</p>
                  <p className="text-xs text-slate-muted mt-0.5">{n.body}</p>
                  <p className="text-[10px] text-slate-muted mt-1">
                    {new Date(n.createdAt).toLocaleDateString(undefined, {
                      day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
                    })}
                  </p>
                </div>
                {!n.read && <div className="w-2.5 h-2.5 rounded-full bg-violet shrink-0 mt-2" />}
              </button>
            ))
          )}
        </div>
      </main>
    </div>
  );
}

function mapNotification(raw: any) {
  return {
    id: raw.id,
    type: raw.type,
    title: raw.title || "",
    body: raw.body || "",
    fromHandle: raw.from_handle || "",
    fromAvatar: raw.from_avatar,
    read: raw.read,
    createdAt: raw.created_at,
    postId: raw.post_id,
  };
}
