"use client";

import { Navbar } from "@/components/layout/Navbar";
import { FeedTabs, SortPills, PostCard } from "@/components/feed";
import { GlassCard } from "@/components/ui/GlassCard";
import { useFeedStore } from "@/stores/useFeedStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-client";
import type { ShowcasePost } from "@/types";

export default function FeedPage({ params: { lang } }: { params: { lang: string } }) {
  const { t } = useTranslation();
  const { posts, setPosts, feedView, sortMode } = useFeedStore();
  const user = useAuthStore((s) => s.user);
  const [riskSlider, setRiskSlider] = useState(50);
  const [loading, setLoading] = useState(true);

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
    <div className="min-h-screen bg-white dark:bg-midnight">
      <Navbar lang={lang} />
      <main className="max-w-3xl mx-auto px-4 py-8">
        <GlassCard variant="dark" className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-violet" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
              </svg>
              <span className="text-sm font-semibold text-midnight dark:text-white">Control Room</span>
            </div>
            <span className="text-xs text-slate-muted">
              {sorted.length} matching
            </span>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-muted">
              <span>High Risk · Dreamers</span>
              <span>Low Risk · Reality</span>
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
              <span className="text-violet">Blueprint</span>
              <span className="text-cyan">Steel</span>
            </div>
          </div>
        </GlassCard>

        <div className="flex items-center justify-between mb-6">
          <FeedTabs />
          <SortPills />
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-violet border-t-transparent rounded-full animate-spin" />
          </div>
        ) : sorted.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center">
              <svg className="w-8 h-8 text-slate-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <p className="text-slate-muted text-sm">{t("feed.empty")}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sorted.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
