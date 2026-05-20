"use client";

import { motion } from "framer-motion";

interface MilestoneCardProps {
  title: string;
  description: string;
  date: string;
  type: "dreamer" | "reality";
  verified?: boolean;
  onClick?: () => void;
}

export function MilestoneCard({ title, description, date, type, verified, onClick }: MilestoneCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      onClick={onClick}
      className="panel p-3 border-l-2 border-l-violet cursor-pointer hover:bg-onyx-700/30 transition-colors group mb-3 max-w-[85%]"
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${type === "reality" ? "bg-emerald/10" : "bg-violet/10"}`}>
            <svg className={`w-3.5 h-3.5 ${type === "reality" ? "text-emerald" : "text-violet-light"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              {type === "reality" ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
              )}
            </svg>
          </div>
          <span className="text-xs font-semibold text-slate-muted uppercase tracking-wider">{type}</span>
        </div>
        {verified && (
          <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald uppercase tracking-wider">
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Verified
          </span>
        )}
      </div>

      <h4 className="text-sm font-semibold text-white mb-1">{title}</h4>
      <p className="text-xs text-slate-muted leading-relaxed mb-2 line-clamp-2">{description}</p>

      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono text-slate-subtle">{date}</span>
        <span className="text-[10px] text-violet-light opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
          View audit log
          <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75" />
          </svg>
        </span>
      </div>
    </motion.div>
  );
}

export function MilestoneCardComposer({ onInsert }: { onInsert: (milestone: { title: string; description: string; type: "dreamer" | "reality" }) => void }) {
  return (
    <div className="panel p-3 space-y-2">
      <p className="text-[10px] font-semibold text-slate-muted uppercase tracking-wider">Drop a Milestone Card</p>
      <div className="flex gap-2">
        <button
          onClick={() => onInsert({ title: "MVP Deployed", description: "V1 launched with core functionality live on testnet", type: "reality" })}
          className="flex-1 px-3 py-2 rounded-lg bg-emerald/10 border border-emerald/20 text-emerald text-[11px] font-semibold hover:bg-emerald/20 transition-colors"
        >
          MVP Deployed
        </button>
        <button
          onClick={() => onInsert({ title: "MRR Update", description: "Monthly recurring revenue crossed $5K ARR", type: "reality" })}
          className="flex-1 px-3 py-2 rounded-lg bg-emerald/10 border border-emerald/20 text-emerald text-[11px] font-semibold hover:bg-emerald/20 transition-colors"
        >
          MRR Update
        </button>
        <button
          onClick={() => onInsert({ title: "Team Hire", description: "Key senior hire onboarded to leadership team", type: "dreamer" })}
          className="flex-1 px-3 py-2 rounded-lg bg-violet/10 border border-violet/20 text-violet-light text-[11px] font-semibold hover:bg-violet/20 transition-colors"
        >
          Team Hire
        </button>
      </div>
    </div>
  );
}
