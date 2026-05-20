"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Logo } from "@/components/ui/Logo";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { LanguageSelector } from "@/components/ui/LanguageSelector";
import { NotificationBell } from "@/components/ui/NotificationBell";
import { useAuthStore } from "@/stores/useAuthStore";
import { createClient } from "@/lib/supabase-client";
import { useTranslation } from "react-i18next";

interface SidebarProps {
  lang: string;
}

const NAV_SECTIONS = [
  {
    label: "nav.sectionMain",
    items: [
      { key: "feed", href: "/feed", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
      { key: "chat", href: "/chat", icon: "M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" },
      { key: "create", href: "/create", icon: "M12 4.5v15m7.5-7.5h-15" },
      { key: "manifesto", href: "/manifesto", icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" },
    ],
  },
];

const UTILITY_ITEMS = [
  { key: "profile", href: "/profile", icon: "M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" },
  { key: "settings", href: "/settings", icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" },
  { key: "subscription", href: "/subscription", icon: "M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" },
];

export function Sidebar({ lang }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useTranslation();
  const { user, isLoading, setUser } = useAuthStore();
  const [collapsed, setCollapsed] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isSuperAdmin = user?.role === "super_admin" || user?.role === "admin";

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setUserMenuOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    setUserMenuOpen(false);
    router.push(`/${lang}`);
  };

  const isActive = (href: string) => pathname === `/${lang}${href}`;

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 64 : 240 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="h-screen sticky top-0 z-50 flex flex-col bg-onyx-900 border-r border-onyx-700/60 overflow-hidden"
    >
      {/* Logo + collapse toggle */}
      <div className="flex items-center justify-between h-14 px-4 shrink-0 border-b border-onyx-700/60">
        <AnimatePresence mode="wait">
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Link href={`/${lang}/feed`}>
                <Logo size={22} />
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-muted hover:text-white hover:bg-white/5 transition-colors shrink-0"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d={collapsed ? "M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" : "M3.75 3.75l16.5 16.5M3.75 20.25l16.5-16.5"} />
          </svg>
        </button>
      </div>

      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6 scrollbar-hide">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label}>
            {!collapsed && (
              <p className="nav-section-label mb-2">{t(section.label)}</p>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.key}
                    href={`/${lang}${item.href}`}
                    className={`sidebar-item ${active ? "active" : ""} ${collapsed ? "collapsed" : ""}`}
                    title={collapsed ? t(`nav.${item.key}`) : undefined}
                  >
                    <svg className="w-[18px] h-[18px] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                    </svg>
                    <AnimatePresence mode="wait">
                      {!collapsed && (
                        <motion.span
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -8 }}
                          transition={{ duration: 0.2 }}
                        >
                          {t(`nav.${item.key}`)}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}

        {/* Utilities section */}
        {user && (
          <div>
            {!collapsed && <p className="nav-section-label mb-2">{t("nav.sectionAccount")}</p>}
            <div className="space-y-0.5">
              {UTILITY_ITEMS.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.key}
                    href={`/${lang}${item.href}`}
                    className={`sidebar-item ${active ? "active" : ""} ${collapsed ? "collapsed" : ""}`}
                    title={collapsed ? t(`${item.key}.title`) : undefined}
                  >
                    <svg className="w-[18px] h-[18px] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                    </svg>
                    <AnimatePresence mode="wait">
                      {!collapsed && (
                        <motion.span
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -8 }}
                          transition={{ duration: 0.2 }}
                        >
                          {t(`${item.key}.title`)}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Role-specific items */}
        {(user?.role === "investor" || isSuperAdmin) && (
          <div>
            {!collapsed && <p className="nav-section-label mb-2">{t("nav.sectionInvestor")}</p>}
            <Link
              href={`/${lang}/investor`}
              className={`sidebar-item ${isActive("/investor") ? "active" : ""} ${collapsed ? "collapsed" : ""}`}
              title={collapsed ? t("investor.title") : undefined}
            >
              <svg className="w-[18px] h-[18px] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5" />
              </svg>
              <AnimatePresence mode="wait">
                {!collapsed && (
                  <motion.span initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }} transition={{ duration: 0.2 }}>
                    {t("investor.title")}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          </div>
        )}

        {isSuperAdmin && (
          <Link
            href={`/${lang}/admin`}
            className={`sidebar-item ${isActive("/admin") ? "active" : ""} ${collapsed ? "collapsed" : ""}`}
            title={collapsed ? t("nav.admin") : undefined}
          >
            <svg className="w-[18px] h-[18px] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <AnimatePresence mode="wait">
              {!collapsed && (
                <motion.span initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }} transition={{ duration: 0.2 }}>
                  {t("nav.admin")}
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
        )}
      </nav>

      {/* Bottom section: theme, language, user */}
      <div className="shrink-0 border-t border-onyx-700/60 p-3 space-y-1">
        {/* Theme + Language toggles */}
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <LanguageSelector />
        </div>

        {/* User area */}
        {isLoading ? (
          <div className="flex items-center justify-center py-2">
            <div className="w-5 h-5 rounded-full border-2 border-violet border-t-transparent animate-spin" />
          </div>
        ) : user ? (
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className={`flex items-center gap-3 w-full rounded-lg transition-colors hover:bg-white/[0.03] ${collapsed ? "justify-center p-2" : "p-2"}`}
            >
              <div className="w-7 h-7 rounded-full bg-violet/20 text-violet-light flex items-center justify-center font-bold text-xs shrink-0">
                {user.handle?.charAt(0).toUpperCase() || "?"}
              </div>
              <AnimatePresence mode="wait">
                {!collapsed && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex-1 min-w-0 text-left"
                  >
                    <p className="text-sm font-medium text-white truncate">@{user.handle}</p>
                    <p className="text-[11px] text-slate-muted truncate">{user.headline || user.role}</p>
                  </motion.div>
                )}
              </AnimatePresence>
              {!collapsed && (
                <svg className={`w-3 h-3 text-slate-muted transition-transform shrink-0 ${userMenuOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              )}
            </button>

            <AnimatePresence>
              {userMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -4, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.96 }}
                  transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute bottom-full left-0 right-0 mb-2 bg-onyx-800 border border-onyx-700/60 rounded-xl shadow-2xl shadow-black/30 py-1.5 z-50"
                >
                  <Link href={`/${lang}/profile`} onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-white hover:bg-white/5 transition-colors">
                    <UserIcon /> {t("profile.title")}
                  </Link>
                  <Link href={`/${lang}/migration`} onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-white hover:bg-white/5 transition-colors">
                    <TransferIcon /> {t("migration.title")}
                  </Link>
                  {(user?.role === "investor" || isSuperAdmin) && (
                    <Link href={`/${lang}/investor-apply`} onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-emerald hover:bg-emerald/5 transition-colors">
                      <BriefcaseIcon /> {t("investor-apply.title")}
                    </Link>
                  )}
                  <button onClick={handleSignOut}
                    className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-slate-muted hover:text-ruby hover:bg-ruby/5 transition-colors border-t border-onyx-700/60 mt-1 pt-2">
                    <SignOutIcon /> {t("nav.signOut")}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <div className={collapsed ? "flex flex-col items-center gap-1" : "space-y-1"}>
            <Link href={`/${lang}`}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-slate-muted hover:text-white hover:bg-white/5 transition-colors ${collapsed ? "justify-center" : ""}`}>
              {t("nav.logIn")}
            </Link>
            <Link href={`/${lang}`}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold bg-violet text-white hover:brightness-110 transition-all ${collapsed ? "justify-center" : ""}`}>
              {t("nav.register")}
            </Link>
          </div>
        )}
      </div>
    </motion.aside>
  );
}

function UserIcon() {
  return (
    <svg className="w-4 h-4 text-slate-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
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

function BriefcaseIcon() {
  return (
    <svg className="w-4 h-4 text-emerald" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
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
