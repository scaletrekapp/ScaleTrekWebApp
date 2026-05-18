"use client";

import { Navbar } from "@/components/layout/Navbar";
import { FeedTabs, SortPills, PostCard } from "@/components/feed";
import { GlassCard } from "@/components/ui/GlassCard";
import { useFeedStore } from "@/stores/useFeedStore";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import type { ShowcasePost } from "@/types";

const MOCK_POSTS: ShowcasePost[] = [
  {
    id: "p1", userId: "u1",
    user: { id: "u1", handle: "neon_pioneer", role: "dreamer", verified: false, realityScore: 0, momentumScore: 72, joinedAt: new Date().toISOString() },
    type: "dreamer", title: "Neural Interface Prototype V2", description: "Completed the second iteration of our non-invasive BCI headband. 128-channel readout with real-time signal processing on edge hardware. Next step: FDA pre-submission.",
    mediaUrl: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=600", mediaType: "image",
    milestone: "Prototype V2 Finished", milestoneDate: new Date().toISOString(), likes: 47, comments: 12, signals: 8, riskLevel: 85, createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: "p2", userId: "u2",
    user: { id: "u2", handle: "veridian_works", role: "dreamer", verified: true, realityScore: 92, momentumScore: 45, joinedAt: new Date().toISOString() },
    type: "reality", title: "Q1 2026: 10k MAD MRR Milestone", description: "Hit 10,000 MAD in monthly recurring revenue for our SaaS platform. 200+ B2B customers across EMEA. 94% gross margin.",
    mediaUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600", mediaType: "image",
    milestone: "First 10k MAD Revenue", milestoneDate: new Date().toISOString(), likes: 156, comments: 28, signals: 45, riskLevel: 20, createdAt: new Date(Date.now() - 86400000 * 7).toISOString(), realityScore: "gold",
  },
  {
    id: "p3", userId: "u3",
    user: { id: "u3", handle: "cyber_forge", role: "dreamer", verified: true, realityScore: 65, momentumScore: 88, joinedAt: new Date().toISOString() },
    type: "dreamer", title: "Decentralized Mesh Network — Field Test Alpha", description: "Deployed 12 nodes across a 5km radius. Packet delivery at 94% with sub-50ms latency. Zero infrastructure required.",
    mediaUrl: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600", mediaType: "image",
    milestone: "Field Test Alpha Complete", milestoneDate: new Date().toISOString(), likes: 89, comments: 34, signals: 22, riskLevel: 60, createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: "p4", userId: "u4",
    user: { id: "u4", handle: "aether_capital", role: "investor", verified: true, realityScore: 100, momentumScore: 0, joinedAt: new Date().toISOString() },
    type: "reality", title: "Closed $500k Seed Round with Veridian Ventures", description: "Led by Veridian Ventures with participation from angel syndicate. Post-money valuation $4.2M.",
    mediaUrl: "https://images.unsplash.com/photo-1614027164847-1b28cfe1df60?w=600", mediaType: "image",
    milestone: "Seed Round Closed", milestoneDate: new Date().toISOString(), likes: 203, comments: 41, signals: 67, riskLevel: 15, createdAt: new Date(Date.now() - 86400000 * 14).toISOString(), realityScore: "platinum",
  },
];

export default function FeedPage({ params: { lang } }: { params: { lang: string } }) {
  const { t } = useTranslation();
  const { posts, setPosts, feedView, sortMode } = useFeedStore();
  const [riskSlider, setRiskSlider] = useState(50);

  useEffect(() => {
    setPosts(MOCK_POSTS);
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
        {/* Control Room */}
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

        {/* Feed Controls */}
        <div className="flex items-center justify-between mb-6">
          <FeedTabs />
          <SortPills />
        </div>

        {/* Post Stream */}
        {sorted.length === 0 ? (
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
