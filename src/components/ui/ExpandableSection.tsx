"use client";
import { useState } from "react";
export function ExpandableSection({ title, defaultOpen = false, children, className = "" }: { title: React.ReactNode; defaultOpen?: boolean; children: React.ReactNode; className?: string }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={`border border-slate-border rounded-xl overflow-hidden ${className}`}>
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-midnight dark:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
        {title}
        <svg className={`w-4 h-4 text-slate-muted transition-transform duration-200 ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${open ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"}`}>
        <div className="px-4 pb-4">{children}</div>
      </div>
    </div>
  );
}
