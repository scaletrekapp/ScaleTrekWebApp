"use client";
import { motion, AnimatePresence } from "framer-motion";
import { AnimatedCounter } from "./AnimatedCounter";

interface LiveMetricProps {
  label: string;
  value: number;
  icon?: React.ReactNode;
  color?: string;
  trend?: "up" | "down" | "neutral";
  format?: "number" | "percent";
}

export function LiveMetric({ label, value, icon, color = "#8B5CF6", trend = "neutral", format = "number" }: LiveMetricProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative p-4 rounded-xl bg-white/80 dark:bg-midnight2/80 border border-slate-border backdrop-blur-xl overflow-hidden group"
    >
      <motion.div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: `radial-gradient(400px circle at 50% 0%, ${color}10, transparent 60%)` }}
      />
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-semibold text-slate-muted uppercase tracking-widest">{label}</span>
          {icon && <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}15` }}>{icon}</div>}
        </div>
        <div className="flex items-baseline gap-2">
          <AnimatedCounter to={value} className={`text-2xl font-bold`} style={{ color }} />
          {trend !== "neutral" && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className={`text-[10px] font-semibold ${trend === "up" ? "text-green-500" : "text-red-500"}`}
            >
              <svg className="w-3 h-3 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d={trend === "up" ? "M4.5 19.5l6-6 4.5 4.5 6-6m0 0l-3-3m3 3h-6" : "M4.5 4.5l6 6 4.5-4.5 6 6m0 0l-3-3m3 3h-6"} />
              </svg>
            </motion.span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
