"use client";

import { motion, AnimatePresence } from "framer-motion";
import { MomentumRing, MomentumBar } from "./MomentumRing";

interface MomentumDrawerProps {
  open: boolean;
  onClose: () => void;
  score: number;
  history?: { label: string; value: number }[];
  milestones?: { title: string; date: string; completed: boolean }[];
}

const MOCK_HISTORY = [
  { label: "Week 1", value: 22 },
  { label: "Week 2", value: 35 },
  { label: "Week 3", value: 41 },
  { label: "Week 4", value: 58 },
  { label: "Week 5", value: 63 },
  { label: "Week 6", value: 78 },
];

const MOCK_MILESTONES = [
  { title: "MVP V1 Launch", date: "2026-04-15", completed: true },
  { title: "First 100 Users", date: "2026-05-01", completed: true },
  { title: "$5K MRR", date: "2026-06-01", completed: false },
  { title: "Seed Round Close", date: "2026-07-15", completed: false },
];

export function MomentumDrawer({ open, onClose, score, history = MOCK_HISTORY, milestones = MOCK_MILESTONES }: MomentumDrawerProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/40 z-40"
            onClick={onClose}
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md z-50 bg-onyx-900 border-l border-onyx-700/60 shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between shrink-0 px-5 h-14 border-b border-onyx-700/60">
              <h2 className="text-sm font-semibold text-white">Momentum Analytics</h2>
              <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-muted hover:text-white hover:bg-white/5 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-6 scrollbar-hide">
              {/* Current score ring */}
              <div className="panel p-5 flex flex-col items-center text-center">
                <MomentumRing score={score} size="lg" />
                <h3 className="text-lg font-bold text-white mt-3">{score}</h3>
                <p className="text-xs text-slate-muted">Current Momentum Score</p>
              </div>

              {/* Historical momentum gains */}
              <div className="panel p-4 space-y-3">
                <p className="text-executive">Historical Gains</p>
                <div className="space-y-2">
                  {history.map((h) => (
                    <div key={h.label} className="flex items-center gap-3">
                      <span className="text-xs text-slate-muted w-14 shrink-0">{h.label}</span>
                      <div className="flex-1">
                        <MomentumBar score={h.value} />
                      </div>
                      <span className="text-xs font-mono text-slate-muted w-8 text-right">{h.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Activity matrix mini-grid */}
              <div className="panel p-4 space-y-3">
                <p className="text-executive">Activity Matrix</p>
                <div className="grid grid-cols-7 gap-1">
                  {Array.from({ length: 35 }).map((_, i) => {
                    const intensity = Math.random();
                    return (
                      <div
                        key={i}
                        className="aspect-square rounded-sm"
                        style={{
                          backgroundColor: intensity > 0.7 ? "rgba(52,211,153,0.4)" : intensity > 0.4 ? "rgba(52,211,153,0.2)" : intensity > 0.1 ? "rgba(52,211,153,0.08)" : "rgba(255,255,255,0.03)",
                        }}
                      />
                    );
                  })}
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-subtle">
                  <span>5 weeks ago</span>
                  <div className="flex items-center gap-1.5">
                    <span>Less</span>
                    <div className="flex gap-0.5">
                      <div className="w-2 h-2 rounded-sm bg-white/5" />
                      <div className="w-2 h-2 rounded-sm bg-emerald/10" />
                      <div className="w-2 h-2 rounded-sm bg-emerald/20" />
                      <div className="w-2 h-2 rounded-sm bg-emerald/40" />
                    </div>
                    <span>More</span>
                  </div>
                </div>
              </div>

              {/* Upcoming milestones */}
              <div className="panel p-4 space-y-3">
                <p className="text-executive">Next Milestones</p>
                <div className="space-y-2">
                  {milestones.map((m) => (
                    <div key={m.title} className="flex items-center gap-3 py-2">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        m.completed ? "border-emerald bg-emerald/10" : "border-onyx-700/60"
                      }`}>
                        {m.completed && (
                          <svg className="w-3 h-3 text-emerald" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-medium ${m.completed ? "text-emerald" : "text-white"}`}>{m.title}</p>
                        <p className="text-[10px] text-slate-subtle">{m.date}</p>
                      </div>
                      {!m.completed && <span className="text-[10px] text-slate-subtle px-2 py-0.5 rounded-full bg-onyx-700/40">Upcoming</span>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
