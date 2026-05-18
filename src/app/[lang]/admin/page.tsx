"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { GlassCard } from "@/components/ui/GlassCard";
import { Badge } from "@/components/ui/Badge";
import { useAuthStore } from "@/stores/useAuthStore";
import { createClient } from "@/lib/supabase-client";

type AdminTab = "dashboard" | "users" | "reports" | "verification" | "flags";

interface AdminUser {
  id: string; handle: string; email: string; role: string;
  status: string; verified: boolean; momentum_score: number; created_at: string;
}

interface AdminReport {
  id: string; type: string; reporter: string; target: string;
  reason: string; status: string; created_at: string;
}

interface AdminVerification {
  id: string; user_id: string; handle: string; type: string; document: string;
  status: string; submitted_at: string;
}

interface FeatureFlag {
  key: string; label: string; enabled: boolean;
}

export default function AdminPage({ params: { lang } }: { params: { lang: string } }) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role === "admin";
  const [tab, setTab] = useState<AdminTab>("dashboard");

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [verifications, setVerifications] = useState<AdminVerification[]>([]);
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    if (!isAdmin) { setLoading(false); return; }

    const supabase = createClient();

    supabase.from("profiles").select("*").order("created_at", { ascending: false }).then(({ data }) => {
      if (data) setUsers(data as AdminUser[]);
    });

    supabase.from("reports").select("*").order("created_at", { ascending: false }).then(({ data }) => {
      if (data) setReports(data as AdminReport[]);
    });

    supabase.from("verification_requests").select("*").order("submitted_at", { ascending: false }).then(({ data }) => {
      if (data) setVerifications(data as AdminVerification[]);
    });

    (async () => {
      const { data: flagData } = await supabase.from("feature_flags").select("*");
      if (flagData) setFlags(flagData as FeatureFlag[]);
      setLoading(false);
    })();
  }, [user, isAdmin]);

  const handleSuspend = async (userId: string, currentStatus: string) => {
    const supabase = createClient();
    const newStatus = currentStatus === "active" ? "suspended" : "active";
    await supabase.from("profiles").update({ status: newStatus }).eq("id", userId);
    setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, status: newStatus } : u));
  };

  const handleVerify = async (reqId: string, userId: string, approved: boolean) => {
    const supabase = createClient();
    const status = approved ? "approved" : "rejected";
    await supabase.from("verification_requests").update({ status, reviewed_at: new Date().toISOString() }).eq("id", reqId);
    if (approved) await supabase.from("profiles").update({ verified: true }).eq("id", userId);
    setVerifications((prev) => prev.map((v) => v.id === reqId ? { ...v, status } : v));
  };

  const toggleFlag = async (key: string, current: boolean) => {
    const supabase = createClient();
    await supabase.from("feature_flags").update({ enabled: !current, updated_at: new Date().toISOString() }).eq("key", key);
    setFlags((prev) => prev.map((f) => f.key === key ? { ...f, enabled: !current } : f));
  };

  const tabsList: { key: AdminTab; label: string }[] = [
    { key: "dashboard", label: "Dashboard" },
    { key: "users", label: "Users" },
    { key: "reports", label: "Reports" },
    { key: "verification", label: "Verification" },
    { key: "flags", label: "Feature Flags" },
  ];

  const stats = {
    totalUsers: users.length,
    activeUsers: users.filter((u) => u.status === "active").length,
    suspendedUsers: users.filter((u) => u.status === "suspended").length,
    pendingReports: reports.filter((r) => r.status === "pending").length,
    pendingVerifications: verifications.filter((v) => v.status === "pending").length,
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-white dark:bg-midnight">
        <Navbar lang={lang} />
        <main className="max-w-3xl mx-auto px-4 py-20 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-red-500/15 border border-red-500/20 flex items-center justify-center">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-midnight dark:text-white mb-2">Access Denied</h1>
          <p className="text-slate-muted text-sm">Admin privileges required.</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-midnight">
      <Navbar lang={lang} />
      <main className="max-w-6xl mx-auto px-4 py-8">
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

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-violet border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
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

            <div className="flex items-center gap-1 mb-6 p-1 bg-black/5 dark:bg-white/5 rounded-xl overflow-x-auto">
              {tabsList.map((t) => (
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
                        {users.filter((u) => u.role === "dreamer").length} / {users.filter((u) => u.role === "investor").length}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-border">
                      <span className="text-slate-muted">Verified Users</span>
                      <span className="text-midnight dark:text-white font-medium">{users.filter((u) => u.verified).length}</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-slate-muted">Resolution Rate</span>
                      <span className="text-green-500 font-medium">
                        {reports.length > 0 ? `${Math.round((reports.filter((r) => r.status === "resolved").length / reports.length) * 100)}%` : "0%"}
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
                    {reports.length === 0 && (
                      <p className="text-sm text-slate-muted py-4 text-center">No recent activity.</p>
                    )}
                    {reports.slice(0, 5).map((r) => (
                      <div key={r.id} className="flex items-start gap-3 py-2 border-b border-slate-border last:border-0">
                        <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                          r.status === "pending" ? "bg-yellow-500" : r.status === "resolved" ? "bg-green-500" : "bg-red-500"
                        }`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-midnight dark:text-white">{r.type} report: @{r.target}</p>
                          <p className="text-[10px] text-slate-muted">{new Date(r.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </GlassCard>
              </div>
            )}

            {tab === "users" && (
              <GlassCard variant="dark" className="overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-border">
                        <th className="text-left py-3 px-4 text-xs font-semibold text-slate-muted uppercase tracking-wider">Handle</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-slate-muted uppercase tracking-wider">Role</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-slate-muted uppercase tracking-wider">Status</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-slate-muted uppercase tracking-wider">Verified</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-slate-muted uppercase tracking-wider">Momentum</th>
                        <th className="text-right py-3 px-4 text-xs font-semibold text-slate-muted uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => (
                        <tr key={u.id} className="border-b border-slate-border last:border-0 hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                          <td className="py-3 px-4">
                            <span className="font-medium text-midnight dark:text-white">@{u.handle}</span>
                          </td>
                          <td className="py-3 px-4">
                            <Badge label={u.role} color={u.role === "admin" ? "#EF4444" : u.role === "investor" ? "#06B6D4" : "#8B5CF6"} size="sm" />
                          </td>
                          <td className="py-3 px-4">
                            <Badge label={u.status} color={u.status === "active" ? "#22C55E" : "#EF4444"} size="sm" variant={u.status === "active" ? "default" : "outline"} />
                          </td>
                          <td className="py-3 px-4">
                            {u.verified ? (
                              <svg className="w-4 h-4 text-cyan" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                              </svg>
                            ) : <span className="text-slate-muted">—</span>}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`font-semibold ${u.momentum_score >= 70 ? "text-green-500" : "text-slate-muted"}`}>{u.momentum_score}</span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button className="px-2 py-1 text-[10px] font-semibold rounded-lg bg-violet/10 text-violet hover:bg-violet/20 transition-colors">Edit</button>
                              <button
                                onClick={() => handleSuspend(u.id, u.status)}
                                className={`px-2 py-1 text-[10px] font-semibold rounded-lg transition-colors ${
                                  u.status === "active"
                                    ? "bg-red-500/10 text-red-500 hover:bg-red-500/20"
                                    : "bg-green-500/10 text-green-500 hover:bg-green-500/20"
                                }`}
                              >
                                {u.status === "active" ? "Suspend" : "Restore"}
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

            {tab === "reports" && (
              <div className="space-y-3">
                {reports.map((r) => (
                  <GlassCard key={r.id} variant="dark">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge label={r.type} color={r.type === "fraud" ? "#EF4444" : r.type === "spam" ? "#F59E0B" : "#6B7280"} size="sm" />
                          <Badge label={r.status} color={r.status === "pending" ? "#F59E0B" : r.status === "investigating" ? "#06B6D4" : "#22C55E"} size="sm" variant="outline" />
                        </div>
                        <p className="text-sm text-midnight dark:text-white font-medium">
                          <span className="text-violet">@{r.reporter}</span> reported <span className="text-red-500">@{r.target}</span>
                        </p>
                        <p className="text-sm text-slate-muted mt-1">{r.reason}</p>
                        <p className="text-[10px] text-slate-muted mt-1">{new Date(r.created_at).toLocaleDateString()}</p>
                      </div>
                      {r.status === "pending" && (
                        <div className="flex items-center gap-1 ml-4">
                          <button className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-green-500/10 text-green-500 hover:bg-green-500/20 transition-colors">Dismiss</button>
                          <button className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors">Action</button>
                        </div>
                      )}
                    </div>
                  </GlassCard>
                ))}
                {reports.length === 0 && <div className="text-center py-12 text-slate-muted text-sm">No reports to review.</div>}
              </div>
            )}

            {tab === "verification" && (
              <div className="space-y-3">
                {verifications.map((v) => (
                  <GlassCard key={v.id} variant="dark">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge label={v.type} color="#8B5CF6" size="sm" />
                          <Badge label={v.status} color={v.status === "pending" ? "#F59E0B" : v.status === "approved" ? "#22C55E" : "#EF4444"} size="sm" variant="outline" />
                        </div>
                        <p className="text-sm text-midnight dark:text-white font-medium">@{v.handle}</p>
                        <p className="text-sm text-slate-muted">Document: <span className="font-mono text-xs">{v.document}</span></p>
                        <p className="text-[10px] text-slate-muted mt-1">Submitted {new Date(v.submitted_at).toLocaleDateString()}</p>
                      </div>
                      {v.status === "pending" && (
                        <div className="flex items-center gap-1 ml-4">
                          <button onClick={() => handleVerify(v.id, v.user_id, true)} className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-green-500/10 text-green-500 hover:bg-green-500/20 transition-colors">Approve</button>
                          <button onClick={() => handleVerify(v.id, v.user_id, false)} className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors">Reject</button>
                        </div>
                      )}
                    </div>
                  </GlassCard>
                ))}
              </div>
            )}

            {tab === "flags" && (
              <GlassCard variant="dark">
                <div className="space-y-2">
                  {flags.map((flag) => (
                    <div key={flag.key} className="flex items-center justify-between py-3 px-3 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                      <div>
                        <span className="text-sm font-medium text-midnight dark:text-white">{flag.label}</span>
                        <p className="text-[10px] text-slate-muted font-mono mt-0.5">{flag.key}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={flag.enabled}
                          onChange={() => toggleFlag(flag.key, flag.enabled)}
                        />
                        <div className="w-9 h-5 rounded-full bg-slate-border peer-checked:bg-violet peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all" />
                      </label>
                    </div>
                  ))}
                </div>
              </GlassCard>
            )}
          </>
        )}
      </main>
    </div>
  );
}
