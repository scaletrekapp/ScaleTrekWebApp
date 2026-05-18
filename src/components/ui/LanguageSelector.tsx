"use client";

import { useTranslation } from "react-i18next";
import { languages, type LangCode } from "@/i18n";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export function LanguageSelector() {
  const { i18n } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const currentLang = i18n.language?.split("-")[0] || "en";

  const switchLang = useCallback(
    (code: LangCode) => {
      setOpen(false);
      if (code === currentLang) return;
      const segments = pathname.split("/");
      segments[1] = code;
      router.push(segments.join("/"));
    },
    [currentLang, pathname, router]
  );

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const active = languages.find((l) => l.code === currentLang) || languages[0];

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="h-9 px-2.5 rounded-xl glass-dark dark:glass-dark border border-slate-border dark:border-slate-border flex items-center gap-1.5 text-xs font-medium text-slate-muted dark:text-slate-muted hover:brightness-125 transition-all"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="uppercase">{currentLang}</span>
      </button>
      {open && (
        <div className="absolute top-full mt-1 left-0 w-36 bg-white dark:bg-midnight2 border border-slate-border rounded-xl overflow-hidden z-[100] shadow-2xl" role="menu">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => switchLang(lang.code as LangCode)}
              className={`w-full px-3 py-2.5 text-left text-sm flex items-center justify-between hover:bg-white/5 dark:hover:bg-white/5 transition-colors ${
                lang.code === currentLang
                  ? "text-violet dark:text-violet font-semibold"
                  : "text-slate-muted dark:text-slate-muted"
              }`}
            >
              <span>{lang.label}</span>
              {lang.code === currentLang && (
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
