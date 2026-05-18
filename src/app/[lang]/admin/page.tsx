"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { GlassCard } from "@/components/ui/GlassCard";
import { Badge } from "@/components/ui/Badge";

type AdminTab = "dashboard" | "users" | "reports" | "verification" | "flags";

const MOCK_USERS = [
  { id: "u1", handle: "neon_pioneer", email: "neon@example.com", role: "dreamer", status: "active", verified: false, momentumScore: 72, createdAt: "2026-01-15" },
  { id: "u2", handle: "veridian_works", email: "veridian@example.com", role: "dreamer", status: "active", verified: true, momentumScore: 45, createdAt: "2025-12-01" },
  { id: "u3", handle: "cyber_forge", email: "cyber@example.com", role: "dreamer", status: "suspended", verified: true, momentumScore: 88, createdAt: "2025-11-20" },
  { id: "u4", handle: "aether_capital", email: "aether@example.com", role: "investor", status: "active", verified: true, momentumScore: 0, createdAt: "2025-06-10" },
  { id: "u5", handle: "nova_vc", email: "nova@example.com", role: "investor", status: "active", verified: true, momentumScore: 0, createdAt: "2025-08-22" },
  { id: "u6", handle: "admin_st", email: "admin@scaletrek.app", role: "admin", status: "active", verified: true, momentumScore: 0, createdAt: "2025-01-01" },
];

const MOCK_REPORTS = [
  { id: "r1", type: "spam", reporter: "nova_vc", target: "cyber_forge", reason: "Spam posting", status: "pending", createdAt: "2026-05-17" },
  { id: "r2", type: "fraud", reporter: "aether_capital", target: "neon_pioneer", reason: "Misleading milestone claims", status: "investigating", createdAt: "2026-05-15" },
  { id: "r3", type: "inappropriate", reporter: "veridian_works", target: "cyber_forge", reason: "Offensive content in post", status: "resolved", createdAt: "2026-05-10" },
];

const MOCK_VERIFICATION = [
  { id: "v1", handle: "tech_rabbat", type: "business", document: "RC123456", status: "pending", submittedAt: "2026-05-16" },
  { id: "v2", handle: "atlas_logistics", type: "business", document: "IF98765", status: "approved", submittedAt: "2026-05-14" },
  { id: "v3", handle: "majestic_restaurant", type: "identity", document: "CIN_AB123456", status: "rejected", submittedAt: "2026-05-12" },
];

const FEATURE_FLAGS = [
  { key: "video_uploads", label: "Video Uploads", enabled: true },
  { key: "realtime_chat", label: "Realtime Chat", enabled: true },
  { key: "ai_verification", label: "AI Document Verification", enabled: false },
  { key: "investor_api", label: "Investor API Access", enabled: false },
  { key: "pro_subscriptions", label: "Pro Subscriptions", enabled: true },
];

export default function AdminPage({ params: { lang } }: { params: { lang: string } }) {
  const [tab, setTab] = useState<AdminTab>("dashboard");

  const tabs: { key: AdminTab; label: string }[] = [
    { key: "dashboard", label: "Dashboard" },
    { key: "users", label: "Users" },
    { key: "reports", label: "Reports" },
    { key: "verification", label: "Verification" },
    { key: "flags", label: "Feature Flags" },
  ];

  const stats = {
    totalUsers: MOCK_USERS.length,
    activeUsers: MOCK_USERS.filter((u) => u.status === "active").length,
    suspendedUsers: MOCK_USERS.filter((u) => u.status === "suspended").length,
    pendingReports: MOCK_REPORTS.filter((r) => r.status === "pending").length,
    pendingVerifications: MOCK_VERIFICATION.filter((v) => v.status === "pending").length,
  };

  return (
    <div className="min-h-screen bg-white dark:bg-midnight">
      <Navbar lang={lang} />
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-red-500/15 dark:bg-red-500/15 border border-red-500/20 dark:border-red-500/20 flex items-center justify-center">
            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-midnight dark:text-white">Agentic Admin Panel</h1>
            <p className="text-sm text-slate-muted">Feed weighting, verification, user management</p>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-8">
          {[
            { label: "Total Users", value: stats.totalUsers, color: "text-violet" },
            { label: "Active", value: stats.activeUsers, color: "text-green-500" },
            { label: "Suspended", value: stats.suspendedUsers, color: "text-red-500" },
            { label: "Pending Reports", value: stats.pendingReports, color: "text-yellow-500" },
            { label: "Verifications", value: stats.pendingVerifications, color: "text-cyan" },
          ].map((s) => (
            <GlassCard key={s.label} variant="dark" className="text-center">
              <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-[10px] text-slate-muted uppercase tracking-wider mt-1">{s.label}</div>
            </GlassCard>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 mb-6 p-1 bg-black/5 dark:bg-white/5 rounded-xl overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                tab === t.key
                  ? "bg-white dark:bg-midnight3 text-midnight dark:text-white shadow-sm"
                  : "text-slate-muted hover:text-midnight dark:hover:text-white"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Dashboard Tab */}
        {tab === "dashboard" && (
          <div className="grid sm:grid-cols-2 gap-6">
            <GlassCard variant="dark">
              <h3 className="text-sm font-bold text-midnight dark:text-white mb-4 flex items-center gap-2">
                <svg className="w-4 h-4 text-violet" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5" />
                </svg>
                System Overview
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-2 border-b border-slate-border">
                  <span className="text-slate-muted">Dreamers / Investors</span>
                  <span className="text-midnight dark:text-white font-medium">
                    {MOCK_USERS.filter((u) => u.role === "dreamer").length} / {MOCK_USERS.filter((u) => u.role === "investor").length}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-border">
                  <span className="text-slate-muted">Verified Users</span>
                  <span className="text-midnight dark:text-white font-medium">
                    {MOCK_USERS.filter((u) => u.verified).length}
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-slate-muted">Resolution Rate</span>
                  <span className="text-green-500 font-medium">
                    {MOCK_REPORTS.filter((r) => r.status === "resolved").length > 0
                      ? `${Math.round((MOCK_REPORTS.filter((r) => r.status === "resolved").length / MOCK_REPORTS.length) * 100)}%`
                      : "0%"}
                  </span>
                </div>
              </div>
            </GlassCard>

            <GlassCard variant="dark">
              <h3 className="text-sm font-bold text-midnight dark:text-white mb-4 flex items-center gap-2">
                <svg className="w-4 h-4 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
                Recent Activity
              </h3>
              <div className="space-y-3">
                {[
                  { text: "New report filed against cyber_forge", time: "2h ago", type: "alert" },
                  { text: "Verification approved for atlas_logistics", time: "5h ago", type: "success" },
                  { text: "User cyber_forge suspended", time: "1d ago", type: "warning" },
                  { text: "New user registered: tech_rabbat", time: "2d ago", type: "info" },
                ].map((a, i) => (
                  <div key={i} className="flex items-start gap-3 py-2 border-b border-slate-border last:border-0">
                    <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                      a.type === "alert" ? "bg-red-500" : a.type === "success" ? "bg-green-500" : a.type === "warning" ? "bg-yellow-500" : "bg-cyan"
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-midnight dark:text-white">{a.text}</p>
                      <p className="text-[10px] text-slate-muted">{a.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>
        )}

        {/* Users Tab */}
        {tab === "users" && (
          <GlassCard variant="dark" className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-border">
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-muted uppercase tracking-wider">Handle</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-muted uppercase tracking-wider">Email</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-muted uppercase tracking-wider">Role</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-muted uppercase tracking-wider">Status</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-muted uppercase tracking-wider">Verified</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-muted uppercase tracking-wider">Momentum</th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-slate-muted uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_USERS.map((user) => (
                    <tr key={user.id} className="border-b border-slate-border last:border-0 hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                      <td className="py-3 px-4">
                        <span className="font-medium text-midnight dark:text-white">@{user.handle}</span>
                      </td>
                      <td className="py-3 px-4 text-slate-muted">{user.email}</td>
                      <td className="py-3 px-4">
                        <Badge
                          label={user.role}
                          color={user.role === "admin" ? "#EF4444" : user.role === "investor" ? "#06B6D4" : "#8B5CF6"}
                          size="sm"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          label={user.status}
                          color={user.status === "active" ? "#22C55E" : "#EF4444"}
                          size="sm"
                          variant={user.status === "active" ? "default" : "outline"}
                        />
                      </td>
                      <td className="py-3 px-4">
                        {user.verified ? (
                          <svg className="w-4 h-4 text-cyan" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                          </svg>
                        ) : (
                          <span className="text-slate-muted">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`font-semibold ${user.momentumScore >= 70 ? "text-green-500" : "text-slate-muted"}`}>
                          {user.momentumScore}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button className="px-2 py-1 text-[10px] font-semibold rounded-lg bg-violet/10 text-violet hover:bg-violet/20 transition-colors">
                            Edit
                          </button>
                          <button className={`px-2 py-1 text-[10px] font-semibold rounded-lg transition-colors ${
                            user.status === "active"
                              ? "bg-red-500/10 text-red-500 hover:bg-red-500/20"
                              : "bg-green-500/10 text-green-500 hover:bg-green-500/20"
                          }`}>
                            {user.status === "active" ? "Suspend" : "Restore"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        )}

        {/* Reports Tab */}
        {tab === "reports" && (
          <div className="space-y-3">
            {MOCK_REPORTS.map((report) => (
              <GlassCard key={report.id} variant="dark">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge label={report.type} color={
                        report.type === "fraud" ? "#EF4444" : report.type === "spam" ? "#F59E0B" : "#6B7280"
                      } size="sm" />
                      <Badge label={report.status} color={
                        report.status === "pending" ? "#F59E0B" : report.status === "investigating" ? "#06B6D4" : "#22C55E"
                      } size="sm" variant="outline" />
                    </div>
                    <p className="text-sm text-midnight dark:text-white font-medium">
                      <span className="text-violet">@{report.reporter}</span>
                      {" reported "}
                      <span className="text-red-500">@{report.target}</span>
                    </p>
                    <p className="text-sm text-slate-muted mt-1">{report.reason}</p>
                    <p className="text-[10px] text-slate-muted mt-1">{report.createdAt}</p>
                  </div>
                  <div className="flex items-center gap-1 ml-4">
                    <button className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-green-500/10 text-green-500 hover:bg-green-500/20 transition-colors">
                      Dismiss
                    </button>
                    <button className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors">
                      Action
                    </button>
                  </div>
                </div>
              </GlassCard>
            ))}
            {MOCK_REPORTS.length === 0 && (
              <div className="text-center py-12 text-slate-muted text-sm">No reports to review.</div>
            )}
          </div>
        )}

        {/* Verification Tab */}
        {tab === "verification" && (
          <div className="space-y-3">
            {MOCK_VERIFICATION.map((v) => (
              <GlassCard key={v.id} variant="dark">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge label={v.type} color="#8B5CF6" size="sm" />
                      <Badge label={v.status} color={
                        v.status === "pending" ? "#F59E0B" : v.status === "approved" ? "#22C55E" : "#EF4444"
                      } size="sm" variant="outline" />
                    </div>
                    <p className="text-sm text-midnight dark:text-white font-medium">
                      @{v.handle}
                    </p>
                    <p className="text-sm text-slate-muted">
                      Document: <span className="font-mono text-xs">{v.document}</span>
                    </p>
                    <p className="text-[10px] text-slate-muted mt-1">Submitted {v.submittedAt}</p>
                  </div>
                  {v.status === "pending" && (
                    <div className="flex items-center gap-1 ml-4">
                      <button className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-green-500/10 text-green-500 hover:bg-green-500/20 transition-colors">
                        Approve
                      </button>
                      <button className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors">
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </GlassCard>
            ))}
          </div>
        )}

        {/* Feature Flags Tab */}
        {tab === "flags" && (
          <GlassCard variant="dark">
            <div className="space-y-2">
              {FEATURE_FLAGS.map((flag) => (
                <div key={flag.key} className="flex items-center justify-between py-3 px-3 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                  <div>
                    <span className="text-sm font-medium text-midnight dark:text-white">{flag.label}</span>
                    <p className="text-[10px] text-slate-muted font-mono mt-0.5">{flag.key}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked={flag.enabled} />
                    <div className="w-9 h-5 rounded-full bg-slate-border peer-checked:bg-violet peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all" />
                  </label>
                </div>
              ))}
            </div>
          </GlassCard>
        )}
      </main>
    </div>
  );
}
