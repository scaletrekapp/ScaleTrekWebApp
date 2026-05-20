"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { FeedTabs, SortPills, PostCard } from "@/components/feed";
import { SocialTicker } from "@/components/ui/SocialTicker";
import { LiveIndicator } from "@/components/ui/LiveIndicator";
import { SkeletonCard } from "@/components/ui/SkeletonCard";
import { AnimatedEmptyState } from "@/components/ui/AnimatedEmptyState";
import { ParticleField } from "@/components/ui/ParticleField";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { useRealtime } from "@/components/ui/useRealtime";
import { useFeedStore } from "@/stores/useFeedStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { useTranslation } from "react-i18next";
import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase-client";
import type { ShowcasePost } from "@/types";

export default function FeedPage({ params: { lang } }: { params: { lang: string } }) {
  const { t } = useTranslation();
  const { posts, setPosts, feedView, sortMode } = useFeedStore();
  const user = useAuthStore((s) => s.user);
  const [riskSlider, setRiskSlider] = useState(50);
  const [loading, setLoading] = useState(true);
  const [liveCount, setLiveCount] = useState(0);

  // Realtime: new posts appear live
  useRealtime("posts", "INSERT", (payload: any) => {
    const supabase = createClient();
    supabase
      .from("posts")
      .select(`*, user:user_id(*), media:post_media(*), likes:post_likes(count), signals:post_signals(count)`)
      .eq("id", payload.new.id)
      .single()
      .then(({ data }) => {
        if (data) {
          const p = data as any;
          const mapped: ShowcasePost = {
            id: p.id, userId: p.user_id,
            user: { id: p.user.id, handle: p.user.handle, avatar: p.user.avatar_url, role: p.user.role, verified: p.user.verified, realityScore: p.user.reality_score, momentumScore: p.user.momentum_score, joinedAt: p.user.created_at, headline: p.user.headline, isPro: p.user.is_pro },
            type: p.type, title: p.title, description: p.description || "", milestone: p.milestone || "", milestoneDate: p.milestone_date || p.created_at, riskLevel: p.risk_level, realityScore: p.reality_score,
            likes: p.likes?.[0]?.count ?? 0, comments: 0, signals: p.signals?.[0]?.count ?? 0, createdAt: p.created_at,
            media: (p.media || []).map((m: any) => ({ id: m.id, postId: p.id, url: m.url, type: m.type as "image" | "video", order: m.order })),
          };
          const current = useFeedStore.getState().posts;
          setPosts([mapped, ...current]);
          setLiveCount((c) => c + 1);
          setTimeout(() => setLiveCount(0), 3000);
        }
      });
  });

  useEffect(() => {
    const supabase = createClient();
    setLoading(true);

    supabase
      .from("posts")
      .select(`
        *,
        user:user_id(*),
        media:post_media(*),
        likes:post_likes(count),
        signals:post_signals(count)
      `)
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) {
          console.error("Failed to fetch posts:", error);
          setLoading(false);
          return;
        }
        if (data) {
          const mapped: ShowcasePost[] = data.map((p) => ({
            id: p.id,
            userId: p.user_id,
            user: {
              id: p.user.id,
              handle: p.user.handle,
              avatar: p.user.avatar_url,
              role: p.user.role,
              verified: p.user.verified,
              realityScore: p.user.reality_score,
              momentumScore: p.user.momentum_score,
              joinedAt: p.user.created_at,
              headline: p.user.headline,
              isPro: p.user.is_pro,
            },
            type: p.type,
            title: p.title,
            description: p.description || "",
            milestone: p.milestone || "",
            milestoneDate: p.milestone_date || p.created_at,
            riskLevel: p.risk_level,
            realityScore: p.reality_score,
            likes: p.likes?.[0]?.count ?? 0,
            comments: 0,
            signals: p.signals?.[0]?.count ?? 0,
            createdAt: p.created_at,
            media: (p.media || []).map((m: { id: string; url: string; type: string; order: number }) => ({
              id: m.id,
              postId: p.id,
              url: m.url,
              type: m.type as "image" | "video",
              order: m.order,
            })),
          }));
          setPosts(mapped);
        }
        setLoading(false);
      });
  }, [setPosts]);

  const filtered = posts.filter((p) => {
    if (feedView === "dreamer") return p.type === "dreamer";
    if (feedView === "reality") return p.type === "reality";
    return true;
  }).filter((p) => {
    const diff = Math.abs(p.riskLevel - riskSlider);
    return diff <= 35;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortMode === "top") {
      const scoreA = a.user.momentumScore + a.signals * 3 + a.likes * 0.5;
      const scoreB = b.user.momentumScore + b.signals * 3 + b.likes * 0.5;
      return scoreB - scoreA;
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div className="min-h-screen bg-graphite">
      <Navbar lang={lang} />
      <SocialTicker />
      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-3xl mx-auto px-4 py-8 relative"
      >
        <ParticleField count={8} color="#8B5CF6" />

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-white">{t("feed.explore")}</h1>
            {!loading && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-[10px] px-2 py-0.5 rounded-full bg-violet/10 text-violet font-semibold"
              >
                {sorted.length} {t("feed.posts")}
              </motion.span>
            )}
            {liveCount > 0 && (
              <motion.span
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className="text-[10px] px-2 py-0.5 rounded-full bg-green-500/10 text-green-500 font-semibold"
              >
                +{liveCount} new
              </motion.span>
            )}
          </div>
          <LiveIndicator compact />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.6 }}
        >
          <div className="panel p-4 mb-8 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-violet/5 via-transparent to-cyan/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet/20 to-cyan/20 flex items-center justify-center">
                  <svg className="w-4 h-4 text-violet" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
                  </svg>
                </div>
                <div>
                  <span className="text-sm font-semibold text-white">{t("feed.controlRoom")}</span>
                  <p className="text-[10px] text-muted">{t("feed.hint")}</p>
                </div>
              </div>
              <span className="text-xs text-muted font-mono">
                {sorted.length} {t("feed.matching")}
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-muted">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet animate-pulse-dot" />
                  {t("feed.highRiskDreamers")}
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan animate-pulse-dot" style={{ animationDelay: "0.5s" }} />
                  {t("feed.lowRiskReality")}
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={riskSlider}
                onChange={(e) => setRiskSlider(Number(e.target.value))}
                className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-gradient-to-r from-violet via-violet/50 to-cyan"
                style={{
                  accentColor: riskSlider < 40 ? "#8B5CF6" : riskSlider > 60 ? "#06B6D4" : "#8B5CF6",
                }}
              />
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-violet">{t("feed.blueprint")}</span>
                <span className="text-cyan">{t("feed.steel")}</span>
              </div>
            </div>
          </div>
        </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <div className="flex items-center justify-between mb-6">
            <FeedTabs />
            <SortPills />
          </div>
        </motion.div>

        {loading ? (
          <SkeletonCard variant="feed" count={3} />
        ) : sorted.length === 0 ? (
          <div className="panel p-4">
            <AnimatedEmptyState
              variant={feedView === "dreamer" ? "dreamer" : feedView === "reality" ? "reality" : "default"}
              title={t("feed.empty")}
              description="Adjust the risk slider or change your feed view to discover more opportunities."
              action={user ? { label: "Create Post", onClick: () => window.location.href = `/${lang}/create` } : undefined}
            />
          </div>
        ) : (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }}
            className="space-y-4"
          >
            <AnimatePresence mode="popLayout">
              {sorted.map((post) => (
                <motion.div
                  key={post.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                >
                  <PostCard post={post} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </motion.main>
    </div>
  );
}
