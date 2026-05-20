"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { Badge } from "@/components/ui/Badge";
import { MetricTicker } from "@/components/ui/MetricTicker";
import { MomentumPill } from "@/components/ui/MomentumPill";
import { CommentsSection } from "./CommentsSection";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { VerifiedBadge } from "@/components/ui/VerifiedBadge";
import type { ShowcasePost } from "@/types";
import { useFeedStore } from "@/stores/useFeedStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { createClient } from "@/lib/supabase-client";
import { useTranslation } from "react-i18next";

interface PostCardProps {
  post: ShowcasePost;
}

const roleStyles: Record<string, string> = {
  dreamer: "bg-violet/10 text-violet-light border-violet/20",
  investor: "bg-cyan/10 text-cyan border-cyan/20",
  admin: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  super_admin: "bg-amber-500/10 text-amber-400 border-amber-500/20",
};

const roleLabels: Record<string, string> = {
  dreamer: "Dreamer",
  investor: "Investor",
  admin: "Admin",
  super_admin: "Super Admin",
};

export function PostCard({ post }: PostCardProps) {
  const { t } = useTranslation();
  const { toggleLike, toggleSignal } = useFeedStore();
  const user = useAuthStore((s) => s.user);
  const isDreamer = post.type === "dreamer";
  const [disputeOpen, setDisputeOpen] = useState(false);
  const [disputeReason, setDisputeReason] = useState("");
  const [disputeSubmitting, setDisputeSubmitting] = useState(false);
  const [showComments, setShowComments] = useState(false);

  const handleLike = async () => {
    if (!user) return;
    toggleLike(post.id);
    const supabase = createClient();
    if (post.liked) {
      await supabase.from("post_likes").delete().eq("post_id", post.id).eq("user_id", user.id);
    } else {
      await supabase.from("post_likes").insert({ post_id: post.id, user_id: user.id });
    }
  };

  const handleSignal = async () => {
    if (!user) return;
    toggleSignal(post.id);
    const supabase = createClient();
    if (post.signaled) {
      await supabase.from("post_signals").delete().eq("post_id", post.id).eq("user_id", user.id);
    } else {
      await supabase.from("post_signals").insert({ post_id: post.id, user_id: user.id });
    }
  };

  const handleDispute = async () => {
    if (!user || !disputeReason.trim()) return;
    setDisputeSubmitting(true);
    const supabase = createClient();
    await supabase.from("disputes").insert({
      milestone_id: post.id,
      reporter_id: user.id,
      reason: disputeReason.trim(),
      status: "pending",
    });
    setDisputeOpen(false);
    setDisputeReason("");
    setDisputeSubmitting(false);
  };

  const mediaUrl = post.mediaUrl || post.media?.[0]?.url;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="group bg-graphite-900/60 border border-graphite-800/60 rounded-xl p-4 hover:bg-graphite-800/40 hover:border-violet/20 transition-all duration-300">

        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-violet/20 flex items-center justify-center shrink-0">
            <span className="text-violet font-bold text-xs">
              {post.user.handle[0].toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0 flex items-center gap-2">
            <span className="text-sm font-semibold text-white truncate">
              @{post.user.handle}
            </span>
            <VerifiedBadge scale={post.user.verifiedScale} size="sm" />
            <span className={`inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium rounded-full border ${roleStyles[post.user.role] || roleStyles.dreamer}`}>
              {roleLabels[post.user.role] || "Dreamer"}
            </span>
            <span className="ml-auto text-[10px] text-slate-muted whitespace-nowrap">
              {new Date(post.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-3">
          <h3 className="text-base font-medium text-white leading-snug">{post.title}</h3>
          {post.realityScore && (
            <Badge
              label={post.realityScore === "platinum" ? t("post.platinum") : t("post.gold")}
              color={post.realityScore === "platinum" ? "#14b8a6" : "#F59E0B"}
              variant="outline"
              size="sm"
            />
          )}
        </div>

        <p className="text-sm text-slate-muted leading-relaxed mb-3 line-clamp-3">
          {post.description}
        </p>

        {mediaUrl && (
          <div className="relative mb-3 h-48 sm:h-56 rounded-lg overflow-hidden">
            <img
              src={mediaUrl}
              alt={post.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-graphite via-transparent to-transparent" />
            <div className="absolute top-3 left-3">
              <Badge
                label={isDreamer ? t("post.dreamerBlueprint") : t("post.realityCheck")}
                color={isDreamer ? "#6366f1" : "#14b8a6"}
                variant="outline"
                size="sm"
              />
            </div>
          </div>
        )}

        {post.milestone && (
          <div className="flex items-center gap-2 mb-3 px-3 py-2 rounded-lg bg-graphite-800/40 border border-graphite-700/50">
            <svg className="w-3.5 h-3.5 text-violet shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-xs font-medium text-white truncate">{post.milestone}</span>
            {post.milestoneDate && (
              <span className="text-[10px] text-slate-muted ml-auto whitespace-nowrap">
                {new Date(post.milestoneDate).toLocaleDateString(undefined, { month: "short", year: "numeric" })}
              </span>
            )}
          </div>
        )}

        <div className="flex items-center gap-4 mb-3 text-xs text-slate-muted">
          <MetricTicker value={post.likes} suffix={` ${t("feed.likes")}`} duration={600} />
          <span>{post.comments} {t("feed.comments")}</span>
          {post.signals > 0 && (
            <MetricTicker value={post.signals} suffix={` ${t("feed.signals")}`} duration={600} />
          )}
        </div>

        <div className="flex items-center gap-1.5 pt-3 border-t border-graphite-800/60">
          <motion.button
            onClick={handleLike}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              post.liked
                ? "text-violet"
                : "text-slate-muted hover:text-violet"
            }`}
          >
            <svg className="w-4 h-4" fill={post.liked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            {post.likes}
          </motion.button>
          <motion.button
            onClick={() => setShowComments(!showComments)}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-muted hover:text-white transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            {post.comments}
          </motion.button>
          <motion.button
            onClick={handleSignal}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              post.signaled
                ? "text-cyan"
                : "text-slate-muted hover:text-cyan"
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            {post.signals}
          </motion.button>
          <motion.button
            onClick={() => setDisputeOpen(true)}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-muted hover:text-red-400 transition-all ml-auto"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            {t("post.flag")}
          </motion.button>
        </div>

        <AnimatePresence>
          {showComments && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              <CommentsSection postId={post.id} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {disputeOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-graphite/80 backdrop-blur-sm"
            onClick={() => setDisputeOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="w-full max-w-md bg-graphite-900 border border-graphite-800/60 rounded-2xl shadow-2xl p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-base font-semibold text-white mb-2">{t("dispute.flagMilestone")}</h3>
              <textarea
                value={disputeReason}
                onChange={(e) => setDisputeReason(e.target.value)}
                placeholder={t("dispute.reasonPlaceholder")}
                rows={3}
                className="w-full px-3 py-2 rounded-xl bg-graphite-800/40 border border-graphite-700/60 text-sm text-white placeholder-slate-muted focus:outline-none focus:ring-2 focus:ring-red-500/40 resize-none"
              />
              <div className="flex items-center justify-end gap-2 mt-4">
                <button
                  onClick={() => setDisputeOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-muted hover:text-white transition-colors"
                >
                  {t("common.cancel")}
                </button>
                <MagneticButton
                  onClick={handleDispute}
                  disabled={disputeSubmitting || !disputeReason.trim()}
                  variant="danger"
                  size="md"
                  loading={disputeSubmitting}
                >
                  {disputeSubmitting ? t("common.loading") : t("dispute.submit")}
                </MagneticButton>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
