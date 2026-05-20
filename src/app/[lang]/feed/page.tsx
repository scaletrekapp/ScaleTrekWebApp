"use client";

import { motion, AnimatePresence } from "framer-motion";
import { FeedTabs, SortPills, FounderCard } from "@/components/feed";
import { SocialTicker } from "@/components/ui/SocialTicker";
import { LiveIndicator } from "@/components/ui/LiveIndicator";
import { SkeletonCard } from "@/components/ui/SkeletonCard";
import { AnimatedEmptyState } from "@/components/ui/AnimatedEmptyState";
import { ParticleField } from "@/components/ui/ParticleField";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { MomentumStories } from "@/components/feed/MomentumStories";
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
      verifiedScale: p.user.verifiedScale,
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

  // Unique founders from posts
  const founders = Array.from(
    new Map(sorted.map((p) => [p.user.id, {
      id: p.user.id,
      name: p.user.handle,
      handle: p.user.handle,
      headline: p.user.headline || "Founder",
      avatar: p.user.avatar,
      momentumScore: p.user.momentumScore,
      verifiedScale: p.user.verifiedScale,
      type: (p.type === "dreamer" ? "dreamer" : "reality") as "dreamer" | "reality",
    }])).values()
  );

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--bg-primary)" }}>
      <SocialTicker />
      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative"
      >
        <ParticleField count={8} color="#8B5CF6" />

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-white">{t("feed.explore")}</h1>
            {!loading && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-micro px-2 py-0.5 rounded-full bg-violet/10 text-violet font-semibold"
              >
                {founders.length} Founders
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
          transition={{ delay: 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <MomentumStories />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <FeedTabs />
            <div className="flex-1" />
            <div className="flex items-center gap-2">
                  <span className="text-caption text-muted">
                    {founders.length} {t("feed.matching")}
                  </span>
              <SortPills />
            </div>
          </div>
        </motion.div>

        {loading ? (
          <SkeletonCard variant="feed" count={3} />
        ) : sorted.length === 0 ? (
          <div className="surface-card p-4">
            <AnimatedEmptyState
              variant={feedView === "dreamer" ? "dreamer" : feedView === "reality" ? "reality" : "default"}
              title={t("feed.empty")}
              description="Adjust your feed view to discover more founders and opportunities."
              action={user ? { label: "Create Post", onClick: () => window.location.href = `/${lang}/create` } : undefined}
            />
          </div>
        ) : (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            <AnimatePresence mode="popLayout">
              {founders.map((founder) => (
                <motion.div
                  key={founder.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                >
                  <FounderCard
                    id={founder.id}
                    name={founder.name}
                    handle={founder.handle}
                    headline={founder.headline}
                    avatar={founder.avatar}
                    momentumScore={founder.momentumScore}
                    verifiedScale={founder.verifiedScale}
                    revenueDelta="+32%"
                    userDelta="+18%"
                    tractionDelta="+24%"
                    tags={["SaaS", "AI", "B2B"]}
                    type={founder.type}
                    onMessage={() => window.location.href = `/${lang}/chat`}
                    onInvest={() => window.location.href = `/${lang}/investor`}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </motion.main>
    </div>
  );
}
