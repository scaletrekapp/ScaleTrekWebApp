"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { GlassCard } from "@/components/ui/GlassCard";
import { Badge } from "@/components/ui/Badge";
import { useAuthStore } from "@/stores/useAuthStore";
import { createClient } from "@/lib/supabase-client";
import { useTranslation } from "react-i18next";

type AdminTab = "dashboard" | "users" | "reports" | "verification" | "flags" | "content" | "system" | "performance";

interface AdminUser {
  id: string; handle: string; email: string; role: string;
  status: string; verified: boolean; is_shadowed?: boolean; is_banned?: boolean;
  verified_scale?: string; momentum_score: number; created_at: string;
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
  const { t } = useTranslation();
  const router = useRouter();
  const authUser = useAuthStore((s) => s.user);
  const isAdmin = authUser?.role === "admin" || authUser?.role === "super_admin";
  const [tab, setTab] = useState<AdminTab>("dashboard");
  const [searchQuery, setSearchQuery] = useState("");

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [verifications, setVerifications] = useState<AdminVerification[]>([]);
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authUser) return;
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
  }, [authUser, isAdmin]);

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

  const handleBan = async (userId: string, current: boolean) => {
    const supabase = createClient();
    await supabase.from("profiles").update({ is_banned: !current, status: current ? "active" : "banned" }).eq("id", userId);
    setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, is_banned: !current, status: current ? "active" : "banned" } : u));
  };

  const handleShadowBan = async (userId: string, current: boolean) => {
    const supabase = createClient();
    await supabase.from("profiles").update({ is_shadowed: !current }).eq("id", userId);
    setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, is_shadowed: !current } : u));
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    const supabase = createClient();
    await supabase.from("profiles").update({ role: newRole }).eq("id", userId);
    setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, role: newRole } : u));
  };

  const handleScaleChange = async (userId: string, scale: string) => {
    const supabase = createClient();
    await supabase.from("profiles").update({ verified_scale: scale, verified: scale !== "none" }).eq("id", userId);
    setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, verified_scale: scale, verified: scale !== "none" } : u));
  };

  const filteredUsers = users.filter((u) =>
    u.handle.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleFlag = async (key: string, current: boolean) => {
    const supabase = createClient();
    await supabase.from("feature_flags").update({ enabled: !current, updated_at: new Date().toISOString() }).eq("key", key);
    setFlags((prev) => prev.map((f) => f.key === key ? { ...f, enabled: !current } : f));
  };

  const tabsList: { key: AdminTab; label: string }[] = [
    { key: "dashboard", label: t("admin.tabs.dashboard") },
    { key: "users", label: t("admin.tabs.users") },
    { key: "reports", label: t("admin.tabs.reports") },
    { key: "verification", label: t("admin.tabs.verification") },
    { key: "flags", label: t("admin.tabs.flags") },
    { key: "content", label: t("admin.tabs.content") },
    { key: "system", label: t("admin.tabs.system") },
    { key: "performance", label: "Performance" },
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
          <h1 className="text-xl font-bold text-midnight dark:text-white mb-2">{t("admin.accessDenied")}</h1>
          <p className="text-slate-muted text-sm">{t("admin.accessDeniedMsg")}</p>
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
            <h1 className="text-2xl font-bold text-midnight dark:text-white">{t("admin.title")}</h1>
            <p className="text-sm text-slate-muted">{t("admin.subtitle")}</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-violet border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-8">
              {([
                { label: t("admin.stats.totalUsers"), value: stats.totalUsers, color: "text-violet" },
                { label: t("admin.stats.active"), value: stats.activeUsers, color: "text-green-500" },
                { label: t("admin.stats.suspended"), value: stats.suspendedUsers, color: "text-red-500" },
                { label: t("admin.stats.pendingReports"), value: stats.pendingReports, color: "text-yellow-500" },
                { label: t("admin.stats.verifications"), value: stats.pendingVerifications, color: "text-cyan" },
              ]).map((s) => (
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
                    {t("admin.overview.title")}
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between py-2 border-b border-slate-border">
                      <span className="text-slate-muted">{t("admin.overview.dreamersInvestors")}</span>
                      <span className="text-midnight dark:text-white font-medium">
                        {users.filter((u) => u.role === "dreamer").length} / {users.filter((u) => u.role === "investor").length}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-border">
                      <span className="text-slate-muted">{t("admin.overview.verifiedUsers")}</span>
                      <span className="text-midnight dark:text-white font-medium">{users.filter((u) => u.verified).length}</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-slate-muted">{t("admin.overview.resolutionRate")}</span>
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
                    {t("admin.activity.title")}
                  </h3>
                  <div className="space-y-3">
                    {reports.length === 0 && (
                      <p className="text-sm text-slate-muted py-4 text-center">{t("admin.activity.none")}</p>
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
                <div className="p-3 border-b border-slate-border">
                  <div className="relative">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                    </svg>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={t("common.search")}
                      className="w-full pl-9 pr-3 py-2 rounded-lg bg-black/5 dark:bg-white/5 border border-slate-border text-sm text-midnight dark:text-white focus:outline-none focus:ring-2 focus:ring-violet/40"
                    />
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-border">
                        <th className="text-left py-3 px-4 text-xs font-semibold text-slate-muted uppercase tracking-wider">{t("admin.users.tableHeader.handle")}</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-slate-muted uppercase tracking-wider">{t("admin.users.tableHeader.role")}</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-slate-muted uppercase tracking-wider">{t("admin.users.tableHeader.status")}</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-slate-muted uppercase tracking-wider">{t("admin.users.tableHeader.verified")}</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-slate-muted uppercase tracking-wider">{t("admin.users.tableHeader.momentum")}</th>
                        <th className="text-right py-3 px-4 text-xs font-semibold text-slate-muted uppercase tracking-wider">{t("admin.users.tableHeader.actions")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((u) => (
                        <tr key={u.id} className="border-b border-slate-border last:border-0 hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-midnight dark:text-white">@{u.handle}</span>
                              {u.is_shadowed && <span className="text-[8px] px-1.5 py-0.5 rounded bg-yellow-500/10 text-yellow-500 font-semibold">SHD</span>}
                              {u.is_banned && <span className="text-[8px] px-1.5 py-0.5 rounded bg-red-500/10 text-red-500 font-semibold">BAN</span>}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <select
                              value={u.role}
                              onChange={(e) => handleRoleChange(u.id, e.target.value)}
                              className="text-[11px] bg-transparent border border-slate-border rounded-lg px-2 py-1 text-midnight dark:text-white focus:outline-none focus:ring-2 focus:ring-violet/40"
                            >
                              <option value="dreamer">dreamer</option>
                              <option value="investor">investor</option>
                              <option value="admin">admin</option>
                            </select>
                          </td>
                          <td className="py-3 px-4">
                            <Badge label={u.status} color={u.status === "active" ? "#22C55E" : u.status === "banned" ? "#EF4444" : "#F59E0B"} size="sm" variant={u.status === "active" ? "default" : "outline"} />
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
                            <div className="flex items-center justify-end gap-1 flex-wrap">
                              <button
                                onClick={() => handleSuspend(u.id, u.status)}
                                className={`px-2 py-1 text-[10px] font-semibold rounded-lg transition-colors ${
                                  u.status === "active"
                                    ? "bg-red-500/10 text-red-500 hover:bg-red-500/20"
                                    : "bg-green-500/10 text-green-500 hover:bg-green-500/20"
                                }`}
                              >
                                {u.status === "active" ? t("admin.users.suspend") : t("admin.users.restore")}
                              </button>
                              <button
                                onClick={() => handleShadowBan(u.id, !!u.is_shadowed)}
                                className={`px-2 py-1 text-[10px] font-semibold rounded-lg transition-colors ${
                                  u.is_shadowed
                                    ? "bg-green-500/10 text-green-500 hover:bg-green-500/20"
                                    : "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20"
                                }`}
                              >
                                {u.is_shadowed ? t("admin.users.removeShadowBan") : t("admin.users.shadowBan")}
                              </button>
                              <button
                                onClick={() => handleBan(u.id, !!u.is_banned)}
                                className={`px-2 py-1 text-[10px] font-semibold rounded-lg transition-colors ${
                                  u.is_banned
                                    ? "bg-green-500/10 text-green-500 hover:bg-green-500/20"
                                    : "bg-red-500/10 text-red-500 hover:bg-red-500/20"
                                }`}
                              >
                                {u.is_banned ? t("admin.users.restore") : t("admin.users.ban")}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {filteredUsers.length === 0 && (
                  <div className="text-center py-8 text-sm text-slate-muted">{t("common.noResults")}</div>
                )}
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
                          <button className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-green-500/10 text-green-500 hover:bg-green-500/20 transition-colors">{t("admin.reports.dismiss")}</button>
                          <button className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors">{t("admin.reports.action")}</button>
                        </div>
                      )}
                    </div>
                  </GlassCard>
                ))}
                {reports.length === 0 && <div className="text-center py-12 text-slate-muted text-sm">{t("admin.reports.none")}</div>}
              </div>
            )}

            {tab === "verification" && (
              <div className="space-y-3">
                {verifications.map((v) => {
                  const targetUser = users.find((u) => u.id === v.user_id);
                  return (
                    <GlassCard key={v.id} variant="dark">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Badge label={v.type} color="#8B5CF6" size="sm" />
                            <Badge label={v.status} color={v.status === "pending" ? "#F59E0B" : v.status === "approved" ? "#22C55E" : "#EF4444"} size="sm" variant="outline" />
                          </div>
                          <p className="text-sm text-midnight dark:text-white font-medium">@{v.handle}</p>
                          <p className="text-sm text-slate-muted">{t("admin.verification.document")}: <span className="font-mono text-xs">{v.document}</span></p>
                          <p className="text-[10px] text-slate-muted mt-1">{t("admin.verification.submitted")} {new Date(v.submitted_at).toLocaleDateString()}</p>
                          {targetUser && (
                            <div className="mt-2 flex items-center gap-2">
                              <span className="text-[10px] text-slate-muted">Scale:</span>
                              <select
                                value={targetUser.verified_scale || "none"}
                                onChange={(e) => handleScaleChange(v.user_id, e.target.value)}
                                className="text-[10px] bg-transparent border border-slate-border rounded-lg px-2 py-0.5 text-midnight dark:text-white focus:outline-none focus:ring-2 focus:ring-violet/40"
                              >
                                <option value="none">none</option>
                                <option value="basic">{t("admin.verification.basic")}</option>
                                <option value="verified">{t("admin.verification.verified")}</option>
                                <option value="elite">{t("admin.verification.elite")}</option>
                              </select>
                            </div>
                          )}
                        </div>
                        {v.status === "pending" && (
                          <div className="flex items-center gap-1 ml-4">
                            <button onClick={() => handleVerify(v.id, v.user_id, true)} className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-green-500/10 text-green-500 hover:bg-green-500/20 transition-colors">{t("admin.verification.approve")}</button>
                            <button onClick={() => handleVerify(v.id, v.user_id, false)} className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors">{t("admin.verification.reject")}</button>
                          </div>
                        )}
                      </div>
                    </GlassCard>
                  );
                })}
              </div>
            )}

            {tab === "content" && (
              <div className="space-y-3">
                <GlassCard variant="dark">
                  <h3 className="text-sm font-bold text-midnight dark:text-white mb-4 flex items-center gap-2">
                    <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                    </svg>
                    {t("admin.content.title")}
                  </h3>
                  <p className="text-sm text-slate-muted text-center py-8">{t("admin.content.noDisputes")}</p>
                </GlassCard>
              </div>
            )}

            {tab === "system" && (
              <div className="space-y-4">
                <GlassCard variant="dark">
                  <h3 className="text-sm font-bold text-midnight dark:text-white mb-4 flex items-center gap-2">
                    <svg className="w-4 h-4 text-violet" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
                    </svg>
                    {t("admin.system.title")}
                  </h3>
                  <div className="space-y-4">
                    {flags.filter((f) => f.key === "maintenance_mode").map((f) => (
                      <div key={f.key} className="flex items-center justify-between py-3 px-3 rounded-xl bg-black/5 dark:bg-white/5">
                        <div>
                          <span className="text-sm font-medium text-midnight dark:text-white">{t("admin.system.maintenanceMode")}</span>
                          <p className="text-[10px] text-slate-muted mt-0.5">{t("admin.system.maintenanceHint")}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" checked={f.enabled} onChange={() => toggleFlag(f.key, f.enabled)} />
                          <div className="w-9 h-5 rounded-full bg-slate-border peer-checked:bg-violet peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all" />
                        </label>
                      </div>
                    ))}
                    <div className="py-3 px-3">
                      <span className="text-sm font-medium text-midnight dark:text-white">{t("admin.system.systemBroadcast")}</span>
                      <div className="flex items-center gap-2 mt-2">
                        <input
                          type="text"
                          placeholder={t("admin.system.broadcastPlaceholder")}
                          className="flex-1 px-3 py-2 rounded-lg bg-black/5 dark:bg-white/5 border border-slate-border text-sm text-midnight dark:text-white focus:outline-none focus:ring-2 focus:ring-violet/40"
                        />
                        <button className="px-4 py-2 rounded-lg bg-violet text-white text-xs font-semibold hover:brightness-110 transition-all">{t("admin.system.send")}</button>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              </div>
            )}

            {tab === "performance" && (
              <div className="space-y-4">
                <GlassCard variant="dark">
                  <h3 className="text-sm font-bold text-midnight dark:text-white mb-4 flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                    </svg>
                    {t("admin.system.performance")}
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl bg-black/5 dark:bg-white/5 text-center">
                      <div className="text-2xl font-bold text-violet">—</div>
                      <div className="text-[10px] text-slate-muted uppercase tracking-wider mt-1">{t("admin.system.apiCalls")}</div>
                    </div>
                    <div className="p-4 rounded-xl bg-black/5 dark:bg-white/5 text-center">
                      <div className="text-2xl font-bold text-green-500">0%</div>
                      <div className="text-[10px] text-slate-muted uppercase tracking-wider mt-1">{t("admin.system.errorRate")}</div>
                    </div>
                    <div className="p-4 rounded-xl bg-black/5 dark:bg-white/5 text-center">
                      <div className="text-2xl font-bold text-yellow-500">Off</div>
                      <div className="text-[10px] text-slate-muted uppercase tracking-wider mt-1">{t("admin.system.rateLimiting")}</div>
                    </div>
                  </div>
                  {flags.filter((f) => f.key === "rate_limiting").map((f) => (
                    <div key={f.key} className="flex items-center justify-between py-3 px-3 rounded-xl bg-black/5 dark:bg-white/5 mt-4">
                      <div>
                        <span className="text-sm font-medium text-midnight dark:text-white">{t("admin.system.rateLimiting")}</span>
                        <p className="text-[10px] text-slate-muted mt-0.5">{t("admin.system.rateLimitingHint")}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked={f.enabled} onChange={() => toggleFlag(f.key, f.enabled)} />
                        <div className="w-9 h-5 rounded-full bg-slate-border peer-checked:bg-violet peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all" />
                      </label>
                    </div>
                  ))}
                </GlassCard>
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
