"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { LanguageSelector } from "@/components/ui/LanguageSelector";
import { Logo } from "@/components/ui/Logo";
import { GlowButton } from "@/components/ui/GlowButton";
import { GlassCard } from "@/components/ui/GlassCard";
import { Badge } from "@/components/ui/Badge";
import { AnimatedGradient } from "@/components/ui/AnimatedGradient";
import { createClient } from "@/lib/supabase-client";
import { useAuthStore } from "@/stores/useAuthStore";

type Stream = "dreamer" | "reality";
type AuthTab = "signin" | "signup";

const streamConfig = {
  dreamer: {
    label: "Dreamer Blueprints",
    tagline: "The Blueprint — For visionary architects building the future",
    features: "Structured Roadmaps · Milestone Tracking · Technical Architecture · Risk Analysis",
    color: "#8B5CF6",
    key: "dreamer" as const,
  },
  reality: {
    label: "Reality Checks",
    tagline: "The Steel — For verified operators with revenue and traction",
    features: "Timestamped Updates · Video Proof · Revenue Metrics · Team Growth",
    color: "#06B6D4",
    key: "reality" as const,
  },
};

export default function AuthPage({ params: { lang } }: { params: { lang: string } }) {
  const { t } = useTranslation();
  const router = useRouter();
  const { user, isAuthenticated, isLoading, setUser } = useAuthStore();
  const [stream, setStream] = useState<Stream>("dreamer");
  const [authTab, setAuthTab] = useState<AuthTab>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [inviteCode, setInviteCode] = useState("");
  const feedRef = useRef<HTMLDivElement>(null);

  const supabase = createClient();
  const cfg = streamConfig[stream];

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (isAuthenticated && user) {
      router.replace(`/${lang}/feed`);
    } else {
      setPageLoading(false);
    }
  }, [isAuthenticated, user, mounted, lang, router]);

  const scrollToAuth = () => {
    feedRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      if (authTab === "signup") {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username,
              name,
              role: "dreamer",
              ...(inviteCode ? { invite_code: inviteCode } : {}),
            },
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
        const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
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
      setError(err instanceof Error ? err.message : t("common.error"));
    } finally {
      setSubmitting(false);
    }
  };

  if (pageLoading || (!mounted)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-midnight">
        <div className="flex flex-col items-center gap-4">
          <Logo size={48} showText={false} />
          <div className="w-6 h-6 border-2 border-violet border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-midnight text-white overflow-x-hidden">
      <AnimatedGradient />

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slide-in-left {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slide-in-right {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes glow-pulse {
          0%, 100% { box-shadow: 0 0 20px rgba(139,92,246,0.15); }
          50% { box-shadow: 0 0 40px rgba(139,92,246,0.3); }
        }
        @keyframes gradient-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-float-delayed { animation: float-delayed 7s ease-in-out infinite; }
        .animate-fade-in-up { animation: fade-in-up 0.8s cubic-bezier(0.16,1,0.3,1) forwards; }
        .animate-fade-in { animation: fade-in 0.6s ease-out forwards; }
        .animate-slide-in-left { animation: slide-in-left 0.5s cubic-bezier(0.16,1,0.3,1) forwards; }
        .animate-slide-in-right { animation: slide-in-right 0.5s cubic-bezier(0.16,1,0.3,1) forwards; }
        .animate-glow-pulse { animation: glow-pulse 3s ease-in-out infinite; }
        .animate-gradient-shift {
          background-size: 200% 200%;
          animation: gradient-shift 4s ease infinite;
        }
        .text-gradient-violet {
          background: linear-gradient(135deg, #8B5CF6, #A78BFA);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .text-gradient-cyan {
          background: linear-gradient(135deg, #06B6D4, #22D3EE);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .text-gradient-dual {
          background: linear-gradient(135deg, #8B5CF6 0%, #A78BFA 30%, #06B6D4 70%, #22D3EE 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
      `}</style>

      {/* ─── NAV BAR ─── */}
      <nav className="fixed top-0 left-0 right-0 z-50">
        <div className="absolute inset-0 bg-midnight/60 backdrop-blur-xl border-b border-white/[0.04]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Logo size={32} className="[&_span]:text-white" />
          <div className="flex items-center gap-2">
            <LanguageSelector />
          </div>
        </div>
      </nav>

      {/* ─── HERO ─── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-4 pt-20 pb-16">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className={`absolute top-1/4 -left-32 w-96 h-96 rounded-full opacity-20 blur-[160px] transition-all duration-1000 ${stream === "dreamer" ? "bg-violet" : "bg-cyan"}`} />
          <div className={`absolute bottom-1/4 -right-32 w-80 h-80 rounded-full opacity-10 blur-[140px] transition-all duration-1000 ${stream === "dreamer" ? "bg-cyan" : "bg-violet"}`} />
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          <div className="animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
            <Badge
              label={t("nav.manifesto")}
              color={cfg.color}
              variant="glow"
              size="md"
            />
          </div>

          <h1 className="mt-6 text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-logo font-bold leading-[1.05] tracking-tight">
            <span className="block">The</span>
            <span className="block">
              <span className="text-gradient-violet">Blueprint</span>
              <span className="text-white/40 mx-3 font-light">Meets</span>
              <span className="text-gradient-cyan">The</span>
            </span>
            <span className="text-gradient-cyan">Steel</span>
          </h1>

          <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-slate-muted/80 leading-relaxed font-light">
            {t("manifesto.subtitle")}
          </p>

          {/* ─── DUAL-STREAM TOGGLE ─── */}
          <div className="mt-12 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
            <div className="inline-flex items-center p-1.5 rounded-2xl bg-white/[0.04] border border-white/[0.06] backdrop-blur-md">
              {(["dreamer", "reality"] as const).map((s) => {
                const active = stream === s;
                const c = streamConfig[s];
                return (
                  <button
                    key={s}
                    onClick={() => setStream(s)}
                    className={`relative px-6 sm:px-8 py-3.5 rounded-xl text-left transition-all duration-500 ${
                      active ? "" : "hover:bg-white/[0.03]"
                    }`}
                  >
                    {active && (
                      <span
                        className="absolute inset-0 rounded-xl transition-all duration-500"
                        style={{
                          background: s === "dreamer"
                            ? "linear-gradient(135deg, rgba(139,92,246,0.15), rgba(139,92,246,0.05))"
                            : "linear-gradient(135deg, rgba(6,182,212,0.15), rgba(6,182,212,0.05))",
                          border: `1px solid ${c.color}30`,
                          boxShadow: `0 0 30px ${c.color}15`,
                        }}
                      />
                    )}
                    <span className="relative z-10 flex flex-col items-start gap-0.5">
                      <span className={`text-[10px] font-semibold uppercase tracking-[0.15em] transition-colors duration-500 ${
                        active ? (s === "dreamer" ? "text-violet" : "text-cyan") : "text-slate-muted"
                      }`}>
                        {s === "dreamer" ? t("feed.blueprint") : t("feed.steel")}
                      </span>
                      <span className={`text-sm sm:text-base font-semibold transition-colors duration-500 whitespace-nowrap ${
                        active ? "text-white" : "text-slate-muted/60"
                      }`}>
                        {s === "dreamer" ? t("feed.dreamer") : t("feed.reality")}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ─── STREAM TAGLINE ─── */}
          <div className="mt-6 h-12 flex items-center justify-center overflow-hidden">
            <p
              key={stream}
              className="text-sm sm:text-base text-slate-muted/60 font-light animate-fade-in"
            >
              {stream === "dreamer"
                ? `The ${t("feed.blueprint")} — For visionary architects building the future`
                : `The ${t("feed.steel")} — For verified operators with revenue and traction`}
            </p>
          </div>

          {/* ─── FEATURE HIGHLIGHTS ─── */}
          <div className="mt-3 h-6 flex items-center justify-center overflow-hidden">
            <span
              key={stream + "-features"}
              className="text-[11px] sm:text-xs text-slate-muted/40 tracking-wide animate-fade-in"
            >
              {stream === "dreamer"
                ? "Structured Roadmaps · Milestone Tracking · Technical Architecture · Risk Analysis"
                : "Timestamped Updates · Video Proof · Revenue Metrics · Team Growth"}
            </span>
          </div>

          {/* ─── CTA ─── */}
          <div className="mt-10 flex items-center justify-center gap-4 animate-fade-in-up" style={{ animationDelay: "0.5s" }}>
            <GlowButton
              variant="primary"
              size="lg"
              onClick={scrollToAuth}
              className="px-8 py-3.5 text-base font-semibold rounded-2xl animate-glow-pulse"
            >
              Enter the Network
            </GlowButton>
            <button
              onClick={scrollToAuth}
              className="px-6 py-3.5 text-sm text-slate-muted hover:text-white transition-colors rounded-2xl hover:bg-white/[0.04]"
            >
              {t("common.learnMore")}
            </button>
          </div>

          {/* ─── SCROLL INDICATOR ─── */}
          <div className="mt-16 animate-float">
            <div className="w-5 h-8 rounded-full border border-white/10 flex items-start justify-center p-1.5 mx-auto">
              <div className="w-1 h-2 rounded-full bg-white/30 animate-bounce" />
            </div>
          </div>
        </div>
      </section>

      {/* ─── AUTH SECTION ─── */}
      <section ref={feedRef} className="relative py-24 px-4" id="auth">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/[0.01] to-transparent pointer-events-none" />
        <div className="relative max-w-md mx-auto">
          <div className="text-center mb-8 animate-fade-in-up">
            <h2 className="text-3xl sm:text-4xl font-logo font-bold text-white">
              {authTab === "signin" ? t("auth.welcomeBack") : t("auth.joinNetwork")}
            </h2>
            <p className="mt-2 text-slate-muted/60 text-sm">
              {authTab === "signin" ? t("auth.noAccount") : t("auth.hasAccount")}{" "}
              <button
                onClick={() => setAuthTab(authTab === "signin" ? "signup" : "signin")}
                className="text-violet hover:text-violet-light font-medium transition-colors"
              >
                {authTab === "signin" ? t("auth.signUpLink") : t("auth.signInLink")}
              </button>
            </p>
          </div>

          <GlassCard variant="dark" className="p-6 sm:p-8 animate-fade-in-up">
            {/* Tabs */}
            <div className="flex mb-6 p-1 rounded-xl bg-white/[0.04] border border-white/[0.06]">
              {(["signin", "signup"] as const).map((tab) => {
                const active = authTab === tab;
                return (
                  <button
                    key={tab}
                    onClick={() => { setAuthTab(tab); setError(""); }}
                    className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${
                      active
                        ? "bg-violet/20 text-violet shadow-sm"
                        : "text-slate-muted/60 hover:text-white/80"
                    }`}
                  >
                    {tab === "signin" ? t("auth.signIn") : t("auth.signUp")}
                  </button>
                );
              })}
            </div>

            {error && (
              <div className="mb-4 px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm animate-fade-in">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {authTab === "signup" && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-muted uppercase tracking-wider mb-1.5">
                      {t("auth.name")}
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/[0.08] text-white text-sm placeholder:text-slate-muted/40 focus:outline-none focus:ring-2 focus:ring-violet/40 focus:border-violet/40 transition-all"
                      placeholder="Omar El Khatib"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-muted uppercase tracking-wider mb-1.5">
                      {t("auth.username")}
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-muted/60 text-sm">@</span>
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/[0.08] text-white text-sm placeholder:text-slate-muted/40 focus:outline-none focus:ring-2 focus:ring-violet/40 focus:border-violet/40 transition-all"
                        placeholder="omar_elkh"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-muted uppercase tracking-wider mb-1.5">
                      Invite Code (optional)
                    </label>
                    <input
                      type="text"
                      value={inviteCode}
                      onChange={(e) => setInviteCode(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/[0.08] text-white text-sm placeholder:text-slate-muted/40 focus:outline-none focus:ring-2 focus:ring-violet/40 focus:border-violet/40 transition-all font-mono"
                      placeholder="STK-XXXX"
                    />
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
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/[0.08] text-white text-sm placeholder:text-slate-muted/40 focus:outline-none focus:ring-2 focus:ring-violet/40 focus:border-violet/40 transition-all"
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
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/[0.08] text-white text-sm placeholder:text-slate-muted/40 focus:outline-none focus:ring-2 focus:ring-violet/40 focus:border-violet/40 transition-all"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
                {authTab === "signin" && (
                  <div className="text-right mt-1">
                    <button type="button" className="text-xs text-slate-muted/60 hover:text-violet transition-colors">
                      {t("auth.forgotPassword")}
                    </button>
                  </div>
                )}
              </div>
              <GlowButton
                type="submit"
                variant="primary"
                size="lg"
                loading={submitting}
                className="w-full py-3 text-base rounded-xl"
              >
                {authTab === "signin" ? t("auth.signIn") : t("auth.signUp")}
              </GlowButton>
            </form>

            <div className="mt-6 text-center">
              <p className="text-xs text-slate-muted/50">
                {t("auth.terms")}{" "}
                <Link href={`/${lang}/terms`} className="text-violet hover:underline">
                  {t("legal.terms")}
                </Link>{" "}
                &{" "}
                <Link href={`/${lang}/privacy`} className="text-violet hover:underline">
                  {t("legal.privacy")}
                </Link>
                .
              </p>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* ─── MANIFESTO QUOTE ─── */}
      <section className="relative py-24 px-4">
        <div className="absolute inset-0 bg-gradient-to-r from-violet/[0.02] via-transparent to-cyan/[0.02] pointer-events-none" />
        <div className="relative max-w-3xl mx-auto text-center">
          <GlassCard variant="accent" accentColor="#8B5CF6" className="p-10 sm:p-14 animate-fade-in-up">
            <svg className="w-8 h-8 text-violet/40 mx-auto mb-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10H14.017zM0 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151C7.546 6.068 5.983 8.789 5.983 11H10v10H0z" />
            </svg>
            <blockquote className="text-xl sm:text-2xl md:text-3xl font-logo font-semibold leading-snug text-white/90">
              &ldquo;{t("manifesto.title")}.&rdquo;
            </blockquote>
            <p className="mt-4 text-slate-muted/50 text-sm font-medium tracking-wide">
              — {t("nav.manifesto")} · {t("common.viewAll")}
            </p>
          </GlassCard>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section className="relative py-24 px-4">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/[0.01] to-transparent pointer-events-none" />
        <div className="relative max-w-6xl mx-auto">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="text-3xl sm:text-4xl font-logo font-bold text-white">
              How It Works
            </h2>
            <p className="mt-3 text-slate-muted/60 text-sm max-w-md mx-auto">
              Three steps to join Morocco&apos;s sovereign discovery network
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                  </svg>
                ),
                title: "Verify Your Identity",
                desc: "Create your sovereign profile and complete verification to establish trust on the network.",
                delay: "0.1s",
              },
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                  </svg>
                ),
                title: "Choose Your Stream",
                desc: "Select the Blueprint or Steel stream that fits your journey — visionary or operator.",
                delay: "0.2s",
              },
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                  </svg>
                ),
                title: "Connect & Grow",
                desc: "Discover verified operators and visionary dreamers matched to your momentum.",
                delay: "0.3s",
              },
            ].map((card, i) => (
              <GlassCard
                key={i}
                variant="dark"
                className="p-8 text-center group hover:border-violet/20 transition-all duration-500 animate-fade-in-up"
                style={{ animationDelay: card.delay }}
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet/10 to-cyan/10 border border-white/[0.06] flex items-center justify-center mx-auto text-violet-light group-hover:text-cyan transition-colors duration-500">
                  {card.icon}
                </div>
                <h3 className="mt-5 text-lg font-semibold text-white">{card.title}</h3>
                <p className="mt-2 text-sm text-slate-muted/60 leading-relaxed">{card.desc}</p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="relative border-t border-white/[0.04] py-12 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Logo size={20} className="[&_span]:text-white/40 [&_span]:text-xs" />
            <span className="text-xs text-slate-muted/40">&copy; {new Date().getFullYear()} ScaleTrek</span>
          </div>
          <div className="flex items-center gap-6">
            <Link
              href={`/${lang}/terms`}
              className="text-xs text-slate-muted/50 hover:text-violet transition-colors"
            >
              {t("legal.terms")}
            </Link>
            <Link
              href={`/${lang}/privacy`}
              className="text-xs text-slate-muted/50 hover:text-violet transition-colors"
            >
              {t("legal.privacy")}
            </Link>
            <a
              href="mailto:support@scaletrek.app"
              className="text-xs text-slate-muted/50 hover:text-violet transition-colors"
            >
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
