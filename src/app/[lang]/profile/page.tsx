"use client";

import { motion, type Variants } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Badge } from "@/components/ui/Badge";
import { MomentumPill } from "@/components/ui/MomentumPill";
import { LiveIndicator } from "@/components/ui/LiveIndicator";
import { SkeletonCard } from "@/components/ui/SkeletonCard";
import { MiniBar } from "@/components/ui/DataViz";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { useAuthStore } from "@/stores/useAuthStore";
import { createClient } from "@/lib/supabase-client";
import type { User } from "@/types";

const easeInOut = [0.16, 1, 0.3, 1] as const;

const containerVariants: Variants = {
  animate: {
    transition: { staggerChildren: 0.1, delayChildren: 0.15 },
  },
};

const fadeUpVariants: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: easeInOut },
  },
};

export default function ProfilePage({ params: { lang } }: { params: { lang: string } }) {
  const { t } = useTranslation();
  const authUser = useAuthStore((s) => s.user);
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [followers, setFollowers] = useState(0);
  const [following, setFollowing] = useState(0);
  const [postCount, setPostCount] = useState(0);

  useEffect(() => {
    const supabase = createClient();
    const load = async () => {
      setLoading(true);
      if (authUser) {
        setProfile(authUser);
        try {
          const [{ count: f1 }, { count: f2 }, { count: pc }] = await Promise.all([
            supabase.from("follows").select("*", { count: "exact", head: true }).eq("following_id", authUser.id),
            supabase.from("follows").select("*", { count: "exact", head: true }).eq("follower_id", authUser.id),
            supabase.from("posts").select("*", { count: "exact", head: true }).eq("user_id", authUser.id),
          ]);
          setFollowers(f1 || 0);
          setFollowing(f2 || 0);
          setPostCount(pc || 0);
        } catch {}
        setLoading(false);
        return;
      }
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      if (data) {
        setProfile({
          id: data.id, handle: data.handle, role: data.role,
          verified: data.verified, realityScore: data.reality_score,
          momentumScore: data.momentum_score, headline: data.headline,
          location: data.location, website: data.website,
          companyName: data.company_name, sector: data.sector,
          bio: data.bio, isPro: data.is_pro, avatar: data.avatar_url,
          coverUrl: data.cover_url, joinedAt: data.created_at,
        });
      }
      setLoading(false);
    };
    load();
  }, [authUser]);

  return (
    <div className="min-h-screen bg-graphite">
      <Navbar lang={lang} />
      <main className="max-w-4xl mx-auto px-6 py-10">
        {loading || !profile ? (
          <SkeletonCard variant="profile" />
        ) : (
          <motion.div initial="initial" animate="animate" variants={containerVariants}>
            {/* Header Actions */}
            <motion.div variants={fadeUpVariants} className="flex items-center justify-end gap-3 mb-8 print:hidden">
              <LiveIndicator compact />
              <a
                href={`/${lang}/profile/edit`}
                className="panel-hover inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-semibold text-white"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                </svg>
                {t("profile.editProfile")}
              </a>
              <a
                href={`/${lang}/migration`}
                className="panel-hover inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-semibold text-slate-muted"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                </svg>
                {t("migration.title")}
              </a>
              <a
                href={`/${lang}/dossier`}
                className="panel-hover inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-semibold text-violet"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
                {t("profile.exportDossier")}
              </a>
            </motion.div>

            {/* Cover Image */}
            <motion.div
              variants={fadeUpVariants}
              className="h-48 sm:h-56 rounded-xl bg-gradient-to-b from-violet/5 to-graphite border border-graphite-800/60 overflow-hidden mb-8"
            />

            {/* Avatar + Name + Role + Scores Row */}
            <motion.div variants={fadeUpVariants} className="flex items-end gap-6 -mt-16 mb-10 px-1 relative z-10">
              <div className="w-20 h-20 rounded-xl bg-graphite-900 border border-graphite-800/60 flex items-center justify-center shrink-0 shadow-xl">
                <span className="text-white font-bold text-2xl">{profile.handle?.charAt(0).toUpperCase() || "?"}</span>
              </div>
              <div className="pb-1 flex-1 min-w-0">
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-light text-white">@{profile.handle}</h1>
                  {profile.verified && (
                    <svg className="w-4 h-4 text-cyan" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  )}
                  {profile.isPro && (
                    <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-violet/20 text-violet-light font-semibold tracking-wider">PRO</span>
                  )}
                </div>
                <p className="text-sm text-slate-muted mt-0.5">{profile.headline || t("common.noHeadline")}</p>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <Badge
                    label={profile.role}
                    color={profile.role === "dreamer" ? "#6366f1" : profile.role === "investor" ? "#14b8a6" : profile.role === "admin" ? "#EF4444" : "#6366f1"}
                    size="sm"
                    variant="outline"
                  />
                  <MomentumPill score={profile.momentumScore} size="sm" />
                </div>
              </div>
            </motion.div>

            {/* Stats Row */}
            <motion.div variants={fadeUpVariants} className="grid grid-cols-3 gap-4 mb-10">
              {[
                { label: t("profile.followers"), value: followers },
                { label: t("profile.following"), value: following },
                { label: t("feed.posts"), value: postCount },
              ].map((stat) => (
                <div key={stat.label} className="panel p-4 text-center">
                  <AnimatedCounter to={stat.value} className="text-2xl font-light text-white" />
                  <p className="text-xs font-medium text-slate-muted uppercase tracking-[0.12em] mt-1.5">{stat.label}</p>
                </div>
              ))}
            </motion.div>

            {/* Two-Column Grid */}
            <motion.div variants={fadeUpVariants} className="grid md:grid-cols-2 gap-6">
              {/* About Panel */}
              <div className="panel p-4">
                <p className="text-xs font-medium text-slate-muted uppercase tracking-[0.12em] mb-5">About</p>
                <div className="space-y-4 text-sm">
                  {profile.bio && <p className="text-slate-muted leading-relaxed">{profile.bio}</p>}
                  {profile.location && (
                    <div className="flex items-center gap-2.5">
                      <svg className="w-4 h-4 text-slate-muted shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                      </svg>
                      <span className="text-white">{profile.location}</span>
                    </div>
                  )}
                  {profile.companyName && (
                    <div className="flex items-center gap-2.5">
                      <svg className="w-4 h-4 text-slate-muted shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
                      </svg>
                      <span className="text-white font-medium">{profile.companyName}</span>
                      {profile.sector && <Badge label={profile.sector} color="#14b8a6" size="sm" />}
                    </div>
                  )}
                  {profile.website && (
                    <div className="flex items-center gap-2.5">
                      <svg className="w-4 h-4 text-slate-muted shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
                      </svg>
                      <a href={`https://${profile.website}`} target="_blank" rel="noopener noreferrer" className="text-violet hover:text-violet-light transition-colors">
                        {profile.website}
                      </a>
                    </div>
                  )}
                  <div className="flex items-center gap-2.5">
                    <svg className="w-4 h-4 text-slate-muted shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-slate-muted">Joined {new Date(profile.joinedAt).toLocaleDateString()}</span>
                  </div>
                  {!profile.bio && !profile.location && !profile.companyName && !profile.website && (
                    <p className="text-slate-muted text-sm py-4 text-center">{t("common.noInfo")}</p>
                  )}
                </div>
              </div>

              {/* Scores Panel */}
              <div className="panel p-4">
                <p className="text-xs font-medium text-slate-muted uppercase tracking-[0.12em] mb-5">Scores</p>
                <div className="space-y-5">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-slate-muted">{t("profile.momentum")}</span>
                      <span className="text-sm font-medium text-cyan">{profile.momentumScore}</span>
                    </div>
                    <MiniBar value={profile.momentumScore} max={100} color="#14b8a6" size="md" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-slate-muted">{t("profile.realityScore")}</span>
                      <span className="text-sm font-medium text-violet">{profile.realityScore}</span>
                    </div>
                    <MiniBar value={profile.realityScore} max={100} color="#6366f1" size="md" />
                  </div>
                  <div className="pt-4 border-t border-graphite-800/60">
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <AnimatedCounter to={postCount} className="text-lg font-light text-white" />
                        <p className="text-xs font-medium text-slate-muted uppercase tracking-[0.12em] mt-1">{t("profile.showcases")}</p>
                      </div>
                      <div>
                        <span className="text-lg font-light text-white">{profile.verified ? "Verified" : "Unverified"}</span>
                        <p className="text-xs font-medium text-slate-muted uppercase tracking-[0.12em] mt-1">Status</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </main>
    </div>
  );
}
