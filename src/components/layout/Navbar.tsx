"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { LanguageSelector } from "@/components/ui/LanguageSelector";
import { NotificationBell } from "@/components/ui/NotificationBell";
import { Logo } from "@/components/ui/Logo";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "@/stores/useAuthStore";
import { createClient } from "@/lib/supabase-client";

const NAV_ITEMS = [
  { key: "feed", href: "/feed", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
  { key: "create", href: "/create", icon: "M12 4.5v15m7.5-7.5h-15" },
  { key: "manifesto", href: "/manifesto", icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" },
] as const;

export function Navbar({ lang }: { lang: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useTranslation();
  const { user, isLoading, setUser } = useAuthStore();
  const isSuperAdmin = user?.role === "super_admin" || user?.role === "admin";
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setDropdownOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    setDropdownOpen(false);
    router.push(`/${lang}`);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-border dark:border-slate-border bg-white/80 dark:bg-midnight/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href={`/${lang}/feed`} className="shrink-0">
          <Logo size={28} />
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === `/${lang}${item.href}`;
            return (
              <Link
                key={item.key}
                href={`/${lang}${item.href}`}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-violet/10 dark:bg-violet/10 text-violet dark:text-violet"
                    : "text-slate-muted hover:text-midnight dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5"
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                </svg>
                {t(`nav.${item.key}`)}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-1">
          <LanguageSelector />
          <ThemeToggle />
          {user && <NotificationBell lang={lang} />}

          {isLoading ? (
            <div className="w-8 h-8 rounded-full border-2 border-violet border-t-transparent animate-spin" />
          ) : user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-midnight dark:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet to-cyan flex items-center justify-center text-white font-bold text-xs">
                  {user.handle?.charAt(0).toUpperCase() || "?"}
                </div>
                <span className="hidden sm:block max-w-[100px] truncate">@{user.handle}</span>
                <svg className={`w-3.5 h-3.5 text-slate-muted transition-transform ${dropdownOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </button>

              {dropdownOpen && (
                <div className="absolute end-0 top-full mt-2 w-56 bg-white dark:bg-midnight2 border border-slate-border rounded-xl shadow-2xl shadow-black/20 py-1.5 z-50">
                  <div className="px-4 py-2 border-b border-slate-border">
                    <p className="text-sm font-medium text-midnight dark:text-white truncate">@{user.handle}</p>
                    <p className="text-xs text-slate-muted truncate">{user.headline || user.role}</p>
                  </div>

                  <Link href={`/${lang}/profile`} onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-midnight dark:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                    <AvatarIcon /> {t("profile.title")}
                  </Link>

                  <Link href={`/${lang}/settings`} onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-midnight dark:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                    <SettingsIcon /> {t("settings.title")}
                  </Link>

                  <Link href={`/${lang}/subscription`} onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-midnight dark:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                    <LightningIcon /> {t("subscription.title")}
                  </Link>

                  <Link href={`/${lang}/migration`} onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-midnight dark:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                    <TransferIcon /> {t("migration.title")}
                  </Link>

                  {isSuperAdmin && (
                    <Link href={`/${lang}/admin`} onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-500/10 transition-colors border-t border-slate-border mt-1 pt-2">
                      <ShieldIcon /> {t("nav.admin")}
                    </Link>
                  )}

                  <button onClick={handleSignOut}
                    className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-slate-muted hover:text-red-500 hover:bg-red-500/5 transition-colors border-t border-slate-border mt-1 pt-2">
                    <SignOutIcon /> {t("nav.signOut")}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href={`/${lang}`}
                className="hidden sm:flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold text-slate-muted hover:text-midnight dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                {t("nav.logIn")}
              </Link>
              <Link href={`/${lang}`}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-violet to-violet-dark text-white hover:brightness-110 transition-all">
                {t("nav.register")}
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function AvatarIcon() {
  return (
    <svg className="w-4 h-4 text-slate-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg className="w-4 h-4 text-slate-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function LightningIcon() {
  return (
    <svg className="w-4 h-4 text-slate-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  );
}

function SignOutIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
    </svg>
  );
}

function TransferIcon() {
  return (
    <svg className="w-4 h-4 text-slate-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
    </svg>
  );
}
