"use client";

import { motion, useMotionValue, useSpring, type Variants } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useEffect, useState, useRef, useMemo } from "react";
import { Badge } from "@/components/ui/Badge";
import { MomentumPill } from "@/components/ui/MomentumPill";
import { LiveIndicator } from "@/components/ui/LiveIndicator";
import { SkeletonCard } from "@/components/ui/SkeletonCard";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { useAuthStore } from "@/stores/useAuthStore";
import { createClient } from "@/lib/supabase-client";
import type { User } from "@/types";

const ease = [0.16, 1, 0.3, 1] as const;

const containerVariants: Variants = {
  animate: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};
const fadeUpVariants: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.7, ease } },
};

type ProfileTab = "posts" | "about" | "signals";

function ScoreRing({ value, size = 88, color = "var(--violet)", label }: { value: number; size?: number; color?: string; label: string }) {
  const r = useMemo(() => size / 2 - 10, [size]);
  const circ = useMemo(() => 2 * Math.PI * r, [r]);
  const raw = useMotionValue(0);
  const springVal = useSpring(raw, { stiffness: 50, damping: 15 });
  const [offset, setOffset] = useState(circ);

  useEffect(() => {
    raw.set(value);
    const unsub = springVal.on("change", (v) => {
      setOffset(circ - (v / 100) * circ);
    });
    return unsub;
  }, [value, circ, raw, springVal]);

  return (
    <div className="flex flex-col items-center gap-1.5">
      <svg width={size} height={size} className="drop-shadow-[0_0_8px_var(--violet-glow)]">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--border-color)" strokeWidth={6} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={6}
          strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: "stroke-dashoffset 0.8s cubic-bezier(0.16, 1, 0.3, 1)" }}
        />
        <text x={size / 2} y={size / 2} textAnchor="middle" dominantBaseline="central"
          fill="var(--text-primary)" fontSize={size * 0.22} fontWeight={700}
        >
          {value}
        </text>
      </svg>
      <span className="text-caption text-muted uppercase tracking-wider">{label}</span>
    </div>
  );
}

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
  const [followerAvatars, setFollowerAvatars] = useState<string[]>([]);
  const [avatarHover, setAvatarHover] = useState(false);
  const coverRef = useRef<HTMLDivElement>(null);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handler = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    const supabase = createClient();
    const load = async () => {
      setLoading(true);
      if (authUser) {
        setProfile(authUser);
        try {
          const [{ count: f1 }, { count: f2 }, { count: pc }, { data: flwrs }] = await Promise.all([
            supabase.from("follows").select("*", { count: "exact", head: true }).eq("following_id", authUser.id),
            supabase.from("follows").select("*", { count: "exact", head: true }).eq("follower_id", authUser.id),
            supabase.from("posts").select("*", { count: "exact", head: true }).eq("user_id", authUser.id),
            supabase.from("follows").select("follower:profiles!follower_id(avatar_url)").eq("following_id", authUser.id).limit(6),
          ]);
          setFollowers(f1 || 0);
          setFollowing(f2 || 0);
          setPostCount(pc || 0);
          if (flwrs) setFollowerAvatars(flwrs.map((r: any) => r.follower?.avatar_url).filter(Boolean));
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

  const tabs: { key: ProfileTab; label: string; icon: string }[] = [
    { key: "posts", label: t("feed.posts"), icon: "M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" },
    { key: "about", label: t("profile.about"), icon: "M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" },
    { key: "signals", label: t("profile.signals"), icon: "M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" },
  ];

  const roleColor = profile?.role === "investor" ? "#14b8a6" : profile?.role === "admin" || profile?.role === "super_admin" ? "#f43f5e" : "#6366f1";
  const roleLabel = profile?.role === "super_admin" ? "Admin" : profile?.role || "Dreamer";

  const coverParallax = Math.max(-40, Math.min(0, -scrollY * 0.15));

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--bg-primary)" }}>
      <main className="max-w-page mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading || !profile ? (
          <SkeletonCard variant="profile" />
        ) : (
          <motion.div initial="initial" animate="animate" variants={containerVariants}>
            {/* ── Cover ── */}
            <motion.div variants={fadeUpVariants} className="relative h-48 sm:h-56 rounded-xl overflow-hidden group" ref={coverRef}>
              <div
                className="absolute inset-0"
                style={{
                  background: "linear-gradient(135deg, color-mix(in srgb, var(--violet) 12%, transparent) 0%, color-mix(in srgb, var(--emerald) 6%, transparent) 50%, var(--bg-primary) 100%)",
                  transform: `translateY(${coverParallax}px)`,
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-primary)] via-[var(--bg-primary)]/20 to-transparent" />
              <div className="absolute inset-0" style={{
                backgroundImage: `radial-gradient(ellipse at 30% 40%, color-mix(in srgb, var(--violet) 8%, transparent) 0%, transparent 60%)`,
              }} />
            </motion.div>

            {/* ── Header ── */}
            <motion.div variants={fadeUpVariants} className="relative px-4 sm:px-6 -mt-14 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-6">
                <div
                  className="relative shrink-0"
                  onMouseEnter={() => setAvatarHover(true)}
                  onMouseLeave={() => setAvatarHover(false)}
                >
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.4, ease }}
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-full p-[3px] bg-gradient-to-br from-violet/60 via-emerald/40 to-cyan/40"
                    style={{ boxShadow: "0 0 24px color-mix(in srgb, var(--violet) 20%, transparent), 0 8px 32px rgba(0,0,0,0.3)" }}
                  >
                    <div className="w-full h-full rounded-full overflow-hidden" style={{ backgroundColor: "var(--bg-primary)", outline: "2px solid var(--bg-primary)" }}>
                      {profile.avatar && !imgError ? (
                        <img src={profile.avatar} alt="" className="w-full h-full object-cover" onError={() => setImgError(true)} />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: "var(--bg-secondary)" }}>
                          <span className="text-2xl sm:text-3xl font-bold" style={{ color: roleColor }}>
                            {profile.handle?.charAt(0).toUpperCase() || "?"}
                          </span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                  <a
                    href={`/${lang}/profile/edit`}
                    className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center shadow-lg transition-all duration-300"
                    style={{ backgroundColor: "var(--violet)", color: "#fff", opacity: avatarHover ? 1 : 0 }}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 16.604a4.5 4.5 0 01-1.897 1.132l-2.685.8.8-2.685a4.5 4.5 0 011.132-1.897L16.863 4.487zm0 0L19.5 7.125" />
                    </svg>
                  </a>
                </div>

                <div className="flex-1 min-w-0 pb-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h1 className="text-heading" style={{ color: "var(--text-primary)" }}>{profile.handle}</h1>
                    {profile.verified && (
                      <motion.svg
                        initial={{ rotate: -20, scale: 0 }}
                        animate={{ rotate: 0, scale: 1 }}
                        transition={{ type: "spring", stiffness: 200, damping: 12 }}
                        className="w-5 h-5 shrink-0" style={{ color: "var(--cyan)" }} fill="currentColor" viewBox="0 0 24 24"
                      >
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </motion.svg>
                    )}
                    {profile.isPro && (
                      <span className="text-micro px-2 py-0.5 rounded-full font-semibold border" style={{
                        background: "linear-gradient(135deg, color-mix(in srgb, var(--violet) 20%, transparent), color-mix(in srgb, var(--emerald) 20%, transparent))",
                        color: "var(--violet-light)",
                        borderColor: "color-mix(in srgb, var(--violet) 20%, transparent)",
                      }}>
                        PRO
                      </span>
                    )}
                    <div className="flex items-center gap-2 ml-auto">
                      <LiveIndicator compact />
                    </div>
                  </div>
                  <p className="text-body mt-0.5" style={{ color: "var(--text-muted)" }}>{profile.headline || t("common.noHeadline")}</p>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <Badge label={roleLabel} color={roleColor} size="sm" variant="outline" />
                    <MomentumPill score={profile.momentumScore} size="sm" />
                    {profile.location && (
                      <span className="flex items-center gap-1 text-caption" style={{ color: "var(--text-muted)" }}>
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                        </svg>
                        {profile.location}
                      </span>
                    )}
                  </div>

                  {/* Follower avatars row */}
                  {followerAvatars.length > 0 && (
                    <div className="flex items-center gap-2 mt-3">
                      <div className="flex">
                        {followerAvatars.slice(0, 5).map((url, i) => (
                          <div
                            key={i}
                            className="w-6 h-6 rounded-full overflow-hidden ring-2"
                            style={{
                              marginLeft: i === 0 ? 0 : -8,
                              zIndex: 5 - i,
                              outline: "2px solid var(--bg-primary)",
                            }}
                          >
                            {url ? (
                              <img src={url} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[8px] font-bold"
                                style={{ backgroundColor: "var(--bg-tertiary)", color: "var(--text-muted)" }}>
                                ?
                              </div>
                            )}
                          </div>
                        ))}
                        {followers > 5 && (
                          <div className="w-6 h-6 rounded-full flex items-center justify-center text-[8px] font-bold ring-2"
                            style={{ marginLeft: -8, backgroundColor: "var(--bg-tertiary)", color: "var(--text-muted)", outline: "2px solid var(--bg-primary)" }}>
                            +{followers - 5}
                          </div>
                        )}
                      </div>
                      <span className="text-caption" style={{ color: "var(--text-muted)" }}>
                        {followers} {t("profile.followers")}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* ── Score Rings + Stats ── */}
            <motion.div variants={fadeUpVariants} className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
              <ScoreRing value={profile.momentumScore} color="var(--cyan)" label="Momentum" />
              <ScoreRing value={profile.realityScore} color="var(--violet)" label="Reality" />
              <motion.div
                variants={fadeUpVariants}
                className="rounded-xl p-4 text-center flex flex-col items-center justify-center gap-1"
                style={{ backgroundColor: "var(--bg-secondary)", border: "1px solid var(--border-color)" }}
              >
                <AnimatedCounter to={followers} className="text-display" style={{ color: "var(--text-primary)" }} />
                <p className="text-caption uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>{t("profile.followers")}</p>
              </motion.div>
              <motion.div
                variants={fadeUpVariants}
                className="rounded-xl p-4 text-center flex flex-col items-center justify-center gap-1"
                style={{ backgroundColor: "var(--bg-secondary)", border: "1px solid var(--border-color)" }}
              >
                <AnimatedCounter to={following} className="text-display" style={{ color: "var(--text-primary)" }} />
                <p className="text-caption uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>{t("profile.following")}</p>
              </motion.div>
            </motion.div>

            {/* ── Tab Navigation ── */}
            <motion.div variants={fadeUpVariants} className="flex items-center gap-1 mb-6 border-b" style={{ borderBottomColor: "var(--border-color)" }}>
              {tabs.map((tab) => {
                const isActive = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className="relative px-4 py-3 flex items-center gap-2 text-caption font-semibold transition-colors duration-300"
                    style={{ color: isActive ? "var(--violet-light)" : "var(--text-muted)" }}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d={tab.icon} />
                    </svg>
                    {tab.label}
                    {isActive && (
                      <motion.div
                        layoutId="tab-underline"
                        className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full"
                        style={{ backgroundColor: "var(--violet)" }}
                        transition={{ duration: 0.3, ease }}
                      />
                    )}
                  </button>
                );
              })}
            </motion.div>

            {/* ── Tab Content ── */}
            <motion.div variants={fadeUpVariants} key={activeTab}>
              {activeTab === "about" && (
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="md:col-span-2 space-y-4">
                    <div className="rounded-xl p-5" style={{ backgroundColor: "var(--bg-secondary)", border: "1px solid var(--border-color)" }}>
                      <h2 className="text-subhead mb-4" style={{ color: "var(--text-primary)" }}>{t("profile.about")}</h2>
                      {profile.bio ? (
                        <p className="text-body leading-relaxed" style={{ color: "var(--text-muted)" }}>{profile.bio}</p>
                      ) : (
                        <p className="text-body italic" style={{ color: "var(--text-faint)" }}>{t("common.noInfo")}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[
                        { label: "Company", value: profile.companyName, sector: profile.sector, icon: "M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" },
                        { label: "Location", value: profile.location, icon: "M15 10.5a3 3 0 11-6 0 3 3 0 016 0zM19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" },
                        { label: "Website", value: profile.website, href: profile.website ? `https://${profile.website}` : undefined, icon: "M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582" },
                      ].filter((item) => item.value).map((item) => (
                        <motion.div
                          key={item.label}
                          whileHover={{ y: -2 }}
                          transition={{ duration: 0.3, ease }}
                          className="rounded-xl p-4 flex items-start gap-3"
                          style={{ backgroundColor: "var(--bg-secondary)", border: "1px solid var(--border-color)" }}
                        >
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                            style={{ backgroundColor: "color-mix(in srgb, var(--violet) 10%, transparent)" }}>
                            <svg className="w-4 h-4" style={{ color: "var(--violet-light)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                            </svg>
                          </div>
                          <div>
                            <p className="text-body font-medium" style={{ color: "var(--text-primary)" }}>
                              {item.href ? <a href={item.href} target="_blank" rel="noopener noreferrer" style={{ color: "var(--violet-light)" }}>{item.value}</a> : item.value}
                            </p>
                            {"sector" in item && item.sector && (
                              <p className="text-caption" style={{ color: "var(--text-muted)" }}>{item.sector}</p>
                            )}
                          </div>
                        </motion.div>
                      ))}
                      <motion.div
                        whileHover={{ y: -2 }}
                        transition={{ duration: 0.3, ease }}
                        className="rounded-xl p-4 flex items-center gap-3"
                        style={{ backgroundColor: "var(--bg-secondary)", border: "1px solid var(--border-color)" }}
                      >
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                          style={{ backgroundColor: "color-mix(in srgb, var(--emerald) 10%, transparent)" }}>
                          <svg className="w-4 h-4" style={{ color: "var(--emerald)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-body font-medium" style={{ color: "var(--text-primary)" }}>
                            Joined {new Date(profile.joinedAt).toLocaleDateString(undefined, { month: "long", year: "numeric" })}
                          </p>
                        </div>
                      </motion.div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="rounded-xl p-5" style={{ backgroundColor: "var(--bg-secondary)", border: "1px solid var(--border-color)" }}>
                      <h2 className="text-subhead mb-4" style={{ color: "var(--text-primary)" }}>{t("profile.scores")}</h2>
                      <div className="space-y-5">
                        <ScoreRing value={profile.momentumScore} size={64} color="var(--cyan)" label="Momentum" />
                        <ScoreRing value={profile.realityScore} size={64} color="var(--violet)" label={t("profile.realityScore")} />
                        <div className="pt-4 space-y-3" style={{ borderTop: "1px solid var(--border-color)" }}>
                          <div className="flex items-center justify-between">
                            <span className="text-caption" style={{ color: "var(--text-muted)" }}>Status</span>
                            <span className="text-body font-medium" style={{ color: profile.verified ? "var(--emerald)" : "var(--text-primary)" }}>
                              {profile.verified ? "Verified" : "Unverified"}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-caption" style={{ color: "var(--text-muted)" }}>{t("profile.showcases")}</span>
                            <span className="text-body font-semibold tabular-nums" style={{ color: "var(--text-primary)" }}>{postCount}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "posts" && (
                <div className="rounded-xl p-8 text-center" style={{ backgroundColor: "var(--bg-secondary)", border: "1px solid var(--border-color)" }}>
                  <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"
                    style={{ backgroundColor: "color-mix(in srgb, var(--violet) 10%, transparent)" }}>
                    <svg className="w-6 h-6" style={{ color: "var(--violet-light)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                    </svg>
                  </div>
                  <p className="text-body" style={{ color: "var(--text-muted)" }}>{t("profile.postsPlaceholder")}</p>
                </div>
              )}

              {activeTab === "signals" && (
                <div className="rounded-xl p-8 text-center" style={{ backgroundColor: "var(--bg-secondary)", border: "1px solid var(--border-color)" }}>
                  <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"
                    style={{ backgroundColor: "color-mix(in srgb, var(--emerald) 10%, transparent)" }}>
                    <svg className="w-6 h-6" style={{ color: "var(--emerald)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                    </svg>
                  </div>
                  <p className="text-body" style={{ color: "var(--text-muted)" }}>{t("profile.signalsPlaceholder")}</p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </main>
    </div>
  );
}
