"use client";

interface DeltaPillProps {
  label: string;
  delta: string;
  trend: "up" | "down" | "neutral";
  sparklineData?: number[];
  sparklineColor?: string;
}

export function DeltaPill({ label, delta, trend, sparklineData, sparklineColor }: DeltaPillProps) {
  return (
    <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-onyx-800/40 border border-onyx-700/40">
      <span className="text-[10px] text-slate-muted uppercase tracking-wider whitespace-nowrap">{label}</span>
      <span className={`text-xs font-semibold font-mono tabular-nums ${
        trend === "up" ? "text-emerald" : trend === "down" ? "text-ruby" : "text-slate-muted"
      }`}>
        {delta}
      </span>
      {sparklineData && (
        <svg width={40} height={16} className="overflow-visible">
          <polyline
            fill="none"
            stroke={sparklineColor || (trend === "up" ? "#34d399" : trend === "down" ? "#f43f5e" : "#6b7280")}
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            points={sparklineData.map((v, i) => `${(i / (sparklineData.length - 1)) * 38},${16 - (v * 14)}`).join(" ")}
          />
        </svg>
      )}
    </div>
  );
}
