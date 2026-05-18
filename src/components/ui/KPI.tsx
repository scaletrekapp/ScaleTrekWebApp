"use client";
export function KPI({ label, value, sub, color = "#8B5CF6", icon }: { label: string; value: string; sub?: string; color?: string; icon?: React.ReactNode }) {
  return (
    <div className="relative p-5 rounded-2xl bg-gradient-to-br from-white/90 to-white/50 dark:from-midnight2/90 dark:to-midnight2/50 border border-slate-border backdrop-blur-xl overflow-hidden group hover:shadow-xl hover:shadow-black/5 transition-all duration-500">
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: `radial-gradient(600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), ${color}08, transparent 60%)` }} />
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-semibold text-slate-muted uppercase tracking-widest">{label}</span>
          {icon && <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}15` }}>{icon}</div>}
        </div>
        <div className="text-3xl font-bold text-midnight dark:text-white font-mono tracking-tight">{value}</div>
        {sub && <div className="text-[11px] text-slate-muted mt-1">{sub}</div>}
      </div>
    </div>
  );
}
