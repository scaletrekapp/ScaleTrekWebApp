"use client";

import { motion, type Variants } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { MomentumPill } from "@/components/ui/MomentumPill";
import { LiveIndicator } from "@/components/ui/LiveIndicator";
import { SkeletonCard } from "@/components/ui/SkeletonCard";
import { MiniBar } from "@/components/ui/DataViz";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { useAuthStore } from "@/stores/useAuthStore";
import { createClient } from "@/lib/supabase-client";
import type { User } from "@/types";

const ease = [0.16, 1, 0.3, 1] as const;

const containerVariants: Variants = {
  animate: {
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const fadeUpVariants: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease },
  },
};

type ProfileTab = "posts" | "about" | "signals";

export default function ProfilePage({ params: { lang } }: { params: { lang: string } }) {
  const { t } = useTranslation();
  const authUser = useAuthStore((s) => s.user);
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [followers, setFollowers] = useState(0);
  const [following, setFollowing] = useState(0);
  const [postCount, setPostCount] = useState(0);
  const [activeTab, setActiveTab] = useState<ProfileTab>("posts");
  const [imgError, setImgError] = useState(false);

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

  const tabs: { key: ProfileTab; label: string }[] = [
    { key: "posts", label: t("feed.posts") },
    { key: "about", label: t("profile.about") },
    { key: "signals", label: t("profile.signals") },
  ];

  const roleColor = profile?.role === "investor" ? "#14b8a6" : profile?.role === "admin" || profile?.role === "super_admin" ? "#f43f5e" : "#6366f1";
  const roleLabel = profile?.role === "super_admin" ? "Admin" : profile?.role || "Dreamer";

  return (
    <div className="min-h-screen bg-onyx-900">
      <main className="max-w-page mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading || !profile ? (
          <SkeletonCard variant="profile" />
        ) : (
          <motion.div initial="initial" animate="animate" variants={containerVariants}>
            {/* ── Cover Image ── */}
            <motion.div variants={fadeUpVariants} className="relative h-48 sm:h-56 rounded-xl overflow-hidden mb-0">
              <div className="absolute inset-0 bg-gradient-to-br from-violet/10 via-emerald/[0.04] to-onyx-900" />
              <div className="absolute inset-0 bg-gradient-to-t from-onyx-900 via-onyx-900/20 to-transparent" />
              <div className="absolute inset-0" style={{
                backgroundImage: `radial-gradient(ellipse at 30% 40%, rgba(99,102,241,0.08) 0%, transparent 60%)`,
              }} />
            </motion.div>

            {/* ── Profile Header ── */}
            <motion.div variants={fadeUpVariants} className="relative px-4 sm:px-6 -mt-14 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-6">
                {/* Avatar */}
                <div className="relative shrink-0">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full p-[3px] bg-gradient-to-br from-violet/60 via-emerald/40 to-cyan/40 shadow-xl shadow-black/30">
                    <div className="w-full h-full rounded-full bg-onyx-900 flex items-center justify-center overflow-hidden ring-2 ring-onyx-900">
                      {profile.avatar && !imgError ? (
                        <img src={profile.avatar} alt="" className="w-full h-full object-cover" onError={() => setImgError(true)} />
                      ) : (
                        <span className="text-2xl sm:text-3xl font-bold" style={{ color: roleColor }}>
                          {profile.handle?.charAt(0).toUpperCase() || "?"}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Name + Handle + Badges */}
                <div className="flex-1 min-w-0 pb-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h1 className="text-heading text-white">{profile.handle}</h1>
                    {profile.verified && (
                      <svg className="w-5 h-5 text-cyan shrink-0" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    )}
                    {profile.isPro && (
                      <span className="text-micro px-2 py-0.5 rounded-full bg-gradient-to-r from-violet/20 to-emerald/20 text-violet-light font-semibold border border-violet/20">
                        PRO
                      </span>
                    )}
                    <div className="flex items-center gap-2 ml-auto">
                      <a
                        href={`/${lang}/profile/edit`}
                        className="btn-secondary btn-sm"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                        </svg>
                        {t("profile.editProfile")}
                      </a>
                      <LiveIndicator compact />
                    </div>
                  </div>
                  <p className="text-body text-muted mt-0.5">{profile.headline || t("common.noHeadline")}</p>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <Badge
                      label={roleLabel}
                      color={roleColor}
                      size="sm"
                      variant="outline"
                    />
                    <MomentumPill score={profile.momentumScore} size="sm" />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* ── Stats Row ── */}
            <motion.div variants={fadeUpVariants} className="grid grid-cols-4 gap-3 mb-8">
              {[
                { label: t("profile.followers"), value: followers },
                { label: t("profile.following"), value: following },
                { label: t("feed.posts"), value: postCount },
                { label: "Momentum", value: profile.momentumScore },
              ].map((stat) => (
                <div key={stat.label} className="surface-card p-4 text-center">
                  <AnimatedCounter to={stat.value} className="text-display text-white" />
                  <p className="text-caption text-muted uppercase tracking-wider mt-1">{stat.label}</p>
                </div>
              ))}
            </motion.div>

            {/* ── Tab Navigation ── */}
            <motion.div variants={fadeUpVariants} className="flex items-center gap-1 mb-6">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-4 py-2 rounded-lg text-caption font-semibold transition-all duration-400 ease-spring ${
                    activeTab === tab.key
                      ? "bg-violet/10 text-violet-light"
                      : "text-muted hover:text-white hover:bg-white/[0.03]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </motion.div>

            {/* ── Tab Content ── */}
            <motion.div variants={fadeUpVariants} key={activeTab}>
              {activeTab === "about" && (
                <div className="grid md:grid-cols-3 gap-6">
                  {/* About */}
                  <div className="md:col-span-2 surface-card p-5">
                    <h2 className="text-subhead text-white mb-4">{t("profile.about")}</h2>
                    {profile.bio ? (
                      <p className="text-body text-muted leading-relaxed">{profile.bio}</p>
                    ) : (
                      <p className="text-body text-faint italic">{t("common.noInfo")}</p>
                    )}

                    <div className="space-y-3 mt-5 pt-4 border-t border-onyx-700/50">
                      {profile.companyName && (
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-violet-muted flex items-center justify-center shrink-0">
                            <svg className="w-4 h-4 text-violet-light" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-body text-white font-medium">{profile.companyName}</p>
                            {profile.sector && <p className="text-caption text-muted">{profile.sector}</p>}
                          </div>
                        </div>
                      )}
                      {profile.location && (
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-emerald-muted flex items-center justify-center shrink-0">
                            <svg className="w-4 h-4 text-emerald" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                            </svg>
                          </div>
                          <span className="text-body text-white">{profile.location}</span>
                        </div>
                      )}
                      {profile.website && (
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-violet-muted flex items-center justify-center shrink-0">
                            <svg className="w-4 h-4 text-violet-light" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
                            </svg>
                          </div>
                          <a href={`https://${profile.website}`} target="_blank" rel="noopener noreferrer" className="text-body text-violet-light hover:text-violet transition-colors">
                            {profile.website}
                          </a>
                        </div>
                      )}
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-onyx-700/40 flex items-center justify-center shrink-0">
                          <svg className="w-4 h-4 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <span className="text-body text-muted">Joined {new Date(profile.joinedAt).toLocaleDateString(undefined, { month: "long", year: "numeric" })}</span>
                      </div>
                    </div>
                  </div>

                  {/* Scores Sidebar */}
                  <div className="surface-card p-5">
                    <h2 className="text-subhead text-white mb-4">{t("profile.scores")}</h2>
                    <div className="space-y-5">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-caption text-muted">{t("profile.momentum")}</span>
                          <span className="text-body font-semibold text-cyan tabular-nums">{profile.momentumScore}</span>
                        </div>
                        <MiniBar value={profile.momentumScore} max={100} color="#14b8a6" size="md" />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-caption text-muted">{t("profile.realityScore")}</span>
                          <span className="text-body font-semibold text-violet-light tabular-nums">{profile.realityScore}</span>
                        </div>
                        <MiniBar value={profile.realityScore} max={100} color="#6366f1" size="md" />
                      </div>
                      <div className="pt-4 border-t border-onyx-700/50 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-caption text-muted">Status</span>
                          <span className="text-body font-medium text-white">{profile.verified ? "Verified" : "Unverified"}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-caption text-muted">{t("profile.showcases")}</span>
                          <span className="text-body font-semibold text-white tabular-nums">{postCount}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "posts" && (
                <div className="surface-card p-8 text-center">
                  <div className="w-12 h-12 rounded-full bg-violet-muted flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-violet-light" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                    </svg>
                  </div>
                  <p className="text-body text-muted">{t("profile.postsPlaceholder")}</p>
                </div>
              )}

              {activeTab === "signals" && (
                <div className="surface-card p-8 text-center">
                  <div className="w-12 h-12 rounded-full bg-emerald-muted flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-emerald" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                    </svg>
                  </div>
                  <p className="text-body text-muted">{t("profile.signalsPlaceholder")}</p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </main>
    </div>
  );
}
