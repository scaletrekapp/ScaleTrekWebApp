"use client";

import { useTranslation } from "react-i18next";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";

export default function ManifestoPage({ params: { lang } }: { params: { lang: string } }) {
  const { t } = useTranslation();
  const manifesto = t("manifesto.sections", { returnObjects: true }) as Array<{ heading: string; body: string }>;

  return (
    <div className="min-h-screen bg-white dark:bg-midnight">
      <Navbar lang={lang} />
      <main className="max-w-3xl mx-auto px-4 py-16 sm:py-24">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet/10 dark:bg-violet/10 text-violet dark:text-violet text-xs font-semibold tracking-wide uppercase mb-6">
            Manifesto
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-midnight dark:text-white mb-4 tracking-tight leading-tight">
            {t("manifesto.title")}
          </h1>
          <p className="text-lg text-slate-muted max-w-xl mx-auto leading-relaxed">
            {t("manifesto.subtitle")}
          </p>
        </div>

        <div className="space-y-16">
          {manifesto.map((section, i) => (
            <section key={i} className="relative">
              <div className="absolute -left-8 top-0 w-px h-full bg-gradient-to-b from-violet/40 via-cyan/20 to-transparent hidden sm:block" />
              <div className="flex items-start gap-4">
                <div className="hidden sm:flex w-8 h-8 rounded-full bg-violet/10 dark:bg-violet/10 border border-violet/20 dark:border-violet/20 items-center justify-center shrink-0 mt-1">
                  <span className="text-violet dark:text-violet font-bold text-xs">{String(i + 1).padStart(2, "0")}</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-midnight dark:text-white mb-4">{section.heading}</h2>
                  <p className="text-base text-slate-muted dark:text-slate-muted leading-relaxed max-w-2xl">
                    {section.body}
                  </p>
                </div>
              </div>
            </section>
          ))}
        </div>

        <div className="mt-20 pt-12 border-t border-slate-border dark:border-slate-border text-center">
          <Link
            href={`/${lang}/feed`}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-violet to-violet-dark text-white font-semibold text-sm hover:brightness-110 transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
            Explore the Network
          </Link>
        </div>
      </main>
    </div>
  );
}
