"use client";
export function TabBar({ tabs, active, onChange }: { tabs: { key: string; label: string; icon?: string }[]; active: string; onChange: (key: string) => void }) {
  return (
    <div className="flex items-center gap-1 p-1 bg-black/5 dark:bg-white/5 rounded-xl overflow-x-auto">
      {tabs.map((tab) => (
        <button key={tab.key} onClick={() => onChange(tab.key)}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
            active === tab.key
              ? "bg-white dark:bg-midnight3 text-midnight dark:text-white shadow-sm"
              : "text-slate-muted hover:text-midnight dark:hover:text-white"
          }`}>
          {tab.icon && <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d={tab.icon} /></svg>}
          {tab.label}
        </button>
      ))}
    </div>
  );
}
