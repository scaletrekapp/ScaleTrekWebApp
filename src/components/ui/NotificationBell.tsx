"use client";

import { useNotificationStore } from "@/stores/useNotificationStore";
import { useEffect, useRef, useState } from "react";
import { useAuthStore } from "@/stores/useAuthStore";
import { createClient } from "@/lib/supabase-client";
import Link from "next/link";
import { useTranslation } from "react-i18next";

export function NotificationBell({ lang }: { lang: string }) {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const { notifications, unreadCount, setNotifications, markRead, markAllRead } = useNotificationStore();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    const supabase = createClient();
    supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10)
      .then(({ data }) => {
        if (data) setNotifications(data.map(mapNotification));
      });

    const channel = supabase
      .channel("notifications")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` },
        (payload) => {
          const n = payload.new as any;
          useNotificationStore.getState().addNotification(n);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user, setNotifications]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg text-slate-muted hover:text-midnight dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute end-0 top-full mt-2 w-80 bg-graphite-900 border border-graphite-800/60 rounded-xl shadow-2xl shadow-black/40 z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-graphite-800/60">
            <span className="text-xs font-semibold text-slate-muted uppercase tracking-wider">{t("notification.title")}</span>
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="text-[10px] font-semibold text-violet hover:text-violet-light transition-colors">
                {t("notification.markAllRead")}
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="text-center py-8 text-sm text-slate-muted">{t("notification.empty")}</div>
            ) : (
              notifications.slice(0, 5).map((n) => (
                <button
                  key={n.id}
                  onClick={() => markRead(n.id)}
                  className={`w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-white/5 transition-colors border-b border-graphite-800/60 last:border-0 ${
                    !n.read ? "bg-violet/5 dark:bg-violet/5" : ""
                  }`}
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet/20 to-cyan/20 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-[10px] font-bold text-violet">{n.fromHandle?.charAt(0).toUpperCase() || "?"}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-midnight dark:text-white truncate">{n.title}</p>
                    <p className="text-[10px] text-slate-muted truncate">{n.body}</p>
                    <p className="text-[8px] text-slate-muted mt-0.5">
                      {new Date(n.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  {!n.read && <div className="w-2 h-2 rounded-full bg-violet shrink-0 mt-2" />}
                </button>
              ))
            )}
          </div>

          {notifications.length > 5 && (
            <Link
              href={`/${lang}/notifications`}
              onClick={() => setOpen(false)}
              className="block text-center py-2.5 text-xs font-semibold text-violet hover:bg-black/5 dark:hover:bg-white/5 transition-colors rounded-b-xl"
            >
              {t("common.viewAll")}
            </Link>
          )}
        </div>
      )}
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
