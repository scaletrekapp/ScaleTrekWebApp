"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { LanguageSelector } from "@/components/ui/LanguageSelector";
import { Logo } from "@/components/ui/Logo";
import { createClient } from "@/lib/supabase-client";
import { useAuthStore } from "@/stores/useAuthStore";

export default function AuthPage({ params: { lang } }: { params: { lang: string } }) {
  const { t } = useTranslation();
  const router = useRouter();
  const { setUser } = useAuthStore();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (mode === "signup") {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { username, name, role: "dreamer" },
          },
        });
        if (signUpError) throw signUpError;
        if (data.user) {
          setUser({
            id: data.user.id,
            handle: username,
            role: "dreamer",
            verified: false,
            realityScore: 0,
            momentumScore: 0,
            joinedAt: data.user.created_at,
          });
        }
      } else {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
        if (data.user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", data.user.id)
            .single();
          if (profile) {
            setUser({
              id: profile.id,
              handle: profile.handle,
              role: profile.role,
              verified: profile.verified,
              realityScore: profile.reality_score,
              momentumScore: profile.momentum_score,
              headline: profile.headline,
              location: profile.location,
              website: profile.website,
              companyName: profile.company_name,
              sector: profile.sector,
              bio: profile.bio,
              isPro: profile.is_pro,
              avatar: profile.avatar_url,
              coverUrl: profile.cover_url,
              joinedAt: profile.created_at,
            });
          }
        }
      }
      router.push(`/${lang}/feed`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-midnight via-midnight2 to-midnight3 border-r border-slate-border">
        <Logo size={36} className="[&_span]:text-white" />
        <div className="max-w-md">
          <h1 className="text-4xl font-bold text-white mb-4 leading-tight">
            {t("manifesto.title")}
          </h1>
          <p className="text-slate-muted text-lg leading-relaxed">
            {t("manifesto.subtitle")}
          </p>
          <div className="mt-8 flex gap-4">
            <div className="flex items-center gap-2 text-sm text-slate-muted">
              <div className="w-2 h-2 rounded-full bg-violet" />
              {t("feed.dreamer")}
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-muted">
              <div className="w-2 h-2 rounded-full bg-cyan" />
              {t("feed.reality")}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <LanguageSelector />
          <ThemeToggle />
        </div>
      </div>

      <div className="flex items-center justify-center p-8 bg-white dark:bg-midnight">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center justify-between mb-8">
            <Logo size={28} />
            <div className="flex items-center gap-2">
              <LanguageSelector />
              <ThemeToggle />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-midnight dark:text-white mb-1">
            {mode === "signin" ? t("auth.welcomeBack") : t("auth.joinNetwork")}
          </h2>
          <p className="text-slate-muted text-sm mb-8">
            {mode === "signin" ? t("auth.noAccount") : t("auth.hasAccount")}{" "}
            <button
              onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
              className="text-violet hover:text-violet-light font-medium transition-colors"
            >
              {mode === "signin" ? t("auth.signUpLink") : t("auth.signInLink")}
            </button>
          </p>

          {error && (
            <div className="mb-4 px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-muted uppercase tracking-wider mb-1.5">
                    {t("auth.name")}
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-black/5 dark:bg-white/5 border border-slate-border dark:border-slate-border text-midnight dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet/40 transition-all"
                    placeholder="Omar El Khatib"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-muted uppercase tracking-wider mb-1.5">
                    {t("auth.username")}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-muted text-sm">@</span>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-black/5 dark:bg-white/5 border border-slate-border dark:border-slate-border text-midnight dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet/40 transition-all"
                      placeholder="omar_elkh"
                      required
                    />
                  </div>
                </div>
              </>
            )}
            <div>
              <label className="block text-xs font-semibold text-slate-muted uppercase tracking-wider mb-1.5">
                {t("auth.email")}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-black/5 dark:bg-white/5 border border-slate-border dark:border-slate-border text-midnight dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet/40 transition-all"
                placeholder="omar@example.com"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-muted uppercase tracking-wider mb-1.5">
                {t("auth.password")}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-black/5 dark:bg-white/5 border border-slate-border dark:border-slate-border text-midnight dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet/40 transition-all"
                placeholder="••••••••"
                required
                minLength={6}
              />
              {mode === "signin" && (
                <div className="text-right mt-1">
                  <button type="button" className="text-xs text-slate-muted hover:text-violet transition-colors">
                    {t("auth.forgotPassword")}
                  </button>
                </div>
              )}
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-violet to-violet-dark text-white font-semibold text-sm hover:brightness-110 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? t("common.loading") : (mode === "signin" ? t("auth.signIn") : t("auth.signUp"))}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-slate-muted">
              {t("auth.terms")} <Link href={`/${lang}/terms`} className="text-violet hover:underline">{t("legal.terms")}</Link> & <Link href={`/${lang}/privacy`} className="text-violet hover:underline">{t("legal.privacy")}</Link>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
