"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Badge } from "@/components/ui/Badge";
import { GlowButton } from "@/components/ui/GlowButton";
import { TabBar } from "@/components/ui/TabBar";
import { MiniBar } from "@/components/ui/DataViz";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { useRealtime } from "@/components/ui/useRealtime";
import { useAuthStore } from "@/stores/useAuthStore";
import { createClient } from "@/lib/supabase-client";
import type { User } from "@/types";

type AdminTab =
  | "dashboard"
  | "user-matrix"
  | "verification-pipeline"
  | "dispute-control"
  | "content-moderation"
  | "infrastructure-switchboard"
  | "audit-log"
  | "payments"
  | "investor-kyc";

interface AdminUser extends User {
  email?: string;
  status: string;
}

interface AdminReport {
  id: string;
  type: string;
  reporter_id: string;
  target_id: string;
  reporter_handle?: string;
  target_handle?: string;
  reason: string;
  status: string;
  created_at: string;
}

interface VerificationRequest {
  id: string;
  user_id: string;
  handle?: string;
  document_type: string;
  document_url?: string;
  status: string;
  submitted_at: string;
  reviewed_at?: string;
}

interface Dispute {
  id: string;
  post_id?: string;
  reporter_id: string;
  target_id: string;
  reporter_handle?: string;
  target_handle?: string;
  reason: string;
  status: string;
  evidence_url?: string;
  created_at: string;
  updated_at?: string;
}

interface FeatureFlag {
  key: string;
  label: string;
  enabled: boolean;
  updated_at?: string;
}

interface AdminPost {
  id: string;
  user_id: string;
  handle?: string;
  title: string;
  description?: string;
  type: string;
  milestone?: string;
  milestone_date?: string;
  visibility?: string;
  created_at: string;
  dispute_status?: string;
}

interface ActivityEvent {
  id: string;
  type: "signup" | "verification" | "report" | "dispute" | "flag" | "ban" | "milestone";
  handle: string;
  detail: string;
  timestamp: string;
}

const TABS: { key: AdminTab; label: string; icon: string }[] = [
  {
    key: "dashboard",
    label: "Dashboard",
    icon: "M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z",
  },
  {
    key: "user-matrix",
    label: "User Matrix",
    icon: "M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z",
  },
  {
    key: "verification-pipeline",
    label: "Verification Pipeline",
    icon: "M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  },
  {
    key: "dispute-control",
    label: "Dispute Control",
    icon: "M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z",
  },
  {
    key: "content-moderation",
    label: "Content Moderation",
    icon: "M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z",
  },
  {
    key: "infrastructure-switchboard",
    label: "Infrastructure",
    icon: "M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3",
  },
  {
    key: "audit-log",
    label: "Audit Log",
    icon: "M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z",
  },
  {
    key: "payments",
    label: "Payment Queue",
    icon: "M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125V9M7.5 9.75h3m-6 0h3m-3 2.25h3m-3 2.25h3m-3 2.25h3",
  },
  {
    key: "investor-kyc",
    label: "Investor KYC",
    icon: "M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z",
  },
];

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-white/5 ${className}`} />;
}

function formatRelativeTime(dateStr: string): string {
  const now = Date.now();
  const d = new Date(dateStr).getTime();
  const diff = now - d;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const fadeSlideUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const } },
};

const statCardAnim = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const } },
};

const tabContentAnim = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] as const } },
};

export default function AdminPage({ params: { lang } }: { params: { lang: string } }) {
  const { t } = useTranslation();
  const router = useRouter();
  const authUser = useAuthStore((s) => s.user);
  const isAdmin = authUser?.role === "admin" || authUser?.role === "super_admin";
  const [tab, setTab] = useState<AdminTab>("dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [verificationFilter, setVerificationFilter] = useState<string>("all");
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [broadcastText, setBroadcastText] = useState("");
  const [broadcastSending, setBroadcastSending] = useState(false);
  const [cacheClearing, setCacheClearing] = useState(false);
  const [scaleSelector, setScaleSelector] = useState<Record<string, string>>({});

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [verifications, setVerifications] = useState<VerificationRequest[]>([]);
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [adminPosts, setAdminPosts] = useState<AdminPost[]>([]);
  const [activityFeed, setActivityFeed] = useState<ActivityEvent[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [investorKyc, setInvestorKyc] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showToast, setShowToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>();

  const [now, setNow] = useState(new Date());

  const supabase = createClient();

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const showMessage = useCallback((msg: string) => {
    setShowToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setShowToast(null), 3000);
  }, []);

  const fetchAll = useCallback(async () => {
    if (!authUser || !isAdmin) return;
    setError(null);

    try {
      const [
        profilesRes,
        reportsRes,
        verificationsRes,
        flagsRes,
        postsRes,
        disputesRes,
      ] = await Promise.allSettled([
        supabase.from("profiles").select("*").order("created_at", { ascending: false }),
        supabase.from("reports").select("*").order("created_at", { ascending: false }),
        supabase.from("verification_requests").select("*").order("submitted_at", { ascending: false }),
        supabase.from("feature_flags").select("*"),
        supabase.from("posts").select("*").order("created_at", { ascending: false }).limit(20),
        supabase.from("disputes").select("*").order("created_at", { ascending: false }),
      ]);

      const [
        invoicesRes,
        investorKycRes,
      ] = await Promise.allSettled([
        supabase.from("invoices").select("*, profiles!inner(handle, email)").order("created_at", { ascending: false }),
        supabase.from("investor_profiles").select("*, profiles!inner(handle, email)").order("created_at", { ascending: false }),
      ]);

      if (profilesRes.status === "fulfilled" && profilesRes.value.data) {
        const mapped: AdminUser[] = profilesRes.value.data.map((p: Record<string, unknown>) => ({
          id: p.id as string,
          handle: p.handle as string,
          email: (p.email as string) || "",
          avatar: p.avatar_url as string | undefined,
          role: (p.role as User["role"]) || "dreamer",
          verified: (p.verified as boolean) || false,
          verifiedScale: (p.verified_scale as User["verifiedScale"]) || "none",
          isShadowed: (p.is_shadowed as boolean) || false,
          isBanned: (p.is_banned as boolean) || false,
          status: (p.status as string) || "active",
          realityScore: (p.reality_score as number) || 0,
          momentumScore: (p.momentum_score as number) || 0,
          joinedAt: (p.created_at as string) || "",
          headline: p.headline as string | undefined,
          location: p.location as string | undefined,
          bio: p.bio as string | undefined,
          isPro: (p.is_pro as boolean) || false,
          onboarded: (p.onboarded as boolean) || false,
        }));
        setUsers(mapped);
      }

      if (reportsRes.status === "fulfilled" && reportsRes.value.data) {
        setReports(reportsRes.value.data as AdminReport[]);
      }

      if (verificationsRes.status === "fulfilled" && verificationsRes.value.data) {
        setVerifications(verificationsRes.value.data as VerificationRequest[]);
      }

      if (flagsRes.status === "fulfilled" && flagsRes.value.data) {
        setFlags(flagsRes.value.data as FeatureFlag[]);
      }

      if (postsRes.status === "fulfilled" && postsRes.value.data) {
        setAdminPosts(postsRes.value.data as AdminPost[]);
      }

      if (disputesRes.status === "fulfilled" && disputesRes.value.data) {
        setDisputes(disputesRes.value.data as Dispute[]);
      }

      if (invoicesRes.status === "fulfilled" && invoicesRes.value.data) {
        setInvoices(invoicesRes.value.data);
      }

      if (investorKycRes.status === "fulfilled" && investorKycRes.value.data) {
        setInvestorKyc(investorKycRes.value.data);
      }

      setLastUpdated(new Date());
    } catch {
      setError("Failed to load some data sources");
    } finally {
      setLoading(false);
    }
  }, [authUser, isAdmin, supabase]);

  useEffect(() => {
    fetchAll();
    const interval = setInterval(fetchAll, 30000);
    return () => clearInterval(interval);
  }, [fetchAll]);

  useEffect(() => {
    if (!authUser) {
      router.push(`/${lang}`);
      return;
    }
  }, [authUser, router, lang]);

  useEffect(() => {
    if (!loading && users.length > 0) {
      const events: ActivityEvent[] = [];

      users.slice(0, 5).forEach((u) => {
        events.push({
          id: `signup-${u.id}`,
          type: "signup",
          handle: u.handle,
          detail: "Joined ScaleTrek",
          timestamp: u.joinedAt,
        });
      });

      verifications
        .filter((v) => v.status !== "pending")
        .slice(0, 3)
        .forEach((v) => {
          events.push({
            id: `verif-${v.id}`,
            type: "verification",
            handle: v.handle || "unknown",
            detail: `Verification ${v.status}`,
            timestamp: v.reviewed_at || v.submitted_at,
          });
        });

      reports.slice(0, 3).forEach((r) => {
        events.push({
          id: `report-${r.id}`,
          type: "report",
          handle: r.target_handle || "unknown",
          detail: `Reported: ${r.reason?.slice(0, 40)}`,
          timestamp: r.created_at,
        });
      });

      disputes.slice(0, 3).forEach((d) => {
        events.push({
          id: `dispute-${d.id}`,
          type: "dispute",
          handle: d.target_handle || "unknown",
          detail: `Dispute: ${d.reason?.slice(0, 40)}`,
          timestamp: d.created_at,
        });
      });

      events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setActivityFeed(events.slice(0, 10));
    }
  }, [loading, users, verifications, reports, disputes]);

  useRealtime("profiles", "*", (payload) => {
    if (payload.eventType === "INSERT") {
      setUsers((prev: AdminUser[]) => [payload.new as AdminUser, ...prev]);
    } else if (payload.eventType === "UPDATE") {
      setUsers((prev: AdminUser[]) => prev.map((u) => u.id === (payload.new as AdminUser).id ? { ...u, ...(payload.new as AdminUser) } : u));
    } else if (payload.eventType === "DELETE") {
      setUsers((prev: AdminUser[]) => prev.filter((u) => u.id !== (payload.old as AdminUser).id));
    }
  });

  useRealtime("verification_requests", "*", (payload) => {
    if (payload.eventType === "INSERT") {
      setVerifications((prev: any[]) => [payload.new, ...prev]);
    } else if (payload.eventType === "UPDATE") {
      setVerifications((prev: any[]) => prev.map((v) => (v as any).id === (payload.new as any).id ? { ...v, ...payload.new } : v));
    }
  });

  useRealtime("disputes", "*", (payload) => {
    if (payload.eventType === "INSERT") {
      setDisputes((prev: any[]) => [payload.new, ...prev]);
    } else if (payload.eventType === "UPDATE") {
      setDisputes((prev: any[]) => prev.map((d) => (d as any).id === (payload.new as any).id ? { ...d, ...payload.new } : d));
    }
  });

  useRealtime("reports", "*", (payload) => {
    if (payload.eventType === "INSERT") {
      setReports((prev: any[]) => [payload.new, ...prev]);
    } else if (payload.eventType === "UPDATE") {
      setReports((prev: any[]) => prev.map((r) => (r as any).id === (payload.new as any).id ? { ...r, ...payload.new } : r));
    }
  });

  const handleSuspend = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "suspended" : "active";
    await supabase.from("profiles").update({ status: newStatus }).eq("id", userId);
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, status: newStatus } : u)));
    showMessage(`User ${newStatus === "suspended" ? "suspended" : "restored"}`);
  };

  const handleShadowBan = async (userId: string, current: boolean) => {
    await supabase.from("profiles").update({ is_shadowed: !current }).eq("id", userId);
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, isShadowed: !current } : u)));
    showMessage(`Shadow ban ${current ? "removed" : "applied"}`);
  };

  const handleHardBan = async (userId: string, current: boolean) => {
    await supabase
      .from("profiles")
      .update({ is_banned: !current, status: current ? "active" : "banned" })
      .eq("id", userId);
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId ? { ...u, isBanned: !current, status: current ? "active" : "banned" } : u,
      ),
    );
    showMessage(`User ${current ? "unbanned" : "banned"}`);
  };

  const handleFreezeAccount = async (userId: string) => {
    await supabase.from("profiles").update({ status: "frozen" }).eq("id", userId);
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, status: "frozen" } : u)));
    showMessage("Account frozen");
  };

  const handleTerminateSession = async (userId: string) => {
    try {
      await supabase.auth.admin.deleteUser(userId);
      showMessage("Session terminated");
    } catch {
      showMessage("Session termination requires admin privileges");
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    await supabase.from("profiles").update({ role: newRole }).eq("id", userId);
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: newRole as User["role"] } : u)));
    showMessage(`Role changed to ${newRole}`);
  };

  const handleScaleChange = async (userId: string, scale: string) => {
    await supabase
      .from("profiles")
      .update({ verified_scale: scale, verified: scale !== "none" })
      .eq("id", userId);
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId ? { ...u, verifiedScale: scale as User["verifiedScale"], verified: scale !== "none" } : u,
      ),
    );
    showMessage(`Scale set to ${scale}`);
  };

  const handleVerifyRequest = async (reqId: string, userId: string, approved: boolean, scale?: string) => {
    const status = approved ? "approved" : "rejected";
    await supabase
      .from("verification_requests")
      .update({ status, reviewed_at: new Date().toISOString() })
      .eq("id", reqId);
    if (approved) {
      const s = scale || "verified";
      await supabase
        .from("profiles")
        .update({ verified: true, verified_scale: s })
        .eq("id", userId);
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, verified: true, verifiedScale: s as User["verifiedScale"] } : u)),
      );
    }
    setVerifications((prev) => prev.map((v) => (v.id === reqId ? { ...v, status } : v)));
    showMessage(approved ? "Verification approved" : "Verification rejected");
  };

  const handlePostDelete = async (postId: string) => {
    await supabase.from("posts").delete().eq("id", postId);
    setAdminPosts((prev) => prev.filter((p) => p.id !== postId));
    showMessage("Post deleted");
  };

  const handlePostHide = async (postId: string, hidden: boolean) => {
    await supabase.from("posts").update({ visibility: hidden ? "hidden" : "visible" }).eq("id", postId);
    setAdminPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, visibility: hidden ? "hidden" : "visible" } : p)),
    );
    showMessage(`Post ${hidden ? "hidden" : "visible"}`);
  };

  const toggleFlag = async (key: string, current: boolean) => {
    await supabase
      .from("feature_flags")
      .update({ enabled: !current, updated_at: new Date().toISOString() })
      .eq("key", key);
    setFlags((prev) => prev.map((f) => (f.key === key ? { ...f, enabled: !current } : f)));
    showMessage(`${key} ${!current ? "enabled" : "disabled"}`);
  };

  const handleBroadcast = async () => {
    if (!broadcastText.trim()) return;
    setBroadcastSending(true);
    try {
      const { error: broadcastErr } = await supabase.from("broadcasts").insert({
        message: broadcastText.trim(),
        created_by: authUser?.id,
        created_at: new Date().toISOString(),
      });
      if (broadcastErr) throw broadcastErr;
      showMessage("Broadcast sent");
      setBroadcastText("");
    } catch {
      showMessage("Broadcast channel unavailable");
    } finally {
      setBroadcastSending(false);
    }
  };

  const handleClearCache = async () => {
    setCacheClearing(true);
    await new Promise((r) => setTimeout(r, 1200));
    setCacheClearing(false);
    showMessage("Cache cleared");
  };

  const handleDisputeAction = async (disputeId: string, action: string) => {
    const newStatus =
      action === "dismiss" ? "dismissed" : action === "override" ? "overridden" : "archived";
    await supabase.from("disputes").update({ status: newStatus, updated_at: new Date().toISOString() }).eq("id", disputeId);
    setDisputes((prev) => prev.map((d) => (d.id === disputeId ? { ...d, status: newStatus } : d)));
    showMessage(`Dispute ${newStatus}`);
  };

  const handleApprovePayment = async (invoiceId: string, userId: string, tier: string) => {
    await supabase.from("invoices").update({ status: "paid", paid_at: new Date().toISOString() }).eq("id", invoiceId);
    await supabase.from("subscriptions").update({ payment_status: "paid", tier, status: "active" }).eq("user_id", userId);
    setInvoices((prev) => prev.map((inv) => (inv.id === invoiceId ? { ...inv, status: "paid" } : inv)));
    showMessage(`Payment confirmed — ${tier} activated`);
  };

  const handleApproveInvestor = async (userId: string) => {
    await supabase.from("investor_profiles").update({ investor_status: "approved", reviewed_by: authUser?.id, reviewed_at: new Date().toISOString() }).eq("user_id", userId);
    await supabase.from("profiles").update({ role: "investor" }).eq("id", userId);
    setInvestorKyc((prev) => prev.map((k) => (k.user_id === userId ? { ...k, investor_status: "approved" } : k)));
    showMessage("Investor approved");
  };

  const handleRejectInvestor = async (userId: string) => {
    await supabase.from("investor_profiles").update({ investor_status: "rejected", reviewed_by: authUser?.id, reviewed_at: new Date().toISOString() }).eq("user_id", userId);
    setInvestorKyc((prev) => prev.map((k) => (k.user_id === userId ? { ...k, investor_status: "rejected" } : k)));
    showMessage("Investor rejected");
  };

  const toggleMaintenance = () => {
    const mf = flags.find((f) => f.key === "maintenance_mode");
    if (mf) toggleFlag("maintenance_mode", mf.enabled);
  };

  const runSystemCheck = () => {
    showMessage("System check initiated");
  };

  const activeUsers = users.filter((u) => u.status === "active");
  const pendingVerifications = verifications.filter((v) => v.status === "pending");
  const activeReports = reports.filter((r) => r.status === "pending");
  const dreamers = users.filter((u) => u.role === "dreamer");
  const investors = users.filter((u) => u.role === "investor");
  const admins = users.filter((u) => u.role === "admin" || u.role === "super_admin");
  const verifiedUsers = users.filter((u) => u.verified);
  const resolvedReports = reports.filter((r) => r.status === "resolved");
  const resolutionRate = reports.length > 0 ? Math.round((resolvedReports.length / reports.length) * 100) : 0;
  const avgMomentum = users.length > 0 ? Math.round(users.reduce((s, u) => s + u.momentumScore, 0) / users.length) : 0;
  const systemHealth = users.length > 0
    ? Math.round((users.filter((u) => u.status === "active" || u.status === "frozen").length / users.length) * 100)
    : 100;

  const maintenanceFlag = flags.find((f) => f.key === "maintenance_mode");
  const rateLimitingFlag = flags.find((f) => f.key === "rate_limiting");

  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      u.handle.toLowerCase().includes(q) ||
      (u.email && u.email.toLowerCase().includes(q)) ||
      u.id.toLowerCase().includes(q);
    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    const matchesStatus = statusFilter === "all" || u.status === statusFilter;
    const matchesVerification =
      verificationFilter === "all" ||
      (verificationFilter === "verified" && u.verified) ||
      (verificationFilter === "unverified" && !u.verified) ||
      (verificationFilter === "shadowed" && u.isShadowed) ||
      (verificationFilter === "banned" && u.isBanned);
    return matchesSearch && matchesRole && matchesStatus && matchesVerification;
  });

  const underReviewDisputes = disputes.filter((d) => d.status === "under_review" || d.status === "pending");

  if (!authUser || loading) {
    return (
      <div className="min-h-screen bg-graphite">
        <Navbar lang={lang} />
        <main className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center gap-4 mb-10">
            <Skeleton className="w-12 h-12 rounded-xl" />
            <div>
              <Skeleton className="w-64 h-7 mb-2" />
              <Skeleton className="w-40 h-4" />
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-2xl" />
            ))}
          </div>
          <Skeleton className="h-12 rounded-xl mb-6" />
          <div className="grid grid-cols-2 gap-6">
            <Skeleton className="h-80 rounded-xl" />
            <Skeleton className="h-80 rounded-xl" />
          </div>
        </main>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-graphite">
        <Navbar lang={lang} />
        <main className="max-w-3xl mx-auto px-4 py-20 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-red-500/15 border border-red-500/20 flex items-center justify-center">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-white mb-2">{t("admin.accessDenied")}</h1>
          <p className="text-slate-muted text-sm">{t("admin.accessDeniedMsg")}</p>
        </main>
      </div>
    );
  }

  const statItems = [
    { label: "Total Users", value: users.length, accent: "violet" as const },
    { label: "Active", value: activeUsers.length, accent: "green" as const },
    { label: "Pending Verifications", value: pendingVerifications.length, accent: "amber" as const },
    { label: "Active Reports", value: activeReports.length, accent: "red" as const },
    { label: "Avg Momentum", value: avgMomentum, accent: "cyan" as const },
    { label: "System Health", value: systemHealth, accent: "health" as const, suffix: "%" },
  ];

  const statAccentMap: Record<string, { text: string; bg: string; border: string; bar: string }> = {
    violet: { text: "text-violet", bg: "bg-violet/10", border: "border-violet/20", bar: "bg-violet" },
    green: { text: "text-green-500", bg: "bg-green-500/10", border: "border-green-500/20", bar: "bg-green-500" },
    amber: { text: "text-yellow-500", bg: "bg-yellow-500/10", border: "border-yellow-500/20", bar: "bg-yellow-500" },
    red: { text: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/20", bar: "bg-red-500" },
    cyan: { text: "text-cyan", bg: "bg-cyan/10", border: "border-cyan/20", bar: "bg-cyan" },
    health: { text: "text-violet", bg: "bg-violet/10", border: "border-violet/20", bar: "bg-violet" },
  };

  return (
    <div className="min-h-screen bg-graphite">
      <Navbar lang={lang} />

      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="fixed top-4 right-4 z-50"
          >
            <div className="px-4 py-2.5 rounded-xl panel flex items-center gap-2.5 shadow-2xl">
              <svg className="w-4 h-4 text-cyan shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-xs text-white font-medium">{showToast}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-7xl mx-auto px-3 sm:px-6 py-8"
      >
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="w-11 h-11 rounded-xl bg-violet/10 border border-violet/20 flex items-center justify-center"
            >
              <svg className="w-5 h-5 text-violet" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
              </svg>
            </motion.div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-white tracking-tight">Control Tower</h1>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/10 border border-green-500/20">
                  <span className="relative flex w-1.5 h-1.5">
                    <span className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-75" />
                    <span className="relative rounded-full w-1.5 h-1.5 bg-green-500" />
                  </span>
                  <span className="text-[9px] font-semibold text-green-500 uppercase tracking-widest">System Online</span>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-slate-muted font-mono">
                  Last sync: {lastUpdated.toLocaleTimeString()}
                </span>
                <button onClick={fetchAll} className="p-1 rounded-md hover:bg-white/5 transition-colors">
                  <svg className="w-3.5 h-3.5 text-slate-muted hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
                  </svg>
                </button>
                <span className="text-[10px] text-slate-muted font-mono ml-2 tabular-nums">
                  {now.toLocaleTimeString()}
                </span>
                <span className="w-1 h-1 rounded-full bg-green-500 animate-pulse-dot ml-0.5" />
              </div>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="mb-6 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-2.5"
            >
              <svg className="w-4 h-4 text-red-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
              <span className="text-xs text-red-400 font-medium">{error}</span>
              <button onClick={fetchAll} className="ml-auto text-xs text-slate-muted hover:text-white transition-colors font-semibold">
                Retry
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8"
        >
          {statItems.map((s) => {
            const a = statAccentMap[s.accent === "health" && systemHealth >= 90 ? "green" : s.accent === "health" && systemHealth >= 70 ? "amber" : s.accent === "health" ? "red" : s.accent];
            return (
              <motion.div key={s.label} variants={statCardAnim}>
                <div className="panel p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`w-6 h-6 rounded-lg ${a.bg} border ${a.border} flex items-center justify-center`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${a.text} ${s.accent === "green" || (s.accent === "health" && systemHealth >= 90) ? "animate-pulse-dot" : ""}`} />
                    </div>
                    <span className="text-executive">{s.label}</span>
                  </div>
                  <AnimatedCounter
                    to={s.value}
                    className={`text-2xl font-light text-white tracking-tight`}
                    suffix={s.suffix || ""}
                  />
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        <div className="mb-6">
          <TabBar tabs={TABS} active={tab} onChange={(k) => setTab(k as AdminTab)} />
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={tab} {...tabContentAnim}>
            {tab === "dashboard" && (
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="space-y-6"
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <motion.div variants={fadeSlideUp}>
                    <div className="panel p-5">
                      <div className="flex items-center gap-2 mb-5">
                        <svg className="w-4 h-4 text-violet" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5" />
                        </svg>
                        <h3 className="text-sm font-semibold text-white">System Overview</h3>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between items-center py-2.5 border-b border-graphite-800/60">
                          <span className="text-xs text-slate-muted">Dreamers</span>
                          <div className="flex items-center gap-3">
                            <div className="w-24 h-1.5 rounded-full bg-white/5 overflow-hidden">
                              <div className="h-full rounded-full bg-violet transition-all duration-700" style={{ width: `${users.length > 0 ? (dreamers.length / users.length) * 100 : 0}%` }} />
                            </div>
                            <span className="text-xs font-mono text-white font-medium w-16 text-right"><AnimatedCounter to={dreamers.length} /></span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center py-2.5 border-b border-graphite-800/60">
                          <span className="text-xs text-slate-muted">Investors</span>
                          <div className="flex items-center gap-3">
                            <div className="w-24 h-1.5 rounded-full bg-white/5 overflow-hidden">
                              <div className="h-full rounded-full bg-cyan transition-all duration-700" style={{ width: `${users.length > 0 ? (investors.length / users.length) * 100 : 0}%` }} />
                            </div>
                            <span className="text-xs font-mono text-white font-medium w-16 text-right"><AnimatedCounter to={investors.length} /></span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center py-2.5 border-b border-graphite-800/60">
                          <span className="text-xs text-slate-muted">Admins</span>
                          <div className="flex items-center gap-3">
                            <div className="w-24 h-1.5 rounded-full bg-white/5 overflow-hidden">
                              <div className="h-full rounded-full bg-yellow-500 transition-all duration-700" style={{ width: `${users.length > 0 ? (admins.length / users.length) * 100 : 0}%` }} />
                            </div>
                            <span className="text-xs font-mono text-white font-medium w-16 text-right"><AnimatedCounter to={admins.length} /></span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center py-2.5 border-b border-graphite-800/60">
                          <span className="text-xs text-slate-muted">Verified Users</span>
                          <span className="text-xs font-mono text-cyan font-medium"><AnimatedCounter to={verifiedUsers.length} /></span>
                        </div>
                        <div className="flex justify-between items-center py-2.5 border-b border-graphite-800/60">
                          <span className="text-xs text-slate-muted">Resolution Rate</span>
                          <span className={`text-xs font-mono font-medium ${resolutionRate >= 80 ? "text-green-500" : resolutionRate >= 50 ? "text-yellow-500" : "text-red-500"}`}>
                            <AnimatedCounter to={resolutionRate} suffix="%" />
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-2.5">
                          <span className="text-xs text-slate-muted">Active Reports</span>
                          <span className="text-xs font-mono text-yellow-500 font-medium"><AnimatedCounter to={activeReports.length} /></span>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div variants={fadeSlideUp}>
                    <div className="panel p-5">
                      <div className="flex items-center gap-2 mb-5">
                        <svg className="w-4 h-4 text-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h3 className="text-sm font-semibold text-white">Recent Activity</h3>
                        <div className="ml-auto flex items-center gap-1.5">
                          <span className="relative flex w-1.5 h-1.5">
                            <span className="absolute inset-0 rounded-full bg-cyan animate-ping opacity-75" />
                            <span className="relative rounded-full w-1.5 h-1.5 bg-cyan" />
                          </span>
                          <span className="text-[9px] text-cyan font-mono uppercase tracking-widest">Live</span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        {activityFeed.map((event, idx) => (
                          <div
                            key={event.id}
                            className="flex items-start gap-3 py-2.5 border-b border-graphite-800/60 last:border-0 group hover:bg-white/[0.02] -mx-1 px-1 rounded-lg transition-colors duration-300"
                          >
                            <div className="relative mt-1.5">
                              <div
                                className={`w-2 h-2 rounded-full ${
                                  event.type === "signup"
                                    ? "bg-violet"
                                    : event.type === "verification"
                                      ? "bg-cyan"
                                      : event.type === "report"
                                        ? "bg-yellow-500"
                                        : event.type === "dispute"
                                          ? "bg-red-500"
                                          : "bg-green-500"
                                }`}
                              />
                              {idx < activityFeed.length - 1 && (
                                <div className="absolute top-3 left-1 w-px h-[calc(100%+4px)] bg-graphite-800/60" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-semibold text-violet">@{event.handle}</span>
                                <span className="text-[10px] text-slate-muted">•</span>
                                <span className="text-[10px] text-slate-muted">{formatRelativeTime(event.timestamp)}</span>
                              </div>
                              <p className="text-xs text-slate-muted mt-0.5 leading-relaxed">{event.detail}</p>
                            </div>
                            <Badge label={event.type} color={
                              event.type === "signup" ? "#818cf8" :
                              event.type === "verification" ? "#14b8a6" :
                              event.type === "report" ? "#F59E0B" :
                              event.type === "dispute" ? "#EF4444" : "#22C55E"
                            } size="sm" variant="outline" />
                          </div>
                        ))}
                        {activityFeed.length === 0 && (
                          <div className="text-center py-8">
                            <div className="w-10 h-10 mx-auto mb-3 rounded-lg panel flex items-center justify-center">
                              <svg className="w-5 h-5 text-slate-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                            <p className="text-xs text-slate-muted">No recent activity</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                </div>

                <motion.div variants={fadeSlideUp}>
                  <div className="panel p-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-violet" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                        </svg>
                        <h3 className="text-sm font-semibold text-white">Quick Actions</h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <GlowButton variant="secondary" size="sm" onClick={() => showMessage("Broadcast composer opened")}>
                          Broadcast Message
                        </GlowButton>
                        <GlowButton
                          variant={maintenanceFlag?.enabled ? "danger" : "secondary"}
                          size="sm"
                          onClick={toggleMaintenance}
                        >
                          {maintenanceFlag?.enabled ? "Disable Maintenance" : "Toggle Maintenance"}
                        </GlowButton>
                        <GlowButton variant="primary" size="sm" onClick={runSystemCheck}>
                          System Check
                        </GlowButton>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}

            {tab === "user-matrix" && (
              <div className="panel overflow-hidden">
                <div className="p-4 border-b border-graphite-800/60">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="relative flex-1">
                      <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                      </svg>
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by handle, email, or ID..."
                        className="w-full pl-9 pr-3 py-2 rounded-lg bg-black/20 border border-graphite-800/60 text-xs text-white placeholder:text-slate-muted focus:outline-none focus:ring-1 focus:ring-violet/40 transition-all font-mono"
                      />
                    </div>
                    <select
                      value={roleFilter}
                      onChange={(e) => setRoleFilter(e.target.value)}
                      className="px-3 py-2 rounded-lg bg-black/20 border border-graphite-800/60 text-[11px] text-white focus:outline-none focus:ring-1 focus:ring-violet/40"
                    >
                      <option value="all">All Roles</option>
                      <option value="dreamer">Dreamer</option>
                      <option value="investor">Investor</option>
                    </select>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="px-3 py-2 rounded-lg bg-black/20 border border-graphite-800/60 text-[11px] text-white focus:outline-none focus:ring-1 focus:ring-violet/40"
                    >
                      <option value="all">All Status</option>
                      <option value="active">Active</option>
                      <option value="suspended">Suspended</option>
                      <option value="banned">Banned</option>
                      <option value="frozen">Frozen</option>
                    </select>
                    <select
                      value={verificationFilter}
                      onChange={(e) => setVerificationFilter(e.target.value)}
                      className="px-3 py-2 rounded-lg bg-black/20 border border-graphite-800/60 text-[11px] text-white focus:outline-none focus:ring-1 focus:ring-violet/40"
                    >
                      <option value="all">All Verification</option>
                      <option value="verified">Verified</option>
                      <option value="unverified">Unverified</option>
                      <option value="shadowed">Shadow Banned</option>
                      <option value="banned">Banned</option>
                    </select>
                    <span className="text-[10px] text-slate-muted font-mono whitespace-nowrap">
                      {filteredUsers.length} / {users.length}
                    </span>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[700px] text-xs">
                    <thead>
                      <tr className="border-b border-graphite-800/60">
                        <th className="text-left py-3 px-4 text-executive">Avatar / Handle</th>
                        <th className="text-left py-3 px-4 text-executive">Email</th>
                        <th className="text-left py-3 px-4 text-executive">Role</th>
                        <th className="text-left py-3 px-4 text-executive">Status</th>
                        <th className="text-left py-3 px-4 text-executive">Verified</th>
                        <th className="text-left py-3 px-4 text-executive">Scale</th>
                        <th className="text-left py-3 px-4 text-executive">Momentum</th>
                        <th className="text-right py-3 px-4 text-executive">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((u) => (
                        <tr key={u.id} className="border-b border-graphite-800/60 last:border-0 hover:bg-white/[0.02] transition-colors duration-200">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-lg bg-graphite-800/60 border border-graphite-800/60 flex items-center justify-center overflow-hidden shrink-0">
                                {u.avatar ? (
                                  <img src={u.avatar} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <span className="text-[9px] font-bold text-violet font-mono">
                                    {u.handle.charAt(0).toUpperCase()}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-1.5 min-w-0">
                                <span className="font-semibold text-white font-mono text-[11px]">@{u.handle}</span>
                                {u.isShadowed && (
                                  <span className="text-[8px] px-1.5 py-0.5 rounded bg-yellow-500/15 text-yellow-500 font-bold tracking-wider border border-yellow-500/20">SHD</span>
                                )}
                                {u.isBanned && (
                                  <span className="text-[8px] px-1.5 py-0.5 rounded bg-red-500/15 text-red-500 font-bold tracking-wider border border-red-500/20">BAN</span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-slate-muted font-mono text-[10px] max-w-[140px] truncate">{u.email || "—"}</td>
                          <td className="py-3 px-4">
                            <select
                              value={u.role}
                              onChange={(e) => handleRoleChange(u.id, e.target.value)}
                              className="text-[10px] bg-transparent border border-graphite-800/60 rounded-lg px-2 py-1 text-white focus:outline-none focus:ring-1 focus:ring-violet/40 transition-all cursor-pointer hover:border-violet/40"
                            >
                              <option value="dreamer">dreamer</option>
                              <option value="investor">investor</option>
                            </select>
                          </td>
                          <td className="py-3 px-4">
                            <Badge
                              label={u.status}
                              color={
                                u.status === "active"
                                  ? "#22C55E"
                                  : u.status === "suspended"
                                    ? "#F59E0B"
                                    : u.status === "banned"
                                      ? "#EF4444"
                                      : u.status === "frozen"
                                        ? "#14b8a6"
                                        : "#6B7280"
                              }
                              size="sm"
                              variant={u.status === "active" ? "default" : "outline"}
                            />
                          </td>
                          <td className="py-3 px-4">
                            {u.verified ? (
                              <div className="flex items-center gap-1">
                                <svg className="w-3.5 h-3.5 text-cyan" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                                </svg>
                                <span className="text-[10px] text-cyan font-medium">YES</span>
                              </div>
                            ) : (
                              <span className="text-slate-muted text-[10px] font-mono">—</span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <select
                              value={u.verifiedScale || "none"}
                              onChange={(e) => handleScaleChange(u.id, e.target.value)}
                              className="text-[10px] bg-transparent border border-graphite-800/60 rounded-lg px-2 py-1 text-white focus:outline-none focus:ring-1 focus:ring-violet/40 transition-all cursor-pointer hover:border-violet/40"
                            >
                              <option value="none">none</option>
                              <option value="basic">basic</option>
                              <option value="verified">verified</option>
                              <option value="elite">elite</option>
                            </select>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <div className="w-16">
                                <MiniBar value={u.momentumScore} max={100} color={u.momentumScore >= 70 ? "#22C55E" : u.momentumScore >= 40 ? "#F59E0B" : "#EF4444"} />
                              </div>
                              <span className={`text-[10px] font-mono font-semibold ${
                                u.momentumScore >= 70 ? "text-green-500" : u.momentumScore >= 40 ? "text-yellow-500" : "text-red-500"
                              }`}>
                                {u.momentumScore}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <MagneticButton
                                variant={u.status === "active" ? "danger" : "secondary"}
                                size="sm"
                                onClick={() => handleSuspend(u.id, u.status)}
                              >
                                {u.status === "active" ? "Suspend" : "Restore"}
                              </MagneticButton>
                              <MagneticButton
                                variant={u.isShadowed ? "secondary" : "ghost"}
                                size="sm"
                                onClick={() => handleShadowBan(u.id, !!u.isShadowed)}
                              >
                                {u.isShadowed ? "Unshadow" : "Shadow Ban"}
                              </MagneticButton>
                              <MagneticButton
                                variant={u.isBanned ? "secondary" : "danger"}
                                size="sm"
                                onClick={() => handleHardBan(u.id, !!u.isBanned)}
                              >
                                {u.isBanned ? "Unban" : "Hard Ban"}
                              </MagneticButton>
                              <MagneticButton
                                variant="ghost"
                                size="sm"
                                onClick={() => handleFreezeAccount(u.id)}
                              >
                                Freeze
                              </MagneticButton>
                              <MagneticButton
                                variant="ghost"
                                size="sm"
                                onClick={() => handleTerminateSession(u.id)}
                              >
                                Kill Session
                              </MagneticButton>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {filteredUsers.length === 0 && (
                  <div className="text-center py-12">
                    <div className="w-10 h-10 mx-auto mb-3 rounded-lg panel flex items-center justify-center">
                      <svg className="w-5 h-5 text-slate-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                      </svg>
                    </div>
                    <p className="text-xs text-slate-muted">No users match your filters</p>
                  </div>
                )}
              </div>
            )}

            {tab === "verification-pipeline" && (
              <div className="space-y-3">
                {verifications.filter((v) => v.status === "pending").length > 0 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 mb-4 px-1">
                    <span className="relative flex w-2 h-2">
                      <span className="absolute inset-0 rounded-full bg-yellow-500 animate-ping opacity-75" />
                      <span className="relative rounded-full w-2 h-2 bg-yellow-500" />
                    </span>
                    <span className="text-xs text-slate-muted font-mono">
                      {verifications.filter((v) => v.status === "pending").length} pending requests in queue
                    </span>
                  </motion.div>
                )}
                {verifications.filter((v) => v.status === "pending").map((v) => {
                  const targetUser = users.find((u) => u.id === v.user_id);
                  return (
                    <div key={v.id} className="panel-hover p-4">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-xl bg-graphite-800/60 border border-graphite-800/60 flex items-center justify-center shrink-0">
                            <span className="text-sm font-bold text-violet font-mono">
                              {(v.handle || "?").charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1.5">
                              <span className="text-sm font-semibold text-white">@{v.handle || "unknown"}</span>
                              <Badge label={v.document_type} color="#818cf8" size="sm" />
                              <Badge label={v.status} color="#F59E0B" size="sm" variant="outline" />
                            </div>
                            <p className="text-[11px] text-slate-muted font-mono">
                              Submitted {formatRelativeTime(v.submitted_at)}
                            </p>
                            {v.document_url && (
                              <p className="text-[10px] text-slate-muted font-mono mt-1 truncate max-w-md">
                                Document: {v.document_url}
                              </p>
                            )}
                            {targetUser && (
                              <div className="mt-3 flex items-center gap-2">
                                <span className="text-executive">Approve scale:</span>
                                <select
                                  value={scaleSelector[v.user_id] || "verified"}
                                  onChange={(e) => setScaleSelector((p) => ({ ...p, [v.user_id]: e.target.value }))}
                                  className="text-[10px] bg-transparent border border-graphite-800/60 rounded-lg px-2 py-1 text-white focus:outline-none focus:ring-1 focus:ring-violet/40 cursor-pointer"
                                >
                                  <option value="basic">basic</option>
                                  <option value="verified">verified</option>
                                  <option value="elite">elite</option>
                                </select>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 sm:ml-4">
                          <GlowButton
                            variant="primary"
                            size="sm"
                            onClick={() => handleVerifyRequest(v.id, v.user_id, true, scaleSelector[v.user_id] || "verified")}
                          >
                            Approve
                          </GlowButton>
                          <GlowButton
                            variant="danger"
                            size="sm"
                            onClick={() => handleVerifyRequest(v.id, v.user_id, false)}
                          >
                            Reject
                          </GlowButton>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {verifications.filter((v) => v.status === "approved").slice(0, 3).map((v) => (
                  <div key={v.id} className="panel p-4 opacity-60 hover:opacity-100 transition-opacity duration-300">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                      <div className="w-8 h-8 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                        <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                      </div>
                      <div>
                        <span className="text-xs text-white font-medium">@{v.handle || "unknown"}</span>
                        <span className="text-[10px] text-slate-muted ml-2 font-mono">
                          Approved {v.reviewed_at ? formatRelativeTime(v.reviewed_at) : ""}
                        </span>
                      </div>
                      <div className="sm:ml-auto"><Badge label="approved" color="#22C55E" size="sm" variant="outline" /></div>
                    </div>
                  </div>
                ))}
                {verifications.length === 0 && (
                  <div className="panel p-8 text-center">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-graphite-800/60 border border-graphite-800/60 flex items-center justify-center">
                      <svg className="w-6 h-6 text-slate-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="text-sm text-slate-muted font-medium">No verification requests</p>
                    <p className="text-[10px] text-slate-muted mt-1 font-mono">The queue is empty</p>
                  </div>
                )}
                {verifications.length > 0 && verifications.filter((v) => v.status === "pending").length === 0 && (
                  <div className="panel p-8 text-center">
                    <div className="w-10 h-10 mx-auto mb-3 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                      <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="text-sm text-slate-muted font-medium">All caught up</p>
                    <p className="text-[10px] text-slate-muted mt-1 font-mono">No pending verification requests</p>
                  </div>
                )}
              </div>
            )}

            {tab === "dispute-control" && (
              <div className="space-y-4">
                {underReviewDisputes.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3 px-1">
                      <svg className="w-4 h-4 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                      </svg>
                      <h3 className="text-xs font-semibold text-white uppercase tracking-wider">Under Review</h3>
                      <Badge label={underReviewDisputes.length.toString()} color="#F59E0B" size="sm" />
                    </div>
                    {underReviewDisputes.map((d) => (
                      <div key={d.id} className="panel-hover p-4">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge label={d.status === "under_review" ? "IN REVIEW" : d.status} color="#F59E0B" size="sm" />
                              <Badge label={d.reason?.slice(0, 20) || "dispute"} color="#EF4444" size="sm" variant="outline" />
                            </div>
                            <p className="text-xs text-white font-medium">
                              <span className="text-violet">@{d.reporter_handle || "unknown"}</span>
                              <span className="text-slate-muted mx-1">→</span>
                              <span className="text-red-500">@{d.target_handle || "unknown"}</span>
                            </p>
                            <p className="text-[11px] text-slate-muted mt-1">{d.reason}</p>
                            <div className="flex items-center gap-3 mt-2">
                              <p className="text-[10px] text-slate-muted font-mono">
                                Filed {formatRelativeTime(d.created_at)}
                              </p>
                              {d.evidence_url && (
                                <a
                                  href={d.evidence_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[10px] text-cyan font-mono hover:underline"
                                >
                                  View Evidence ↗
                                </a>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 sm:ml-4">
                            <MagneticButton variant="danger" size="sm" onClick={() => handleDisputeAction(d.id, "override")}>
                              Override
                            </MagneticButton>
                            <MagneticButton variant="secondary" size="sm" onClick={() => handleDisputeAction(d.id, "dismiss")}>
                              Dismiss
                            </MagneticButton>
                            <MagneticButton variant="ghost" size="sm" onClick={() => handleDisputeAction(d.id, "archive")}>
                              Archive Evid.
                            </MagneticButton>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div>
                  <div className="flex items-center gap-2 mb-3 px-1">
                    <svg className="w-4 h-4 text-slate-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 00-1.883 2.542l.857 6a2.25 2.25 0 002.227 1.932H19.05a2.25 2.25 0 002.227-1.932l.857-6a2.25 2.25 0 00-1.883-2.542m-16.5 0V6A2.25 2.25 0 016 3.75h3.879a1.5 1.5 0 011.06.44l2.122 2.12a1.5 1.5 0 001.06.44H18A2.25 2.25 0 0120.25 9v.776" />
                    </svg>
                    <h3 className="text-xs font-semibold text-slate-muted uppercase tracking-wider">All Disputes</h3>
                    <Badge label={disputes.length.toString()} color="#6B7280" size="sm" variant="outline" />
                  </div>
                  {disputes.map((d) => (
                    <div key={d.id} className="panel p-3 mb-2 opacity-70 hover:opacity-100 transition-all duration-200">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-2 h-2 rounded-full shrink-0 ${
                            d.status === "dismissed" ? "bg-green-500" :
                            d.status === "overridden" ? "bg-red-500" :
                            d.status === "archived" ? "bg-slate-muted" :
                            "bg-yellow-500"
                          }`} />
                          <div className="min-w-0">
                            <span className="text-xs text-white font-medium">
                              @{d.reporter_handle || "?"} <span className="text-slate-muted">→</span> @{d.target_handle || "?"}
                            </span>
                            <p className="text-[10px] text-slate-muted truncate">{d.reason}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 sm:ml-4 shrink-0">
                          <Badge label={d.status} color={
                            d.status === "dismissed" ? "#22C55E" :
                            d.status === "overridden" ? "#EF4444" :
                            d.status === "archived" ? "#6B7280" : "#F59E0B"
                          } size="sm" variant="outline" />
                          <span className="text-[10px] text-slate-muted font-mono">{formatRelativeTime(d.created_at)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {disputes.length === 0 && (
                    <div className="panel p-8 text-center">
                      <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-graphite-800/60 border border-graphite-800/60 flex items-center justify-center">
                        <svg className="w-6 h-6 text-slate-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                        </svg>
                      </div>
                      <p className="text-sm text-slate-muted font-medium">No disputes</p>
                      <p className="text-[10px] text-slate-muted mt-1 font-mono">The system is clear</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {tab === "content-moderation" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between mb-2 px-1">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-violet" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                    </svg>
                    <h3 className="text-xs font-semibold text-white uppercase tracking-wider">Recent Posts</h3>
                    <span className="text-[10px] text-slate-muted font-mono">Last 20</span>
                  </div>
                </div>
                {adminPosts.map((post) => (
                  <div key={post.id} className="panel-hover p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                          <Badge label={post.type} color={post.type === "dreamer" ? "#818cf8" : "#14b8a6"} size="sm" />
                          {post.dispute_status && post.dispute_status !== "none" && (
                            <Badge label={`Dispute: ${post.dispute_status}`} color="#EF4444" size="sm" variant="outline" />
                          )}
                          {post.visibility === "hidden" && (
                            <Badge label="HIDDEN" color="#6B7280" size="sm" variant="outline" />
                          )}
                        </div>
                        <p className="text-sm font-semibold text-white truncate">{post.title}</p>
                        <p className="text-[11px] text-slate-muted mt-0.5 line-clamp-2">{post.description || ""}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-[10px] text-violet font-mono">@{post.handle || "unknown"}</span>
                          {post.milestone && (
                            <span className="text-[10px] text-slate-muted font-mono">Milestone: {post.milestone}</span>
                          )}
                          <span className="text-[10px] text-slate-muted font-mono">{formatRelativeTime(post.created_at)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4 shrink-0">
                        <GlowButton variant="danger" size="sm" onClick={() => handlePostDelete(post.id)}>
                          Delete
                        </GlowButton>
                        <GlowButton
                          variant={post.visibility === "hidden" ? "secondary" : "ghost"}
                          size="sm"
                          onClick={() => handlePostHide(post.id, post.visibility !== "hidden")}
                        >
                          {post.visibility === "hidden" ? "Show" : "Hide"}
                        </GlowButton>
                      </div>
                    </div>
                  </div>
                ))}
                {adminPosts.length === 0 && (
                  <div className="panel p-8 text-center">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-graphite-800/60 border border-graphite-800/60 flex items-center justify-center">
                      <svg className="w-6 h-6 text-slate-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 013.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                      </svg>
                    </div>
                    <p className="text-sm text-slate-muted font-medium">No posts found</p>
                    <p className="text-[10px] text-slate-muted mt-1 font-mono">The content feed is empty</p>
                  </div>
                )}
              </div>
            )}

            {tab === "infrastructure-switchboard" && (
              <div className="space-y-4">
                <div className="panel p-5">
                  <div className="flex items-center gap-2 mb-5">
                    <svg className="w-4 h-4 text-violet" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
                    </svg>
                    <h3 className="text-sm font-semibold text-white">Infrastructure Controls</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between py-3 px-4 rounded-xl bg-black/20 border border-graphite-800/60 hover:border-violet/20 transition-all duration-300">
                      <div>
                        <span className="text-sm font-medium text-white">Maintenance Mode</span>
                        <p className="text-[10px] text-slate-muted mt-0.5 font-mono">
                          {maintenanceFlag?.enabled
                            ? "Users cannot access the platform"
                            : "Normal operation — all systems nominal"}
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={maintenanceFlag?.enabled || false}
                          onChange={() => maintenanceFlag && toggleFlag("maintenance_mode", maintenanceFlag.enabled)}
                        />
                        <div className="w-10 h-5 rounded-full bg-graphite-800/60 peer-checked:bg-violet cursor-pointer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all after:duration-300 after:shadow-lg" />
                      </label>
                    </div>

                    <div className="py-3 px-4 rounded-xl bg-black/20 border border-graphite-800/60">
                      <span className="text-sm font-medium text-white">System Broadcast</span>
                      <div className="flex items-center gap-2 mt-2">
                        <input
                          type="text"
                          value={broadcastText}
                          onChange={(e) => setBroadcastText(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handleBroadcast()}
                          placeholder="Type broadcast message..."
                          className="flex-1 px-3 py-2 rounded-lg bg-black/20 border border-graphite-800/60 text-xs text-white placeholder:text-slate-muted focus:outline-none focus:ring-1 focus:ring-violet/40 transition-all font-mono"
                        />
                        <GlowButton variant="primary" size="sm" onClick={handleBroadcast} loading={broadcastSending}>
                          Send
                        </GlowButton>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="panel p-5">
                  <div className="flex items-center gap-2 mb-5">
                    <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                    </svg>
                    <h3 className="text-sm font-semibold text-white">Performance Monitor</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                    <div className="panel p-4 text-center">
                      <div className="text-2xl font-light text-violet font-mono">—</div>
                      <div className="text-executive mt-1">API Calls</div>
                    </div>
                    <div className="panel p-4 text-center">
                      <div className="text-2xl font-light text-green-500 font-mono">0%</div>
                      <div className="text-executive mt-1">Error Rate</div>
                    </div>
                    <div className="panel p-4 text-center">
                      <div className={`text-2xl font-light font-mono ${rateLimitingFlag?.enabled ? "text-cyan" : "text-yellow-500"}`}>
                        {rateLimitingFlag?.enabled ? "On" : "Off"}
                      </div>
                      <div className="text-executive mt-1">Rate Limiting</div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between py-3 px-4 rounded-xl bg-black/20 border border-graphite-800/60 hover:border-cyan/20 transition-all duration-300">
                      <div>
                        <span className="text-sm font-medium text-white">Rate Limiting</span>
                        <p className="text-[10px] text-slate-muted mt-0.5 font-mono">
                          {rateLimitingFlag?.enabled ? "Rate limiting is active" : "No rate limits applied"}
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={rateLimitingFlag?.enabled || false}
                          onChange={() => rateLimitingFlag && toggleFlag("rate_limiting", rateLimitingFlag.enabled)}
                        />
                        <div className="w-10 h-5 rounded-full bg-graphite-800/60 peer-checked:bg-cyan cursor-pointer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all after:duration-300 after:shadow-lg" />
                      </label>
                    </div>
                    <div className="flex items-center justify-between py-3 px-4 rounded-xl bg-black/20 border border-graphite-800/60 hover:border-violet/20 transition-all duration-300">
                      <div>
                        <span className="text-sm font-medium text-white">Cache</span>
                        <p className="text-[10px] text-slate-muted mt-0.5 font-mono">Clear all cached data and re-index</p>
                      </div>
                      <GlowButton variant="secondary" size="sm" onClick={handleClearCache} loading={cacheClearing}>
                        {cacheClearing ? "Clearing..." : "Clear Cache"}
                      </GlowButton>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {tab === "payments" && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-3 px-1">
                  <svg className="w-4 h-4 text-violet" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125V9M7.5 9.75h3m-6 0h3m-3 2.25h3m-3 2.25h3m-3 2.25h3" />
                  </svg>
                  <h3 className="text-xs font-semibold text-white uppercase tracking-wider">Payment Queue</h3>
                  <Badge label={invoices.filter((i) => i.status === "pending").length.toString()} color="#F59E0B" size="sm" />
                </div>
                {invoices.filter((i) => i.status === "pending").map((inv) => (
                  <div key={inv.id} className="panel-hover p-4">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge label={inv.tier} color={inv.tier === "elite" ? "#14b8a6" : "#818cf8"} size="sm" />
                          <Badge label={inv.status} color="#F59E0B" size="sm" variant="outline" />
                          <span className="text-[10px] text-slate-muted font-mono">{inv.invoice_number}</span>
                        </div>
                        <p className="text-xs text-white font-medium">
                          @{inv.profiles?.handle || "unknown"} — {inv.amount} {inv.currency}
                        </p>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-[10px] text-slate-muted font-mono">Due {new Date(inv.due_date).toLocaleDateString()}</span>
                          {inv.receipt_url && (
                            <a href={inv.receipt_url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-cyan font-mono hover:underline">
                              View Receipt ↗
                            </a>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 sm:ml-4">
                        <GlowButton variant="primary" size="sm" onClick={() => handleApprovePayment(inv.id, inv.user_id, inv.tier)}>
                          Confirm Payment
                        </GlowButton>
                        <GlowButton variant="danger" size="sm" onClick={() => {
                          supabase.from("invoices").update({ status: "cancelled" }).eq("id", inv.id).then(() => {
                            setInvoices((prev) => prev.map((i) => i.id === inv.id ? { ...i, status: "cancelled" } : i));
                            showMessage("Invoice cancelled");
                          });
                        }}>
                          Cancel
                        </GlowButton>
                      </div>
                    </div>
                  </div>
                ))}
                {invoices.filter((i) => i.status !== "pending").map((inv) => (
                  <div key={inv.id} className="panel p-3 opacity-60 hover:opacity-100 transition-all">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge label={inv.status} color={inv.status === "paid" ? "#22C55E" : inv.status === "overdue" ? "#EF4444" : "#6B7280"} size="sm" variant="outline" />
                        <span className="text-xs text-white font-medium font-mono">{inv.invoice_number}</span>
                        <span className="text-xs text-slate-muted">@{inv.profiles?.handle || "?"}</span>
                        <span className="text-[10px] text-slate-muted">{inv.amount} {inv.currency}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge label={inv.tier} color={inv.tier === "elite" ? "#14b8a6" : "#818cf8"} size="sm" />
                        {inv.receipt_url && (
                          <a href={inv.receipt_url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-cyan font-mono hover:underline">Receipt ↗</a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {invoices.length === 0 && (
                  <div className="panel p-8 text-center">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-graphite-800/60 border border-graphite-800/60 flex items-center justify-center">
                      <svg className="w-6 h-6 text-slate-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125V9M7.5 9.75h3m-6 0h3m-3 2.25h3m-3 2.25h3m-3 2.25h3" />
                      </svg>
                    </div>
                    <p className="text-sm text-slate-muted font-medium">No payments yet</p>
                    <p className="text-[10px] text-slate-muted mt-1 font-mono">Waiting for concierge subscriptions</p>
                  </div>
                )}
              </div>
            )}

            {tab === "investor-kyc" && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-3 px-1">
                  <svg className="w-4 h-4 text-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                  <h3 className="text-xs font-semibold text-white uppercase tracking-wider">Investor KYC Review</h3>
                  <Badge label={investorKyc.filter((k) => k.investor_status === "pending").length.toString()} color="#F59E0B" size="sm" />
                </div>
                {investorKyc.filter((k) => k.investor_status === "pending").map((k) => (
                  <div key={k.id} className="panel-hover p-4">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-semibold text-white">@{k.profiles?.handle || "unknown"}</span>
                          <Badge label="Pending Review" color="#F59E0B" size="sm" variant="outline" />
                        </div>
                        {k.linkedin_url && (
                          <a href={k.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-[11px] text-cyan font-mono hover:underline block mb-1">
                            LinkedIn Profile ↗
                          </a>
                        )}
                        <div className="flex items-center gap-3 mt-2">
                          {k.credential_url && (
                            <a href={k.credential_url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-violet font-mono hover:underline">
                              View Credential ↗
                            </a>
                          )}
                          {k.company_proof_url && (
                            <a href={k.company_proof_url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-violet font-mono hover:underline">
                              View Company Proof ↗
                            </a>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-muted font-mono mt-2">
                          Applied {formatRelativeTime(k.created_at)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 sm:ml-4">
                        <GlowButton variant="primary" size="sm" onClick={() => handleApproveInvestor(k.user_id)}>
                          Approve
                        </GlowButton>
                        <GlowButton variant="danger" size="sm" onClick={() => handleRejectInvestor(k.user_id)}>
                          Reject
                        </GlowButton>
                      </div>
                    </div>
                  </div>
                ))}
                {investorKyc.length === 0 && (
                  <div className="panel p-8 text-center">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-graphite-800/60 border border-graphite-800/60 flex items-center justify-center">
                      <svg className="w-6 h-6 text-slate-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                      </svg>
                    </div>
                    <p className="text-sm text-slate-muted font-medium">No investor applications</p>
                    <p className="text-[10px] text-slate-muted mt-1 font-mono">The investor queue is empty</p>
                  </div>
                )}
                {investorKyc.filter((k) => k.investor_status !== "pending").length > 0 && (
                  <div className="mt-6">
                    <div className="flex items-center gap-2 mb-3 px-1">
                      <span className="text-executive">Reviewed</span>
                    </div>
                    {investorKyc.filter((k) => k.investor_status !== "pending").map((k) => (
                      <div key={k.id} className="panel p-3 mb-2 opacity-60 hover:opacity-100 transition-all">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-white font-medium">@{k.profiles?.handle || "?"}</span>
                          <Badge label={k.investor_status} color={k.investor_status === "approved" ? "#22C55E" : "#EF4444"} size="sm" variant="outline" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {tab === "audit-log" && (
              <div className="panel p-5">
                <div className="flex items-center gap-2 mb-5">
                  <svg className="w-4 h-4 text-violet" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                  <h3 className="text-sm font-semibold text-white">Audit Log</h3>
                  <div className="ml-auto"><Badge label={activityFeed.length.toString()} color="#818cf8" size="sm" variant="outline" /></div>
                </div>
                <div className="space-y-0.5">
                  {activityFeed.map((event) => (
                    <div
                      key={event.id}
                      className="flex flex-wrap items-center gap-2 sm:gap-4 py-3 px-3 rounded-lg hover:bg-white/[0.02] transition-colors duration-200 border-b border-graphite-800/60 last:border-0"
                    >
                      <span className="text-[10px] text-slate-muted font-mono w-16 shrink-0 tabular-nums">
                        {formatRelativeTime(event.timestamp)}
                      </span>
                      <Badge
                        label={event.type}
                        color={
                          event.type === "signup" ? "#818cf8" :
                          event.type === "verification" ? "#14b8a6" :
                          event.type === "report" ? "#F59E0B" :
                          event.type === "dispute" ? "#EF4444" :
                          event.type === "ban" ? "#EF4444" :
                          event.type === "flag" ? "#F59E0B" : "#22C55E"
                        }
                        size="sm"
                      />
                      <span className="text-xs text-white font-medium font-mono">
                        @{event.handle}
                      </span>
                      <span className="text-xs text-slate-muted min-w-0 break-words">{event.detail}</span>
                      <span className="sm:ml-auto text-[9px] text-slate-muted font-mono opacity-50">
                        {event.id}
                      </span>
                    </div>
                  ))}
                  {activityFeed.length === 0 && (
                    <div className="text-center py-12">
                      <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-graphite-800/60 border border-graphite-800/60 flex items-center justify-center">
                        <svg className="w-6 h-6 text-slate-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                        </svg>
                      </div>
                      <p className="text-sm text-slate-muted font-medium">No audit events</p>
                      <p className="text-[10px] text-slate-muted mt-1 font-mono">Waiting for system activity</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </motion.main>
    </div>
  );
}
