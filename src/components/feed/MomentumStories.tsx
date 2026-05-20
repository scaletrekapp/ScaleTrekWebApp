"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Story {
  id: string;
  userName: string;
  userHandle: string;
  avatarColor: string;
  type: "video" | "screenshot" | "stripe";
  thumbnailLabel: string;
  content?: string;
  postedAt: string;
}

const MOCK_STORIES: Story[] = [
  { id: "st1", userName: "Youssef K.", userHandle: "youssef_k", avatarColor: "#6366f1", type: "screenshot", thumbnailLabel: "Dashboard", content: "Monthly revenue hit $8.2K — 22% MoM growth", postedAt: "2h ago" },
  { id: "st2", userName: "Amina R.", userHandle: "amina_r", avatarColor: "#14b8a6", type: "stripe", thumbnailLabel: "Stripe", content: "First $1K MRR milestone achieved!", postedAt: "4h ago" },
  { id: "st3", userName: "Sara B.", userHandle: "sara_b", avatarColor: "#34d399", type: "video", thumbnailLabel: "Demo", content: "New product demo walkthrough — would love feedback", postedAt: "6h ago" },
  { id: "st4", userName: "Karim O.", userHandle: "karim_o", avatarColor: "#f59e0b", type: "screenshot", thumbnailLabel: "Users", content: "Crossed 500 active users this week", postedAt: "8h ago" },
  { id: "st5", userName: "Leila M.", userHandle: "leila_m", avatarColor: "#a78bfa", type: "stripe", thumbnailLabel: "Revenue", content: "Q2 revenue tracking 40% above forecast", postedAt: "12h ago" },
];

const TYPE_ICONS: Record<string, string> = {
  video: "M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z",
  screenshot: "M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.41a2.25 2.25 0 013.182 0l2.909 2.91m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z",
  stripe: "M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
};

export function MomentumStories() {
  const [activeStory, setActiveStory] = useState<Story | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleStoryClick = (story: Story) => {
    setActiveStory(story);
  };

  return (
    <>
      <div className="relative mb-2">
        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto overflow-y-hidden scrollbar-hide py-1"
        >
          {MOCK_STORIES.map((story, i) => (
            <motion.button
              key={story.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              onClick={() => handleStoryClick(story)}
              className="flex flex-col items-center gap-1.5 shrink-0 group"
            >
              <div className="relative" style={{ filter: `drop-shadow(0 0 6px ${story.avatarColor}40)` }}>
                <div className="w-14 h-14 rounded-full p-[2px] bg-gradient-to-br from-violet via-emerald to-cyan">
                  <div className="w-full h-full rounded-full bg-onyx-900 flex items-center justify-center text-sm font-bold" style={{ color: story.avatarColor }}>
                    {story.userName.charAt(0)}
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

      {/* Fullscreen Story Viewer */}
      <AnimatePresence>
        {activeStory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center"
            onClick={() => setActiveStory(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-lg mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Story card */}
              <div className="panel overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-onyx-700/60">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold" style={{ backgroundColor: `${activeStory.avatarColor}20`, color: activeStory.avatarColor }}>
                      {activeStory.userName.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{activeStory.userName}</p>
                      <p className="text-[10px] text-slate-muted">@{activeStory.userHandle} · {activeStory.postedAt}</p>
                    </div>
                  </div>
                  <button onClick={() => setActiveStory(null)} className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-muted hover:text-white hover:bg-white/5 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Content area */}
                <div className="p-6 flex flex-col items-center text-center min-h-[300px] justify-center bg-gradient-to-b from-onyx-800/60 to-onyx-900">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ backgroundColor: `${activeStory.avatarColor}20` }}>
                    <svg className="w-8 h-8" style={{ color: activeStory.avatarColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d={TYPE_ICONS[activeStory.type]} />
                    </svg>
                  </div>
                  <p className="text-2xl font-bold text-white mb-2">{activeStory.thumbnailLabel}</p>
                  <p className="text-sm text-slate-muted max-w-sm">{activeStory.content}</p>

                  {/* Swipe indicator */}
                  <div className="flex items-center gap-1 mt-8">
                    {MOCK_STORIES.map((s, i) => (
                      <div
                        key={s.id}
                        className={`h-1 rounded-full transition-all ${s.id === activeStory.id ? "w-8 bg-violet" : "w-2 bg-onyx-700/60"}`}
                      />
                    ))}
                  </div>
                  <p className="text-[10px] text-slate-subtle mt-3">Swipe to navigate stories</p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 px-4 py-3 border-t border-onyx-700/60">
                  <button className="flex-1 px-3 py-2 rounded-lg text-[11px] font-semibold text-white bg-violet/10 hover:bg-violet/20 transition-colors">
                    Message Founder
                  </button>
                  <button className="flex-1 px-3 py-2 rounded-lg text-[11px] font-semibold text-emerald bg-emerald/10 hover:bg-emerald/20 transition-colors">
                    View Traction Data
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
