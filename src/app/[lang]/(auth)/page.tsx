"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import Link from "next/link";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { LanguageSelector } from "@/components/ui/LanguageSelector";

export default function AuthPage({ params: { lang } }: { params: { lang: string } }) {
  const { t } = useTranslation();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Supabase auth integration placeholder
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left - Brand */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-midnight via-midnight2 to-midnight3 border-r border-slate-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet to-cyan flex items-center justify-center shadow-lg shadow-violet/20">
            <span className="text-white font-bold text-lg">ST</span>
          </div>
          <span className="font-bold text-white text-lg">ScaleTrek</span>
        </div>
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

      {/* Right - Auth Form */}
      <div className="flex items-center justify-center p-8 bg-white dark:bg-midnight">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet to-cyan flex items-center justify-center">
                <span className="text-white font-bold text-xs">ST</span>
              </div>
              <span className="font-bold text-sm text-midnight dark:text-white">ScaleTrek</span>
            </div>
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
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-violet to-violet-dark text-white font-semibold text-sm hover:brightness-110 transition-all active:scale-[0.98]"
            >
              {mode === "signin" ? t("auth.signIn") : t("auth.signUp")}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-slate-muted">
              By continuing, you agree to ScaleTrek&apos;s Terms of Service and Privacy Policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
