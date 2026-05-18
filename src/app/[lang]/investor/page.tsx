"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { GlassCard } from "@/components/ui/GlassCard";
import { Badge } from "@/components/ui/Badge";
import { GlowButton } from "@/components/ui/GlowButton";
import { KPI } from "@/components/ui/KPI";
import { TabBar } from "@/components/ui/TabBar";
import { Sparkline, MiniBar } from "@/components/ui/DataViz";
import { ExpandableSection } from "@/components/ui/ExpandableSection";
import { AnimatedGradient } from "@/components/ui/AnimatedGradient";
import { useAuthStore } from "@/stores/useAuthStore";
import { createClient } from "@/lib/supabase-client";
import { useTranslation } from "react-i18next";

type InvestorTab = "overview" | "pipeline" | "projects" | "analytics" | "watchlist" | "alerts";

interface ProfileData {
  id: string;
  handle: string;
  role: string;
  verified: boolean;
  verified_scale?: string;
  momentum_score: number;
  reality_score: number;
  headline?: string;
  location?: string;
  sector?: string;
  avatar?: string;
  created_at: string;
}

interface PostData {
  id: string;
  user_id: string;
  title: string;
  description: string;
  type: string;
  milestone: string;
  milestone_date?: string;
  momentum: number;
  risk_level?: number;
  reality_score?: string;
  likes?: number;
  comments?: number;
  signals?: number;
  tags?: string[];
  created_at: string;
  user?: ProfileData;
}

interface MilestoneData {
  id: string;
  user_id: string;
  title: string;
  description: string;
  date: string;
  type: string;
  status: string;
  created_at: string;
  user?: ProfileData;
}

interface WatchlistItem {
  id: string;
  user_id: string;
  post_id?: string;
  target_id?: string;
  created_at: string;
}

const TABS: { key: InvestorTab; label: string; icon: string }[] = [
  { key: "overview", label: "Overview", icon: "M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5" },
  { key: "pipeline", label: "Pipeline", icon: "M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" },
  { key: "projects", label: "Projects", icon: "M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" },
  { key: "analytics", label: "Analytics", icon: "M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" },
  { key: "watchlist", label: "Watchlist", icon: "M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" },
  { key: "alerts", label: "Alerts", icon: "M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" },
];

const REGIONS = ["Casablanca", "Rabat", "Marrakech", "Tangier", "Fes"] as const;
const SECTORS = ["tech", "agriculture", "manufacturing", "retail", "logistics"] as const;

const SECTOR_LABELS: Record<string, string> = {
  tech: "Technology",
  agriculture: "Agriculture",
  manufacturing: "Manufacturing",
  retail: "Retail",
  logistics: "Logistics",
};

const ALERT_TYPES = [
  { key: "high_momentum", label: "New high-momentum project" },
  { key: "verification", label: "Verification completed" },
  { key: "milestone", label: "Milestone reached" },
  { key: "funding", label: "Funding opportunity" },
] as const;

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-black/10 dark:bg-white/10 rounded-xl ${className}`} />;
}

function EmptyState({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <svg className="w-12 h-12 text-slate-muted/50 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}>
        <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
      </svg>
      <h3 className="text-sm font-semibold text-midnight dark:text-white mb-1">{title}</h3>
      <p className="text-xs text-slate-muted max-w-sm">{description}</p>
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <GlassCard variant="dark" className="text-center py-10">
      <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
        <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
        </svg>
      </div>
      <p className="text-sm text-slate-muted mb-4">{message}</p>
      <GlowButton variant="secondary" size="sm" onClick={onRetry}>Retry</GlowButton>
    </GlassCard>
  );
}

function MomentumDistribution({ scores }: { scores: number[] }) {
  const ranges = [
    { label: "0-20", color: "#EF4444" },
    { label: "21-40", color: "#F59E0B" },
    { label: "41-60", color: "#06B6D4" },
    { label: "61-80", color: "#8B5CF6" },
    { label: "81-100", color: "#22C55E" },
  ];
  const counts = ranges.map((r) => {
    const [low, high] = r.label.split("-").map(Number);
    return scores.filter((s) => s >= low && s <= high).length;
  });
  const max = Math.max(...counts, 1);
  return (
    <div className="space-y-2">
      {ranges.map((r, i) => (
        <div key={r.label} className="flex items-center gap-2">
          <span className="text-[10px] text-slate-muted w-12 shrink-0">{r.label}</span>
          <div className="flex-1 h-3 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
            <div className="h-full rounded-full transition-all duration-700" style={{ width: `${(counts[i] / max) * 100}%`, backgroundColor: r.color }} />
          </div>
          <span className="text-[10px] font-mono text-slate-muted w-6 text-right">{counts[i]}</span>
        </div>
      ))}
    </div>
  );
}

function HorizontalBarChart({ data, color = "#8B5CF6" }: { data: { label: string; value: number }[]; color?: string }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="space-y-2">
      {data.map((d) => (
        <div key={d.label} className="flex items-center gap-3">
          <span className="text-[10px] text-slate-muted w-24 shrink-0 truncate">{d.label}</span>
          <div className="flex-1 h-4 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden relative">
            <div className="h-full rounded-full transition-all duration-700" style={{ width: `${(d.value / max) * 100}%`, backgroundColor: color, opacity: 0.7 }} />
          </div>
          <span className="text-[10px] font-mono text-midnight dark:text-white w-8 text-right">{d.value}</span>
        </div>
      ))}
    </div>
  );
}

function RiskDistribution({ riskLevels }: { riskLevels: number[] }) {
  const categories = [
    { label: "Low (1-3)", color: "#22C55E", range: [1, 3] },
    { label: "Medium (4-6)", color: "#F59E0B", range: [4, 6] },
    { label: "High (7-10)", color: "#EF4444", range: [7, 10] },
  ];
  const counts = categories.map((c) => riskLevels.filter((r) => r >= c.range[0] && r <= c.range[1]).length);
  const total = counts.reduce((a, b) => a + b, 0) || 1;
  return (
    <div className="flex items-center gap-1 h-3 rounded-full overflow-hidden">
      {counts.map((c, i) => (
        <div key={categories[i].label} className="h-full transition-all duration-700" style={{ width: `${(c / total) * 100}%`, backgroundColor: categories[i].color }} title={`${categories[i].label}: ${c}`} />
      ))}
    </div>
  );
}

function ProjectCard({ post }: { post: PostData }) {
  const riskColor = !post.risk_level ? "#6B7280" : post.risk_level <= 3 ? "#22C55E" : post.risk_level <= 6 ? "#F59E0B" : "#EF4444";
  const riskLabel = !post.risk_level ? "N/A" : post.risk_level <= 3 ? "Low" : post.risk_level <= 6 ? "Medium" : "High";
  return (
    <GlassCard variant="dark" className="group hover:border-violet/30 transition-all duration-300">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet to-cyan flex items-center justify-center text-white font-bold text-xs">
            {post.user?.handle?.charAt(0).toUpperCase() || "?"}
          </div>
          <div>
            <p className="text-sm font-semibold text-midnight dark:text-white">@{post.user?.handle || "unknown"}</p>
            {post.user?.location && <p className="text-[10px] text-slate-muted">{post.user.location}</p>}
          </div>
        </div>
        <Badge label={post.type === "reality" ? "Reality Check" : "Dreamer"} color={post.type === "reality" ? "#06B6D4" : "#8B5CF6"} size="sm" variant="glow" />
      </div>
      <h4 className="text-sm font-semibold text-midnight dark:text-white mb-2 line-clamp-2">{post.title}</h4>
      <p className="text-[11px] text-slate-muted mb-3 line-clamp-2">{post.description}</p>
      <div className="space-y-2">
        <div className="flex items-center justify-between text-[10px]">
          <span className="text-slate-muted">Momentum</span>
          <span className="font-mono font-semibold text-midnight dark:text-white">{post.momentum ?? 0}</span>
        </div>
        <MiniBar value={post.momentum ?? 0} max={100} color="#8B5CF6" size="sm" />
      </div>
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-border">
        <Badge label={riskLabel} color={riskColor} size="sm" variant="outline" />
        {post.reality_score && (
          <Badge label={post.reality_score === "gold" ? "Gold" : "Platinum"} color={post.reality_score === "gold" ? "#F59E0B" : "#06B6D4"} size="sm" variant="default" />
        )}
      </div>
    </GlassCard>
  );
}

function MilestoneTimeline({ milestones }: { milestones: MilestoneData[] }) {
  if (milestones.length === 0) {
    return <p className="text-xs text-slate-muted text-center py-4">No milestones recorded yet.</p>;
  }
  const statusColor: Record<string, string> = {
    completed: "#22C55E",
    under_review: "#F59E0B",
    flagged: "#EF4444",
    resolved: "#06B6D4",
  };
  return (
    <div className="space-y-3">
      {milestones.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((m, i) => (
        <div key={m.id} className="flex gap-3">
          <div className="flex flex-col items-center">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: statusColor[m.status] || "#6B7280" }} />
            {i < milestones.length - 1 && <div className="w-px flex-1 bg-slate-border my-1" />}
          </div>
          <div className="flex-1 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-midnight dark:text-white">{m.title}</span>
              <Badge label={m.status} color={statusColor[m.status] || "#6B7280"} size="sm" variant="outline" />
            </div>
            {m.description && <p className="text-[10px] text-slate-muted mt-0.5">{m.description}</p>}
            <p className="text-[9px] text-slate-muted mt-0.5">{new Date(m.date).toLocaleDateString()}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function InvestorPage({ params: { lang } }: { params: { lang: string } }) {
  const { t } = useTranslation();
  const router = useRouter();
  const authUser = useAuthStore((s) => s.user);
  const isAuthorized = authUser?.role === "investor" || authUser?.role === "admin" || authUser?.role === "super_admin";

  const [tab, setTab] = useState<InvestorTab>("overview");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [profiles, setProfiles] = useState<ProfileData[]>([]);
  const [posts, setPosts] = useState<PostData[]>([]);
  const [milestones, setMilestones] = useState<MilestoneData[]>([]);
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [watchlistPosts, setWatchlistPosts] = useState<PostData[]>([]);
  const [watchlistProfiles, setWatchlistProfiles] = useState<ProfileData[]>([]);

  const [pipelineSearch, setPipelineSearch] = useState("");
  const [pipelineFilter, setPipelineFilter] = useState<string>("all");
  const [pipelineSort, setPipelineSort] = useState<string>("momentum");
  const [pipelinePage, setPipelinePage] = useState(1);
  const PIPELINE_PAGE_SIZE = 8;

  const [alertToggles, setAlertToggles] = useState<Record<string, boolean>>({
    high_momentum: true,
    verification: true,
    milestone: true,
    funding: false,
  });

  const [lastUpdated, setLastUpdated] = useState<string>("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    const supabase = createClient();

    try {
      const { data: pData } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
      if (pData) setProfiles(pData as ProfileData[]);
    } catch { /* table may not exist */ }

    try {
      const { data: postData } = await supabase
        .from("showcase_posts")
        .select("*, user:profiles!showcase_posts_user_id_fkey(*)")
        .order("created_at", { ascending: false });
      if (postData) setPosts(postData as unknown as PostData[]);
    } catch {
      try {
        const { data: postData } = await supabase
          .from("posts")
          .select("*, user:profiles!posts_user_id_fkey(*)")
          .order("created_at", { ascending: false });
        if (postData) setPosts(postData as unknown as PostData[]);
      } catch { /* table may not exist */ }
    }

    try {
      const { data: mData } = await supabase
        .from("milestones")
        .select("*, user:profiles!milestones_user_id_fkey(*)")
        .order("date", { ascending: false });
      if (mData) setMilestones(mData as unknown as MilestoneData[]);
    } catch { /* table may not exist */ }

    try {
      const { data: wData } = await supabase
        .from("watchlist")
        .select("*")
        .eq("user_id", authUser?.id || "")
        .order("created_at", { ascending: false });
      if (wData) setWatchlist(wData as WatchlistItem[]);
    } catch {
      try {
        const { data: fData } = await supabase
          .from("follows")
          .select("*")
          .eq("follower_id", authUser?.id || "")
          .order("created_at", { ascending: false });
        if (fData) setWatchlist(fData as WatchlistItem[]);
      } catch { /* table may not exist */ }
    }

    setLastUpdated(new Date().toLocaleTimeString());
    setLoading(false);
  }, [authUser?.id]);

  useEffect(() => {
    if (!authUser) return;
    if (!isAuthorized) { setLoading(false); return; }
    fetchData();
  }, [authUser, isAuthorized, fetchData]);

  useEffect(() => {
    if (watchlist.length === 0) return;
    const supabase = createClient();
    const postIds = watchlist.map((w) => w.post_id).filter(Boolean) as string[];
    const targetIds = watchlist.map((w) => w.target_id).filter(Boolean) as string[];
    const allIds = Array.from(new Set([...postIds, ...targetIds]));
    if (allIds.length === 0) return;

    (async () => {
      try {
        const { data: pData } = await supabase
          .from("showcase_posts")
          .select("*, user:profiles!showcase_posts_user_id_fkey(*)")
          .in("id", allIds);
        if (pData) setWatchlistPosts(pData as unknown as PostData[]);
      } catch {
        try {
          const { data: pData } = await supabase
            .from("posts")
            .select("*, user:profiles!posts_user_id_fkey(*)")
            .in("id", allIds);
          if (pData) setWatchlistPosts(pData as unknown as PostData[]);
        } catch { /* skip */ }
      }

      try {
        const { data: prData } = await supabase
          .from("profiles")
          .select("*")
          .in("id", allIds);
        if (prData) setWatchlistProfiles(prData as ProfileData[]);
      } catch { /* skip */ }
    })();
  }, [watchlist]);

  const handleRemoveWatchlist = async (itemId: string) => {
    const supabase = createClient();
    try {
      await supabase.from("watchlist").delete().eq("id", itemId);
    } catch {
      try {
        await supabase.from("follows").delete().eq("id", itemId);
      } catch { /* skip */ }
    }
    setWatchlist((prev) => prev.filter((w) => w.id !== itemId));
  };

  const handleAddWatchlist = async (postId: string) => {
    const supabase = createClient();
    try {
      const { data } = await supabase
        .from("watchlist")
        .insert({ user_id: authUser?.id, post_id: postId })
        .select()
        .single();
      if (data) setWatchlist((prev) => [data as WatchlistItem, ...prev]);
    } catch {
      try {
        const { data } = await supabase
          .from("follows")
          .insert({ follower_id: authUser?.id, following_id: postId })
          .select()
          .single();
        if (data) setWatchlist((prev) => [data as WatchlistItem, ...prev]);
      } catch { /* skip */ }
    }
  };

  const dreamers = useMemo(() => profiles.filter((p) => p.role === "dreamer"), [profiles]);
  const investors = useMemo(() => profiles.filter((p) => p.role === "investor"), [profiles]);
  const verifiedReality = useMemo(() => profiles.filter((p) => (p.role === "reality" || p.role === "dreamer") && p.verified), [profiles]);
  const avgMomentum = useMemo(() => {
    if (dreamers.length === 0) return 0;
    return Math.round(dreamers.reduce((s, p) => s + (p.momentum_score || 0), 0) / dreamers.length);
  }, [dreamers]);
  const newUsers30d = useMemo(() => {
    const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    return profiles.filter((p) => new Date(p.created_at) > cutoff).length;
  }, [profiles]);

  const topOpportunities = useMemo(() => {
    return [...posts].sort((a, b) => (b.momentum || 0) - (a.momentum || 0)).slice(0, 4);
  }, [posts]);

  const recentActivity = useMemo(() => {
    const activities: { id: string; type: string; text: string; time: Date; color: string }[] = [];
    profiles.slice(0, 5).forEach((p) => {
      activities.push({
        id: `signup-${p.id}`,
        type: "signup",
        text: `@${p.handle} joined as ${p.role}`,
        time: new Date(p.created_at),
        color: "#8B5CF6",
      });
    });
    posts.slice(0, 3).forEach((p) => {
      activities.push({
        id: `post-${p.id}`,
        type: "post",
        text: `@${p.user?.handle} posted "${p.title.slice(0, 40)}${p.title.length > 40 ? "..." : ""}"`,
        time: new Date(p.created_at),
        color: "#06B6D4",
      });
    });
    milestones.slice(0, 3).forEach((m) => {
      activities.push({
        id: `milestone-${m.id}`,
        type: "milestone",
        text: `@${m.user?.handle} completed milestone "${m.title.slice(0, 30)}${m.title.length > 30 ? "..." : ""}"`,
        time: new Date(m.date),
        color: "#22C55E",
      });
    });
    return activities.sort((a, b) => b.time.getTime() - a.time.getTime()).slice(0, 10);
  }, [profiles, posts, milestones]);

  const filteredPipeline = useMemo(() => {
    let result = [...posts];
    if (pipelineSearch) {
      const q = pipelineSearch.toLowerCase();
      result = result.filter(
        (p) =>
          p.title?.toLowerCase().includes(q) ||
          p.user?.handle?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q)
      );
    }
    if (pipelineFilter !== "all") {
      result = result.filter((p) => p.type === pipelineFilter);
    }
    switch (pipelineSort) {
      case "momentum":
        result.sort((a, b) => (b.momentum || 0) - (a.momentum || 0));
        break;
      case "newest":
        result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case "risk":
        result.sort((a, b) => (a.risk_level || 5) - (b.risk_level || 5));
        break;
    }
    return result;
  }, [posts, pipelineSearch, pipelineFilter, pipelineSort]);

  const paginatedPipeline = useMemo(() => {
    return filteredPipeline.slice(0, pipelinePage * PIPELINE_PAGE_SIZE);
  }, [filteredPipeline, pipelinePage]);

  const allMomentumScores = useMemo(() => dreamers.map((p) => p.momentum_score || 0), [dreamers]);
  const allRiskLevels = useMemo(() => posts.map((p) => p.risk_level || 3), [posts]);

  const regionData = useMemo(() => {
    return REGIONS.map((r) => ({
      label: r,
      value: profiles.filter((p) => p.location?.toLowerCase() === r.toLowerCase()).length,
    }));
  }, [profiles]);

  const sectorData = useMemo(() => {
    return SECTORS.map((s) => ({
      label: SECTOR_LABELS[s] || s,
      value: profiles.filter((p) => p.sector === s).length,
    }));
  }, [profiles]);

  const notInWatchlist = useCallback(
    (postId: string) => !watchlist.some((w) => w.post_id === postId || w.target_id === postId),
    [watchlist]
  );

  if (!authUser) {
    return (
      <div className="min-h-screen bg-white dark:bg-midnight">
        <AnimatedGradient />
        <Navbar lang={lang} />
        <main className="max-w-3xl mx-auto px-4 py-20 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-slate-muted/10 border border-slate-border flex items-center justify-center">
            <svg className="w-8 h-8 text-slate-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-midnight dark:text-white mb-2">Sign in required</h1>
          <p className="text-sm text-slate-muted">Please sign in to access the Investor Control Room.</p>
        </main>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-white dark:bg-midnight">
        <AnimatedGradient />
        <Navbar lang={lang} />
        <main className="max-w-3xl mx-auto px-4 py-20 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-red-500/15 border border-red-500/20 flex items-center justify-center">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-midnight dark:text-white mb-2">Access Denied</h1>
          <p className="text-sm text-slate-muted">This dashboard is only available to investors and administrators.</p>
          <GlowButton variant="primary" size="sm" className="mt-4" onClick={() => router.push(`/${lang}/feed`)}>
            Go to Feed
          </GlowButton>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-midnight">
      <AnimatedGradient />
      <Navbar lang={lang} />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet/15 dark:bg-violet/15 border border-violet/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-violet" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-midnight dark:text-white font-mono tracking-tight">Investor Control Room</h1>
              <p className="text-xs text-slate-muted">Institutional-grade discovery & analytics terminal</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-[10px] text-slate-muted">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Last updated: {lastUpdated || "—"}
            </div>
            <GlowButton variant="primary" size="sm" onClick={() => {}}>
              <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              Export Report
            </GlowButton>
          </div>
        </div>

        {loading ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-28" />
              ))}
            </div>
            <Skeleton className="h-10 mb-8" />
            <div className="grid sm:grid-cols-2 gap-6">
              <Skeleton className="h-64" />
              <Skeleton className="h-64" />
            </div>
          </>
        ) : error ? (
          <ErrorState message={error} onRetry={fetchData} />
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
              <KPI
                label="Total Opportunities"
                value={posts.length.toString()}
                sub={`${posts.filter((p) => p.type === "reality").length} reality checks`}
                color="#8B5CF6"
                icon={
                  <svg className="w-4 h-4 text-violet" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0l-3-3m3 3l3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                  </svg>
                }
              />
              <KPI
                label="Active Dreamers"
                value={dreamers.length.toString()}
                sub={`${Math.round((dreamers.length / Math.max(profiles.length, 1)) * 100)}% of total users`}
                color="#06B6D4"
                icon={
                  <svg className="w-4 h-4 text-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                  </svg>
                }
              />
              <KPI
                label="Verified Reality Checks"
                value={verifiedReality.length.toString()}
                sub={`${verifiedReality.filter((p) => p.verified_scale === "elite").length} elite verified`}
                color="#22C55E"
                icon={
                  <svg className="w-4 h-4 text-green" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                  </svg>
                }
              />
              <KPI
                label="Avg Momentum Score"
                value={avgMomentum.toString()}
                sub={`across ${dreamers.length} dreamers`}
                color="#F59E0B"
                icon={
                  <svg className="w-4 h-4 text-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                  </svg>
                }
              />
              <KPI
                label="Network Growth"
                value={newUsers30d.toString()}
                sub="new users (30 days)"
                color="#06B6D4"
                icon={
                  <svg className="w-4 h-4 text-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
                  </svg>
                }
              />
            </div>

            <div className="mb-8">
              <TabBar tabs={TABS} active={tab} onChange={(k) => setTab(k as InvestorTab)} />
            </div>

            {tab === "overview" && (
              <div className="space-y-8">
                <div className="grid lg:grid-cols-2 gap-6">
                  <GlassCard variant="dark">
                    <h3 className="text-sm font-bold text-midnight dark:text-white mb-4 flex items-center gap-2">
                      <svg className="w-4 h-4 text-violet" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5" />
                      </svg>
                      Ecosystem Overview
                    </h3>
                    <div className="space-y-4">
                      <div className="flex justify-between py-2 border-b border-slate-border">
                        <span className="text-xs text-slate-muted">Dreamers / Investors</span>
                        <span className="text-xs font-semibold text-midnight dark:text-white font-mono">
                          {dreamers.length} / {investors.length}
                        </span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-slate-border">
                        <span className="text-xs text-slate-muted">Total Verified</span>
                        <span className="text-xs font-semibold text-midnight dark:text-white font-mono">
                          {profiles.filter((p) => p.verified).length}
                        </span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-slate-border">
                        <span className="text-xs text-slate-muted">Elite Verified</span>
                        <span className="text-xs font-semibold text-midnight dark:text-white font-mono">
                          {profiles.filter((p) => p.verified_scale === "elite").length}
                        </span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-slate-border">
                        <span className="text-xs text-slate-muted">Total Milestones</span>
                        <span className="text-xs font-semibold text-midnight dark:text-white font-mono">{milestones.length}</span>
                      </div>
                      <div className="pt-3">
                        <p className="text-[10px] font-semibold text-slate-muted uppercase tracking-wider mb-3">Momentum Distribution</p>
                        <MomentumDistribution scores={allMomentumScores} />
                      </div>
                    </div>
                  </GlassCard>

                  <GlassCard variant="dark">
                    <h3 className="text-sm font-bold text-midnight dark:text-white mb-4 flex items-center gap-2">
                      <svg className="w-4 h-4 text-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Recent Activity
                    </h3>
                    {recentActivity.length === 0 ? (
                      <EmptyState
                        icon="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                        title="No recent activity"
                        description="Activity feed will populate as users join and create content."
                      />
                    ) : (
                      <div className="space-y-1">
                        {recentActivity.map((a) => (
                          <div key={a.id} className="flex items-start gap-3 py-2 border-b border-slate-border last:border-0">
                            <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: a.color }} />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-midnight dark:text-white">{a.text}</p>
                              <p className="text-[9px] text-slate-muted mt-0.5">{a.time.toLocaleDateString()} {a.time.toLocaleTimeString()}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </GlassCard>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-midnight dark:text-white mb-4 flex items-center gap-2">
                    <svg className="w-4 h-4 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                    </svg>
                    Top Opportunities
                  </h3>
                  {topOpportunities.length === 0 ? (
                    <EmptyState
                      icon="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5"
                      title="No opportunities yet"
                      description="Posts with momentum data will appear here once dreamers start creating content."
                    />
                  ) : (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {topOpportunities.map((post) => (
                        <div key={post.id} className="relative">
                          <ProjectCard post={post} />
                          {notInWatchlist(post.id) && (
                            <button
                              onClick={() => handleAddWatchlist(post.id)}
                              className="absolute top-2 right-2 w-6 h-6 rounded-lg bg-black/50 hover:bg-violet/80 text-white flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100"
                              title="Add to watchlist"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                              </svg>
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {tab === "pipeline" && (
              <div className="space-y-6">
                <GlassCard variant="dark" className="sticky top-20 z-30">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    <div className="relative flex-1 w-full">
                      <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                      </svg>
                      <input
                        type="text"
                        value={pipelineSearch}
                        onChange={(e) => { setPipelineSearch(e.target.value); setPipelinePage(1); }}
                        placeholder="Search by handle, title, or description..."
                        className="w-full pl-9 pr-3 py-2 rounded-lg bg-black/5 dark:bg-white/5 border border-slate-border text-sm text-midnight dark:text-white focus:outline-none focus:ring-2 focus:ring-violet/40 placeholder:text-slate-muted"
                      />
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <select
                        value={pipelineFilter}
                        onChange={(e) => { setPipelineFilter(e.target.value); setPipelinePage(1); }}
                        className="px-3 py-2 rounded-lg bg-black/5 dark:bg-white/5 border border-slate-border text-xs text-midnight dark:text-white focus:outline-none focus:ring-2 focus:ring-violet/40"
                      >
                        <option value="all">All Types</option>
                        <option value="dreamer">Dreamer</option>
                        <option value="reality">Reality Check</option>
                      </select>
                      <select
                        value={pipelineSort}
                        onChange={(e) => setPipelineSort(e.target.value)}
                        className="px-3 py-2 rounded-lg bg-black/5 dark:bg-white/5 border border-slate-border text-xs text-midnight dark:text-white focus:outline-none focus:ring-2 focus:ring-violet/40"
                      >
                        <option value="momentum">Sort: Momentum</option>
                        <option value="newest">Sort: Newest</option>
                        <option value="risk">Sort: Risk (low)</option>
                      </select>
                    </div>
                  </div>
                </GlassCard>

                {paginatedPipeline.length === 0 ? (
                  <EmptyState
                    icon="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75"
                    title="No opportunities found"
                    description={pipelineSearch ? "Try adjusting your search or filters." : "No posts have been created yet."}
                  />
                ) : (
                  <>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {paginatedPipeline.map((post) => (
                        <div key={post.id} className="relative group">
                          <ProjectCard post={post} />
                          {notInWatchlist(post.id) && (
                            <button
                              onClick={() => handleAddWatchlist(post.id)}
                              className="absolute top-2 right-2 w-7 h-7 rounded-lg bg-black/50 hover:bg-violet text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                              title="Add to watchlist"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                              </svg>
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    {paginatedPipeline.length < filteredPipeline.length && (
                      <div className="flex justify-center pt-6">
                        <GlowButton variant="secondary" size="md" onClick={() => setPipelinePage((p) => p + 1)}>
                          Load More ({filteredPipeline.length - paginatedPipeline.length} remaining)
                        </GlowButton>
                      </div>
                    )}
                    <div className="text-center text-[10px] text-slate-muted pt-2">
                      Showing {paginatedPipeline.length} of {filteredPipeline.length} opportunities
                    </div>
                  </>
                )}
              </div>
            )}

            {tab === "projects" && (
              <div className="space-y-6">
                {posts.length === 0 ? (
                  <EmptyState
                    icon="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z"
                    title="No projects yet"
                    description="Projects will appear here once dreamers start posting milestones."
                  />
                ) : (
                  posts.map((post) => {
                    const postMilestones = milestones.filter((m) => m.user_id === post.user_id);
                    return (
                      <ExpandableSection
                        key={post.id}
                        title={
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet to-cyan flex items-center justify-center text-white font-bold text-xs shrink-0">
                              {post.user?.handle?.charAt(0).toUpperCase() || "?"}
                            </div>
                            <div className="flex-1 min-w-0 text-left">
                              <p className="text-sm font-semibold text-midnight dark:text-white truncate">@{post.user?.handle} — {post.title}</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <Badge label={post.type} color={post.type === "reality" ? "#06B6D4" : "#8B5CF6"} size="sm" variant="outline" />
                                <span className="text-[10px] text-slate-muted">Momentum: {post.momentum ?? 0}</span>
                              </div>
                            </div>
                          </div>
                        }
                      >
                        <div className="grid lg:grid-cols-2 gap-6 pt-2">
                          <div className="space-y-4">
                            <div>
                              <p className="text-xs font-semibold text-midnight dark:text-white mb-2">Description</p>
                              <p className="text-xs text-slate-muted leading-relaxed">{post.description || "No description provided."}</p>
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-midnight dark:text-white mb-2">Milestone</p>
                              <p className="text-xs text-slate-muted">{post.milestone || "No milestone specified."}</p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {post.tags?.map((tag) => (
                                <Badge key={tag} label={tag} color="#6B7280" size="sm" variant="default" />
                              ))}
                            </div>
                          </div>
                          <div className="space-y-4">
                            <div>
                              <p className="text-xs font-semibold text-midnight dark:text-white mb-2">Progress Metrics</p>
                              <div className="space-y-3">
                                <div>
                                  <div className="flex justify-between text-[10px] mb-1">
                                    <span className="text-slate-muted">Momentum Score</span>
                                    <span className="font-mono text-midnight dark:text-white">{post.momentum ?? 0}%</span>
                                  </div>
                                  <MiniBar value={post.momentum ?? 0} max={100} color={post.momentum >= 70 ? "#22C55E" : post.momentum >= 40 ? "#F59E0B" : "#8B5CF6"} size="md" />
                                </div>
                                {post.reality_score && (
                                  <div>
                                    <div className="flex justify-between text-[10px] mb-1">
                                      <span className="text-slate-muted">Reality Score</span>
                                      <Badge label={post.reality_score === "gold" ? "Gold" : "Platinum"} color={post.reality_score === "gold" ? "#F59E0B" : "#06B6D4"} size="sm" variant="glow" />
                                    </div>
                                  </div>
                                )}
                                {post.risk_level && (
                                  <div>
                                    <div className="flex justify-between text-[10px] mb-1">
                                      <span className="text-slate-muted">Risk Level</span>
                                      <span className="font-mono text-midnight dark:text-white">{post.risk_level}/10</span>
                                    </div>
                                    <MiniBar value={post.risk_level} max={10} color={post.risk_level <= 3 ? "#22C55E" : post.risk_level <= 6 ? "#F59E0B" : "#EF4444"} size="md" />
                                  </div>
                                )}
                              </div>
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-midnight dark:text-white mb-2">
                                Milestone Timeline ({postMilestones.length})
                              </p>
                              <MilestoneTimeline milestones={postMilestones} />
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-border">
                          {notInWatchlist(post.id) ? (
                            <GlowButton variant="secondary" size="sm" onClick={() => handleAddWatchlist(post.id)}>
                              <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                              </svg>
                              Add to Watchlist
                            </GlowButton>
                          ) : (
                            <Badge label="In Watchlist" color="#8B5CF6" size="sm" variant="glow" />
                          )}
                          <div className="flex items-center gap-2 ml-auto">
                            <span className="text-[10px] text-slate-muted">Created {new Date(post.created_at).toLocaleDateString()}</span>
                            {post.milestone_date && (
                              <span className="text-[10px] text-slate-muted">Milestone: {new Date(post.milestone_date).toLocaleDateString()}</span>
                            )}
                          </div>
                        </div>
                      </ExpandableSection>
                    );
                  })
                )}
              </div>
            )}

            {tab === "analytics" && (
              <div className="space-y-6">
                <div className="grid lg:grid-cols-2 gap-6">
                  <GlassCard variant="dark">
                    <h3 className="text-sm font-bold text-midnight dark:text-white mb-4 flex items-center gap-2">
                      <svg className="w-4 h-4 text-violet" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
                      </svg>
                      Regional Breakdown
                    </h3>
                    {regionData.every((d) => d.value === 0) ? (
                      <EmptyState icon="M9 6.75V15m6-6v8.25" title="No regional data" description="Users haven't set their locations yet." />
                    ) : (
                      <HorizontalBarChart data={regionData} color="#8B5CF6" />
                    )}
                  </GlassCard>

                  <GlassCard variant="dark">
                    <h3 className="text-sm font-bold text-midnight dark:text-white mb-4 flex items-center gap-2">
                      <svg className="w-4 h-4 text-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0l-3-3m3 3l3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                      </svg>
                      Sector Breakdown
                    </h3>
                    {sectorData.every((d) => d.value === 0) ? (
                      <EmptyState icon="M20.25 7.5l-.625 10.632" title="No sector data" description="Users haven't set their sectors yet." />
                    ) : (
                      <HorizontalBarChart data={sectorData} color="#06B6D4" />
                    )}
                  </GlassCard>
                </div>

                <div className="grid lg:grid-cols-2 gap-6">
                  <GlassCard variant="dark">
                    <h3 className="text-sm font-bold text-midnight dark:text-white mb-4 flex items-center gap-2">
                      <svg className="w-4 h-4 text-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                      </svg>
                      Risk Distribution
                    </h3>
                    {posts.length === 0 ? (
                      <EmptyState icon="M12 9v3.75m9-.75a9 9 0 11-18 0" title="No risk data" description="Posts with risk levels will appear here." />
                    ) : (
                      <div className="space-y-4">
                        <RiskDistribution riskLevels={allRiskLevels} />
                        <div className="flex items-center justify-around text-[10px] text-slate-muted pt-2">
                          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green" /> Low (1-3)</span>
                          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange" /> Medium (4-6)</span>
                          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red" /> High (7-10)</span>
                        </div>
                        <div className="pt-2 space-y-1">
                          {(() => {
                            const low = allRiskLevels.filter((r) => r <= 3).length;
                            const med = allRiskLevels.filter((r) => r >= 4 && r <= 6).length;
                            const high = allRiskLevels.filter((r) => r >= 7).length;
                            const total = allRiskLevels.length || 1;
                            return (
                              <>
                                <div className="flex justify-between text-[10px]">
                                  <span className="text-slate-muted">Low Risk</span>
                                  <span className="font-mono text-midnight dark:text-white">{low} ({Math.round((low / total) * 100)}%)</span>
                                </div>
                                <div className="flex justify-between text-[10px]">
                                  <span className="text-slate-muted">Medium Risk</span>
                                  <span className="font-mono text-midnight dark:text-white">{med} ({Math.round((med / total) * 100)}%)</span>
                                </div>
                                <div className="flex justify-between text-[10px]">
                                  <span className="text-slate-muted">High Risk</span>
                                  <span className="font-mono text-midnight dark:text-white">{high} ({Math.round((high / total) * 100)}%)</span>
                                </div>
                              </>
                            );
                          })()}
                        </div>
                      </div>
                    )}
                  </GlassCard>

                  <GlassCard variant="dark">
                    <h3 className="text-sm font-bold text-midnight dark:text-white mb-4 flex items-center gap-2">
                      <svg className="w-4 h-4 text-green" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5" />
                      </svg>
                      Momentum Score Distribution
                    </h3>
                    {allMomentumScores.length === 0 ? (
                      <EmptyState icon="M3.75 3v11.25" title="No momentum data" description="Momentum scores will appear once dreamers are active." />
                    ) : (
                      <MomentumDistribution scores={allMomentumScores} />
                    )}
                  </GlassCard>
                </div>
              </div>
            )}

            {tab === "watchlist" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-slate-muted">
                    {watchlist.length} {watchlist.length === 1 ? "item" : "items"} tracked
                  </p>
                </div>
                {watchlist.length === 0 ? (
                  <EmptyState
                    icon="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z"
                    title="Your watchlist is empty"
                    description="Add opportunities to your watchlist from the Pipeline or Overview tabs to track them here."
                  />
                ) : (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {watchlist.map((item) => {
                      const matchedPost = watchlistPosts.find(
                        (p) => p.id === item.post_id || p.id === item.target_id
                      );
                      const matchedProfile = watchlistProfiles.find(
                        (p) => p.id === item.post_id || p.id === item.target_id
                      );
                      const display = matchedPost || matchedProfile;
                      return (
                        <GlassCard key={item.id} variant="dark" className="group">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet to-cyan flex items-center justify-center text-white font-bold text-xs">
                                {display && "handle" in display
                                  ? display.handle?.charAt(0).toUpperCase()
                                  : matchedPost?.user?.handle?.charAt(0).toUpperCase() || "?"}
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-midnight dark:text-white">
                                  {display && "handle" in display
                                    ? `@${display.handle}`
                                    : matchedPost ? `@${matchedPost.user?.handle}` : "Unknown"}
                                </p>
                                <p className="text-[10px] text-slate-muted">
                                  Added {new Date(item.created_at).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => handleRemoveWatchlist(item.id)}
                              className="w-7 h-7 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100"
                              title="Remove from watchlist"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                          {matchedPost ? (
                            <>
                              <h4 className="text-xs font-semibold text-midnight dark:text-white mb-2 line-clamp-2">{matchedPost.title}</h4>
                              <div className="space-y-2">
                                <div className="flex justify-between text-[10px]">
                                  <span className="text-slate-muted">Momentum</span>
                                  <span className="font-mono text-midnight dark:text-white">{matchedPost.momentum ?? 0}</span>
                                </div>
                                <MiniBar value={matchedPost.momentum ?? 0} max={100} color="#8B5CF6" size="sm" />
                                <div className="flex items-center gap-2 pt-2">
                                  <Badge label={matchedPost.type} color={matchedPost.type === "reality" ? "#06B6D4" : "#8B5CF6"} size="sm" variant="outline" />
                                  {matchedPost.milestone && (
                                    <Badge label={matchedPost.milestone} color="#6B7280" size="sm" variant="default" />
                                  )}
                                </div>
                              </div>
                            </>
                          ) : matchedProfile ? (
                            <div className="space-y-2">
                              {matchedProfile.headline && (
                                <p className="text-xs text-slate-muted">{matchedProfile.headline}</p>
                              )}
                              <div className="flex items-center gap-2">
                                <Badge label={matchedProfile.role} color="#8B5CF6" size="sm" variant="outline" />
                                {matchedProfile.verified && (
                                  <Badge label="Verified" color="#22C55E" size="sm" variant="default" />
                                )}
                              </div>
                              {matchedProfile.location && (
                                <p className="text-[10px] text-slate-muted">📍 {matchedProfile.location}</p>
                              )}
                            </div>
                          ) : (
                            <p className="text-xs text-slate-muted">Item no longer available.</p>
                          )}
                        </GlassCard>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {tab === "alerts" && (
              <div className="space-y-6">
                <GlassCard variant="dark">
                  <h3 className="text-sm font-bold text-midnight dark:text-white mb-4 flex items-center gap-2">
                    <svg className="w-4 h-4 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                    </svg>
                    Alert Preferences
                  </h3>
                  <div className="space-y-3">
                    {ALERT_TYPES.map((alert) => (
                      <div key={alert.key} className="flex items-center justify-between py-3 px-3 rounded-xl bg-black/5 dark:bg-white/5">
                        <span className="text-xs font-medium text-midnight dark:text-white">{alert.label}</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={alertToggles[alert.key]}
                            onChange={() => setAlertToggles((prev) => ({ ...prev, [alert.key]: !prev[alert.key] }))}
                          />
                          <div className="w-9 h-5 rounded-full bg-slate-border peer-checked:bg-violet peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all" />
                        </label>
                      </div>
                    ))}
                  </div>
                </GlassCard>

                <GlassCard variant="dark">
                  <h3 className="text-sm font-bold text-midnight dark:text-white mb-4 flex items-center gap-2">
                    <svg className="w-4 h-4 text-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Recent Alerts
                  </h3>
                  {posts.length === 0 && milestones.length === 0 ? (
                    <EmptyState
                      icon="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
                      title="No recent alerts"
                      description="Alerts will appear when high-momentum projects are created, verifications happen, or milestones are reached."
                    />
                  ) : (
                    <div className="space-y-1">
                      {posts.filter((p) => (p.momentum || 0) >= 70).slice(0, 4).map((p) => (
                        <div key={`hm-${p.id}`} className="flex items-start gap-3 py-2.5 border-b border-slate-border last:border-0">
                          <div className="w-2 h-2 rounded-full mt-1.5 bg-green shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-midnight dark:text-white">
                              <span className="font-semibold">New high-momentum project</span> — @{p.user?.handle}: {p.title.slice(0, 50)}{p.title.length > 50 ? "..." : ""}
                            </p>
                            <p className="text-[9px] text-slate-muted mt-0.5">
                              Momentum: {p.momentum} — {new Date(p.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge label="HIGH" color="#22C55E" size="sm" variant="glow" />
                        </div>
                      ))}
                      {profiles.filter((p) => p.verified).slice(0, 3).map((p) => (
                        <div key={`v-${p.id}`} className="flex items-start gap-3 py-2.5 border-b border-slate-border last:border-0">
                          <div className="w-2 h-2 rounded-full mt-1.5 bg-cyan shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-midnight dark:text-white">
                              <span className="font-semibold">Verification completed</span> — @{p.handle} verified as {p.verified_scale || "verified"}
                            </p>
                            <p className="text-[9px] text-slate-muted mt-0.5">{new Date(p.created_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                      ))}
                      {milestones.filter((m) => m.status === "completed").slice(0, 3).map((m) => (
                        <div key={`ms-${m.id}`} className="flex items-start gap-3 py-2.5 border-b border-slate-border last:border-0">
                          <div className="w-2 h-2 rounded-full mt-1.5 bg-violet shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-midnight dark:text-white">
                              <span className="font-semibold">Milestone reached</span> — @{m.user?.handle}: {m.title}
                            </p>
                            <p className="text-[9px] text-slate-muted mt-0.5">{new Date(m.date).toLocaleDateString()}</p>
                          </div>
                        </div>
                      ))}
                      {posts.length === 0 && milestones.length > 0 && profiles.filter((p) => p.verified).length === 0 && (
                        <EmptyState
                          icon="M12 6v6h4.5m4.5 0a9 9 0 11-18 0"
                          title="No matching alerts"
                          description="Enable alert types above to see matching events."
                        />
                      )}
                    </div>
                  )}
                </GlassCard>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
