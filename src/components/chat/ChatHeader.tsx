"use client";

import { MomentumPill } from "@/components/ui/MomentumPill";

interface ChatHeaderProps {
  founderName: string;
  founderHandle: string;
  momentumScore: number;
  investorVerified: boolean;
  dealStage: string;
  onBack?: () => void;
}

export function ChatHeader({ founderName, founderHandle, momentumScore, investorVerified, dealStage, onBack }: ChatHeaderProps) {
  return (
    <div className="sticky top-0 z-30 bg-onyx-900/95 backdrop-blur-xl border-b border-onyx-700/60 px-4 sm:px-6">
      <div className="flex items-center justify-between h-14">
        <div className="flex items-center gap-3 min-w-0">
          {onBack && (
            <button onClick={onBack} className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-muted hover:text-white hover:bg-white/5 transition-colors shrink-0 sm:hidden">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
            </button>
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-white truncate">{founderName}</h2>
              <span className="text-xs text-slate-muted">@{founderHandle}</span>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[10px] text-slate-subtle uppercase tracking-wider">Deal: <span className="text-white font-medium">{dealStage}</span></span>
              <span className="text-slate-subtle">·</span>
              <span className="text-[10px] text-slate-subtle uppercase tracking-wider">Room: <span className="text-white font-medium">{investorVerified ? "Open" : "Restricted"}</span></span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-onyx-800/60 border border-onyx-700/60">
            <span className="text-[10px] text-slate-muted uppercase tracking-wider">Momentum</span>
            <MomentumPill score={momentumScore} size="sm" />
          </div>
          {investorVerified && (
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald/10 border border-emerald/20">
              <svg className="w-3 h-3 text-emerald" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-[10px] font-semibold text-emerald uppercase tracking-wider">Verified</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
