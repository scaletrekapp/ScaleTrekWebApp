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
            <button onClick={onBack} className="btn-icon btn-ghost shrink-0 sm:hidden">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
            </button>
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-subhead text-white truncate">{founderName}</h2>
              <span className="text-caption text-muted">@{founderHandle}</span>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-micro text-subdued">Deal: <span className="text-white font-medium">{dealStage}</span></span>
              <span className="text-subdued">·</span>
              <span className="text-micro text-subdued">Room: <span className="text-white font-medium">{investorVerified ? "Open" : "Restricted"}</span></span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg surface-card">
            <span className="text-micro text-muted">Momentum</span>
            <MomentumPill score={momentumScore} size="sm" />
          </div>
          {investorVerified && (
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald/10 border border-emerald/20">
              <svg className="w-3 h-3 text-emerald" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-micro text-emerald">Verified</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
