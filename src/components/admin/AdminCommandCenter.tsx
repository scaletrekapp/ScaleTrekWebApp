"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface AuditEntry {
  action: "approved" | "rejected" | "flagged";
  by: string;
  at: string;
  note?: string;
}

interface Milestone {
  id: string;
  founderName: string;
  founderHandle: string;
  title: string;
  description: string;
  date: string;
  status: "pending" | "approved" | "rejected" | "flagged";
  evidenceUrl?: string;
  evidenceType?: "image" | "pdf" | "link";
  audit: AuditEntry[];
  momentumScore: number;
}

const MOCK_MILESTONES: Milestone[] = [
  {
    id: "m1", founderName: "Youssef Kamal", founderHandle: "youssef_k",
    title: "MVP v1.0 Deployed", description: "Successfully launched the first version of the neobank mobile app with core banking features — transfers, balance, and transaction history.",
    date: "2026-05-18", status: "pending", evidenceType: "image",
    audit: [], momentumScore: 78,
  },
  {
    id: "m2", founderName: "Amina Rami", founderHandle: "amina_r",
    title: "First 100 Telemedicine Consults", description: "Completed 100 remote consultations across 3 rural clinics in the Atlas region. Patient satisfaction score: 4.7/5.",
    date: "2026-05-17", status: "approved", evidenceType: "link",
    audit: [{ action: "approved", by: "admin@scaletrek.app", at: "2026-05-18 14:32", note: "Verified via clinic records. Satisfied." }],
    momentumScore: 62,
  },
  {
    id: "m3", founderName: "Karim Ouali", founderHandle: "karim_o",
    title: "Procurement Automation Beta", description: "Beta launched with 3 pilot clients. Processing 150+ invoices/month. Revenue: $2.4K MRR.",
    date: "2026-05-16", status: "flagged", evidenceType: "pdf",
    audit: [{ action: "flagged", by: "investor@capital.vc", at: "2026-05-17 09:15", note: "MRR claim unverifiable — no Stripe access granted." }],
    momentumScore: 44,
  },
  {
    id: "m4", founderName: "Sara Benali", founderHandle: "sara_b",
    title: "Solar Grid Installation Milestone", description: "Installed solar microgrids serving 45 households in two villages. Total capacity: 12kW. Cost per household reduced 60%.",
    date: "2026-05-15", status: "pending", evidenceType: "image",
    audit: [], momentumScore: 91,
  },
  {
    id: "m5", founderName: "Mehdi Alaoui", founderHandle: "mehdi_a",
    title: "AI Model Training Complete", description: "Trained Arabic NLP model on 500K curated examples. Accuracy: 92.3% on reading comprehension benchmark.",
    date: "2026-05-14", status: "pending", evidenceType: "link",
    audit: [], momentumScore: 55,
  },
  {
    id: "m6", founderName: "Leila Mansouri", founderHandle: "leila_m",
    title: "Cross-Border Payment Pilot", description: "Completed first live cross-border transaction Morocco→UAE via Islamic fintech rails. Settlement in 2.4s.",
    date: "2026-05-13", status: "rejected", evidenceType: "pdf",
    audit: [{ action: "rejected", by: "admin@scaletrek.app", at: "2026-05-14 11:00", note: "Settlement time claim not independently verifiable. Request bank confirmation." }],
    momentumScore: 83,
  },
];

  const STATUS_COLORS: Record<string, string> = {
    pending: "bg-amber/20 text-amber border-amber/30",
    approved: "bg-emerald/20 text-emerald border-emerald/30",
    rejected: "bg-ruby/20 text-ruby border-ruby/30",
    flagged: "bg-violet/20 text-violet-light border-violet/30",
  };

  function getStatusBadge(status: string) {
    const c = STATUS_COLORS[status] || "text-muted border-onyx-700/60";
    return `px-2 py-0.5 rounded-full text-[10px] font-semibold border ${c}`;
  }

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function AdminCommandCenter() {
  const [milestones, setMilestones] = useState<Milestone[]>(MOCK_MILESTONES);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  const selected = milestones.find((m) => m.id === selectedId);

  const filtered = milestones.filter((m) =>
    m.founderName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.founderHandle.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  };

  const updateStatus = useCallback((id: string, status: Milestone["status"]) => {
    setMilestones((prev) =>
      prev.map((m) =>
        m.id === id
          ? {
              ...m,
              status,
              audit: [
                ...m.audit,
                {
                  action: status === "approved" ? "approved" as const : status === "rejected" ? "rejected" as const : "flagged" as const,
                  by: "admin@scaletrek.app",
                  at: new Date().toLocaleString(),
                },
              ],
            }
          : m
      )
    );
    const label = { approved: "Approved", rejected: "Rejected", flagged: "Flagged", pending: "Pending" }[status];
    showToast(`${label} milestone`);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && selectedId) {
        setSelectedId(null);
        return;
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        const input = document.querySelector<HTMLInputElement>("#cmd-center-search");
        input?.focus();
        return;
      }
      if (!selectedId) return;
      const target = document.activeElement;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) return;
      if (e.key === "a" || e.key === "A") updateStatus(selectedId, "approved");
      if (e.key === "r" || e.key === "R") updateStatus(selectedId, "rejected");
      if (e.key === "f" || e.key === "F") updateStatus(selectedId, "flagged");
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [selectedId, updateStatus]);

  return (
    <div className="space-y-4">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="fixed top-4 right-4 z-50 px-4 py-2 rounded-lg bg-emerald/15 border border-emerald/30 text-emerald text-xs font-semibold"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search + keyboard hints */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            id="cmd-center-search"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search milestones..."
            className="w-full pl-9 pr-3 py-2 rounded-lg surface-card text-caption text-white placeholder:text-subdued focus:outline-none focus:ring-2 focus:ring-violet/40"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <kbd className="hidden sm:inline-flex px-1.5 py-0.5 rounded text-[9px] font-mono bg-onyx-700/60 text-slate-subtle border border-onyx-700/60">⌘K</kbd>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-[10px] text-slate-subtle">
          <span className="flex items-center gap-1"><kbd className="px-1 py-0.5 rounded bg-onyx-700/60 font-mono border border-onyx-700/60">A</kbd> Approve</span>
          <span className="flex items-center gap-1"><kbd className="px-1 py-0.5 rounded bg-onyx-700/60 font-mono border border-onyx-700/60">R</kbd> Reject</span>
          <span className="flex items-center gap-1"><kbd className="px-1 py-0.5 rounded bg-onyx-700/60 font-mono border border-onyx-700/60">F</kbd> Flag</span>
          <span className="flex items-center gap-1"><kbd className="px-1 py-0.5 rounded bg-onyx-700/60 font-mono border border-onyx-700/60">Esc</kbd> Deselect</span>
        </div>
      </div>

      {/* Dual-pane */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-[500px]">
        {/* Left: milestone list */}
        <div className="surface-card overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 border-b border-onyx-700/60">
            <span className="text-xs font-semibold text-white">Milestones</span>
            <span className="text-[10px] font-mono text-slate-muted">{filtered.length} total</span>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-onyx-700/30">
            {filtered.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-muted">No milestones match your search.</div>
            ) : (
              filtered.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setSelectedId(m.id)}
                  className={`w-full text-left px-4 py-3 transition-colors hover:bg-onyx-700/30 ${
                    selectedId === m.id ? "bg-violet/10 border-l-2 border-violet" : "border-l-2 border-transparent"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-white truncate">{m.title}</p>
                      <p className="text-[10px] text-slate-muted truncate">@{m.founderHandle} · {formatDate(m.date)}</p>
                    </div>
                    <span className={getStatusBadge(m.status)}>{m.status}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1.5">
                    <div className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: m.momentumScore >= 70 ? "#34d399" : m.momentumScore >= 40 ? "#06b6d4" : "#f59e0b" }} />
                      <span className="text-[9px] font-mono text-slate-subtle">{m.momentumScore}</span>
                    </div>
                    {m.audit.length > 0 && (
                      <span className="text-[9px] text-slate-subtle">{m.audit.length} audit {m.audit.length === 1 ? "entry" : "entries"}</span>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right: detail / audit viewer */}
        <div className="surface-card overflow-hidden flex flex-col">
          {!selected ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
              <svg className="w-10 h-10 text-slate-subtle mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
              </svg>
              <p className="text-xs text-slate-muted">Select a milestone to review</p>
              <p className="text-[10px] text-slate-subtle mt-1">Use keyboard shortcuts for rapid processing</p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto">
              {/* Milestone detail */}
              <div className="px-4 py-3 border-b border-onyx-700/60">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-sm font-semibold text-white">{selected.title}</h3>
                  <span className={getStatusBadge(selected.status)}>{selected.status}</span>
                </div>
                <p className="text-xs text-slate-muted mb-1">@{selected.founderHandle} · {formatDate(selected.date)}</p>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: selected.momentumScore >= 70 ? "#34d399" : selected.momentumScore >= 40 ? "#06b6d4" : "#f59e0b" }} />
                    <span className="text-[10px] font-mono text-slate-muted">Momentum {selected.momentumScore}</span>
                  </div>
                  {selected.evidenceType && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-onyx-700/40 text-slate-subtle uppercase">{selected.evidenceType}</span>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="px-4 py-3 border-b border-onyx-700/60">
                <p className="text-[11px] text-slate-muted leading-relaxed">{selected.description}</p>
              </div>

              {/* Actions */}
              <div className="px-4 py-3 border-b border-onyx-700/60">
                <p className="text-[10px] font-semibold text-slate-subtle uppercase tracking-wider mb-2">Actions</p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateStatus(selected.id, "approved")}
                    className="flex-1 px-3 py-2 rounded-lg text-[11px] font-semibold bg-emerald/10 text-emerald border border-emerald/20 hover:bg-emerald/20 transition-colors"
                  >
                    <kbd className="inline-flex mr-1.5 px-1 py-0.5 rounded text-[9px] font-mono bg-emerald/20">A</kbd>
                    Approve
                  </button>
                  <button
                    onClick={() => updateStatus(selected.id, "rejected")}
                    className="flex-1 px-3 py-2 rounded-lg text-[11px] font-semibold bg-ruby/10 text-ruby border border-ruby/20 hover:bg-ruby/20 transition-colors"
                  >
                    <kbd className="inline-flex mr-1.5 px-1 py-0.5 rounded text-[9px] font-mono bg-ruby/20">R</kbd>
                    Reject
                  </button>
                  <button
                    onClick={() => updateStatus(selected.id, "flagged")}
                    className="flex-1 px-3 py-2 rounded-lg text-[11px] font-semibold bg-violet/10 text-violet-light border border-violet/20 hover:bg-violet/20 transition-colors"
                  >
                    <kbd className="inline-flex mr-1.5 px-1 py-0.5 rounded text-[9px] font-mono bg-violet/20">F</kbd>
                    Flag
                  </button>
                </div>
              </div>

              {/* Audit trail */}
              <div className="px-4 py-3">
                <p className="text-[10px] font-semibold text-slate-subtle uppercase tracking-wider mb-2">Audit Trail</p>
                {selected.audit.length === 0 ? (
                  <p className="text-[10px] text-slate-muted italic">No audit entries yet.</p>
                ) : (
                  <div className="space-y-2">
                    {selected.audit.map((entry, i) => (
                      <div key={i} className="flex items-start gap-2 pb-2 border-b border-onyx-700/30 last:border-0">
                        <div
                          className={`w-1.5 h-1.5 rounded-full mt-1 shrink-0 ${
                            entry.action === "approved" ? "bg-emerald" : entry.action === "rejected" ? "bg-ruby" : "bg-violet"
                          }`}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`text-[10px] font-semibold ${
                                entry.action === "approved" ? "text-emerald" : entry.action === "rejected" ? "text-ruby" : "text-violet-light"
                              }`}
                            >
                              {entry.action.charAt(0).toUpperCase() + entry.action.slice(1)}
                            </span>
                            <span className="text-[9px] text-slate-subtle">by {entry.by}</span>
                          </div>
                          <p className="text-[9px] text-slate-subtle">{entry.at}</p>
                          {entry.note && <p className="text-[10px] text-slate-muted mt-0.5">{entry.note}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
