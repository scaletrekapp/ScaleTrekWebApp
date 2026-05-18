"use client";
export function Sparkline({ data = [0], color = "#8B5CF6", height = 32 }: { data?: number[]; color?: string; height?: number }) {
  const w = 80;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const points = data.map((v, i) => `${(i / (data.length - 1)) * w},${height - ((v - min) / range) * (height - 4) - 2}`).join(" ");
  return (
    <svg width={w} height={height} className="overflow-visible">
      <polyline fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" points={points} />
    </svg>
  );
}

export function MiniBar({ value = 0, max = 100, color = "#8B5CF6", size = "sm" }: { value?: number; max?: number; color?: string; size?: "sm" | "md" }) {
  const pct = Math.min((value / max) * 100, 100);
  const h = size === "md" ? "h-2" : "h-1.5";
  return (
    <div className={`w-full ${h} rounded-full bg-black/10 dark:bg-white/10 overflow-hidden`}>
      <div className={`${h} rounded-full transition-all duration-700`} style={{ width: `${pct}%`, backgroundColor: color }} />
    </div>
  );
}

export function StatCard({ label, value, trend, icon, color = "#8B5CF6" }: { label: string; value: string | number; trend?: "up" | "down"; icon?: React.ReactNode; color?: string }) {
  return (
    <div className="relative p-4 rounded-xl bg-white/80 dark:bg-midnight2/80 border border-slate-border backdrop-blur-xl hover:shadow-lg hover:shadow-black/5 transition-all duration-300">
      <div className="flex items-start justify-between mb-2">
        {icon && <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}15` }}>{icon}</div>}
        {trend && (
          <span className={`text-[10px] font-semibold flex items-center gap-0.5 ${trend === "up" ? "text-green-500" : "text-red-500"}`}>
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d={trend === "up" ? "M4.5 19.5l6-6 4.5 4.5 6-6m0 0-3-3m3 3h-6" : "M4.5 4.5l6 6 4.5-4.5 6 6m0 0-3 3m3-3h-6"} />
            </svg>
            {Math.floor(Math.random() * 20)}%
          </span>
        )}
      </div>
      <div className="text-2xl font-bold text-midnight dark:text-white font-mono">{value}</div>
      <div className="text-[10px] text-slate-muted uppercase tracking-wider mt-0.5">{label}</div>
    </div>
  );
}
