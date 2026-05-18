"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { Badge } from "@/components/ui/Badge";
import { MetricTicker } from "@/components/ui/MetricTicker";
import { MomentumPill } from "@/components/ui/MomentumPill";
import type { ShowcasePost } from "@/types";
import { useFeedStore } from "@/stores/useFeedStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { createClient } from "@/lib/supabase-client";

interface PostCardProps {
  post: ShowcasePost;
}

export function PostCard({ post }: PostCardProps) {
  const { toggleLike, toggleSignal } = useFeedStore();
  const user = useAuthStore((s) => s.user);
  const isDreamer = post.type === "dreamer";

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

  return (
    <GlassCard variant="dark" className="overflow-hidden">
      {(post.mediaUrl || post.media?.[0]) && (
        <div className="relative -mx-4 -mt-4 mb-4 h-48 sm:h-56 overflow-hidden">
          <img
            src={post.mediaUrl || post.media![0].url}
            alt={post.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-midnight via-transparent to-transparent" />
          <div className="absolute top-3 left-3">
            <Badge
              label={isDreamer ? "Dreamer Blueprint" : "Reality Check"}
              color={isDreamer ? "#8B5CF6" : "#22C55E"}
              variant="glow"
              size="sm"
            />
          </div>
          {post.realityScore && (
            <div className="absolute top-3 right-3">
              <Badge
                label={post.realityScore === "platinum" ? "Platinum" : "Gold"}
                color={post.realityScore === "platinum" ? "#06B6D4" : "#F59E0B"}
                variant="glow"
                size="sm"
              />
            </div>
          )}
        </div>
      )}

      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 rounded-full bg-violet/20 dark:bg-violet/20 flex items-center justify-center border border-violet/30 dark:border-violet/30">
          <span className="text-violet dark:text-violet font-bold text-xs">
            {post.user.handle[0].toUpperCase()}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-semibold text-midnight dark:text-white truncate">
              @{post.user.handle}
            </span>
            {post.user.verified && (
              <svg className="w-3.5 h-3.5 text-cyan shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            )}
          </div>
          <div className="flex items-center gap-2">
            <MomentumPill score={post.user.momentumScore} size="sm" />
            <span className="text-[10px] text-slate-muted">
              {new Date(post.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      <h3 className="text-base font-bold text-midnight dark:text-white mb-1.5">{post.title}</h3>
      <p className="text-sm text-slate-muted dark:text-slate-muted leading-relaxed mb-3 line-clamp-3">
        {post.description}
      </p>

      <div className="flex items-center gap-4 mb-3 text-xs text-slate-muted dark:text-slate-muted">
        <span className="font-medium">
          <MetricTicker value={post.likes} suffix=" likes" duration={600} />
        </span>
        <span>{post.comments} comments</span>
        {post.signals > 0 && <MetricTicker value={post.signals} suffix=" signals" duration={600} />}
      </div>

      <div className="flex items-center gap-3 pt-3 border-t border-slate-border dark:border-slate-border">
        <button
          onClick={handleLike}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            post.liked
              ? "bg-violet/10 text-violet"
              : "text-slate-muted hover:text-violet hover:bg-violet/5"
          }`}
        >
          <svg className="w-4 h-4" fill={post.liked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          Like
        </button>
        <button
          onClick={handleSignal}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            post.signaled
              ? "bg-cyan/10 text-cyan"
              : "text-slate-muted hover:text-cyan hover:bg-cyan/5"
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Signal
        </button>
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-muted hover:text-midnight dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-all ml-auto">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          Comment
        </button>
      </div>
    </GlassCard>
  );
}
