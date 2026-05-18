"use client";

import { useTranslation } from "react-i18next";
import { Navbar } from "@/components/layout/Navbar";
import Link from "next/link";

export default function TermsPage({ params: { lang } }: { params: { lang: string } }) {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-white dark:bg-midnight">
      <Navbar lang={lang} />
      <main className="max-w-3xl mx-auto px-4 py-12 sm:py-20">
        <h1 className="text-3xl font-bold text-midnight dark:text-white mb-2">{t("legal.terms")}</h1>
        <p className="text-sm text-slate-muted mb-10">{t("legal.lastUpdated")}: May 2026</p>
        <div className="space-y-6 text-sm text-slate-muted leading-relaxed">
          <p>{t("legal.intro")}</p>
          <p>{t("legal.noLiability")}</p>
          <p>{t("legal.userResponsibility")}</p>
          <p>{t("legal.dataUsage")}</p>
          <p>{t("legal.contact")}</p>
        </div>
        <div className="mt-12 pt-8 border-t border-slate-border">
          <Link href={`/${lang}/privacy`} className="text-sm text-violet hover:text-violet-light transition-colors">
            {t("legal.privacy")}
          </Link>
        </div>
      </main>
    </div>
  );
}
