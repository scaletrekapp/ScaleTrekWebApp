"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { createClient } from "@/lib/supabase-client";

interface Story {
  id: string;
  userId: string;
  userName: string;
  userHandle: string;
  userAvatar?: string;
  type: "video" | "screenshot" | "stripe";
  thumbnailLabel: string;
  content?: string;
  mediaUrl?: string;
  postedAt: string;
}

const TYPE_ICONS: Record<string, string> = {
  video: "M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z",
  screenshot: "M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.41a2.25 2.25 0 013.182 0l2.909 2.91m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z",
  stripe: "M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
};

function mapRow(row: any): Story {
  return {
    id: row.id,
    userId: row.user_id,
    userName: row.user?.handle || "Unknown",
    userHandle: row.user?.handle || "unknown",
    userAvatar: row.user?.avatar_url,
    type: row.type,
    thumbnailLabel: row.thumbnail_label || row.type,
    content: row.content || "",
    mediaUrl: row.media_url,
    postedAt: row.posted_at,
  };
}

const FALLBACK_STORIES: Story[] = [
  { id: "st1", userId: "u1", userName: "Youssef K.", userHandle: "youssef_k", type: "screenshot", thumbnailLabel: "Dashboard", content: "Monthly revenue hit $8.2K — 22% MoM growth", postedAt: "2h ago" },
  { id: "st2", userId: "u2", userName: "Amina R.", userHandle: "amina_r", type: "stripe", thumbnailLabel: "Stripe", content: "First $1K MRR milestone achieved!", postedAt: "4h ago" },
  { id: "st3", userId: "u3", userName: "Sara B.", userHandle: "sara_b", type: "video", thumbnailLabel: "Demo", content: "New product demo walkthrough — would love feedback", postedAt: "6h ago" },
  { id: "st4", userId: "u4", userName: "Karim O.", userHandle: "karim_o", type: "screenshot", thumbnailLabel: "Users", content: "Crossed 500 active users this week", postedAt: "8h ago" },
  { id: "st5", userId: "u5", userName: "Leila M.", userHandle: "leila_m", type: "stripe", thumbnailLabel: "Revenue", content: "Q2 revenue tracking 40% above forecast", postedAt: "12h ago" },
];

export function MomentumStories() {
  const [stories, setStories] = useState<Story[]>(FALLBACK_STORIES);
  const [loading, setLoading] = useState(true);
  const [activeIdx, setActiveIdx] = useState<number>(-1);
  const [dragX, setDragX] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("stories")
        .select(`*, user:user_id(id, handle, avatar_url)`)
        .gte("expires_at", new Date().toISOString())
        .order("posted_at", { ascending: false });
      if (data && data.length > 0) {
        setStories(data.map(mapRow));
      }
      setLoading(false);
    };
    load();
  }, [supabase]);

  const showViewer = activeIdx >= 0 && activeIdx < stories.length;
  const activeStory = showViewer ? stories[activeIdx] : null;

  const goNext = useCallback(() => {
    if (activeIdx < stories.length - 1) setActiveIdx((i) => i + 1);
    else setActiveIdx(-1);
  }, [activeIdx, stories.length]);

  const goPrev = useCallback(() => {
    if (activeIdx > 0) setActiveIdx((i) => i - 1);
  }, [activeIdx]);

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (info.offset.x < -60) goNext();
    else if (info.offset.x > 60) goPrev();
    setDragX(0);
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!showViewer) return;
      if (e.key === "ArrowRight") goNext();
      else if (e.key === "ArrowLeft") goPrev();
      else if (e.key === "Escape") setActiveIdx(-1);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [showViewer, goNext, goPrev]);

  if (loading) return null;

  return (
    <>
      <div className="relative mb-2">
        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto overflow-y-hidden scrollbar-hide py-1"
        >
          {stories.map((story, i) => (
            <motion.button
              key={story.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              onClick={() => setActiveIdx(i)}
              className="flex flex-col items-center gap-1.5 shrink-0 group"
            >
              <div className="relative" style={{ filter: "drop-shadow(0 0 6px rgba(99,102,241,0.25))" }}>
                <div className="w-14 h-14 rounded-full p-[2px] bg-gradient-to-br from-violet via-emerald to-cyan">
                  <div className="w-full h-full rounded-full bg-onyx-900 flex items-center justify-center overflow-hidden">
                    {story.userAvatar ? (
                      <img src={story.userAvatar} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-sm font-bold text-violet-light">
                        {story.userName.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-onyx-900 border-2 border-onyx-900 flex items-center justify-center">
                  <svg className="w-2.5 h-2.5 text-slate-muted" viewBox="0 0 24 24" fill="currentColor">
                    <path d={TYPE_ICONS[story.type]} />
                  </svg>
                </div>
              </div>
              <span className="text-[10px] text-slate-muted truncate max-w-[56px] leading-none">{story.thumbnailLabel}</span>
            </motion.button>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {showViewer && activeStory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center"
            onClick={() => setActiveIdx(-1)}
          >
            <motion.div
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDrag={(_, info) => setDragX(info.offset.x)}
              onDragEnd={handleDragEnd}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1, x: dragX }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-lg mx-4 cursor-grab active:cursor-grabbing"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="surface-modal overflow-hidden">
                {/* Progress bar */}
                <div className="flex gap-0.5 px-3 pt-3">
                  {stories.map((s, i) => (
                    <div
                      key={s.id}
                      className="h-0.5 flex-1 rounded-full transition-all duration-300"
                      style={{
                        backgroundColor: i <= activeIdx ? "var(--violet)" : "var(--border-color)",
                        opacity: i === activeIdx ? 1 : 0.4,
                      }}
                    />
                  ))}
                </div>

                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full p-[1.5px] bg-gradient-to-br from-violet/40 via-emerald/30 to-cyan/30">
                      <div className="w-full h-full rounded-full flex items-center justify-center overflow-hidden" style={{ backgroundColor: "var(--bg-secondary)" }}>
                        {activeStory.userAvatar ? (
                          <img src={activeStory.userAvatar} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-sm font-bold text-violet-light">
                            {activeStory.userName.charAt(0)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{activeStory.userName}</p>
                      <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>@{activeStory.userHandle} · {activeStory.postedAt}</p>
                    </div>
                  </div>
                  <button onClick={() => setActiveIdx(-1)} className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors" style={{ color: "var(--text-muted)" }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "color-mix(in srgb, var(--bg-tertiary) 50%, transparent)"; (e.currentTarget as HTMLElement).style.color = "var(--text-primary)" }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"; (e.currentTarget as HTMLElement).style.color = "var(--text-muted)" }}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Content */}
                <div className="p-6 flex flex-col items-center text-center min-h-[300px] justify-center" style={{
                  background: "linear-gradient(180deg, color-mix(in srgb, var(--bg-tertiary) 60%, transparent) 0%, var(--bg-primary) 100%)"
                }}>
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ backgroundColor: "color-mix(in srgb, var(--violet) 15%, transparent)" }}>
                    <svg className="w-8 h-8" style={{ color: "var(--violet)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d={TYPE_ICONS[activeStory.type]} />
                    </svg>
                  </div>
                  <p className="text-2xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>{activeStory.thumbnailLabel}</p>
                  <p className="text-sm max-w-sm" style={{ color: "var(--text-muted)" }}>{activeStory.content}</p>

                  <div className="flex items-center gap-1 mt-8">
                    <p className="text-[10px]" style={{ color: "var(--text-faint)" }}>Swipe to navigate</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 px-4 py-3" style={{ borderTop: "1px solid var(--border-color)" }}>
                  <button className="btn-secondary btn-sm flex-1">Message Founder</button>
                  <button className="btn-primary btn-sm flex-1">View Traction Data</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
