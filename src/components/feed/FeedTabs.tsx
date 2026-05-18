"use client";

import { useFeedStore } from "@/stores/useFeedStore";
import type { FeedMode } from "@/types";

const TABS: { key: FeedMode; labelKey: string }[] = [
  { key: "explore", labelKey: "feed.explore" },
  { key: "dreamer", labelKey: "feed.dreamer" },
  { key: "reality", labelKey: "feed.reality" },
];

export function FeedTabs() {
  const { feedView, setFeedView } = useFeedStore();

  return (
    <div className="flex items-center gap-1 bg-black/5 dark:bg-white/5 rounded-xl p-1">
      {TABS.map((tab) => (
        <button
          key={tab.key}
          onClick={() => setFeedView(tab.key)}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            feedView === tab.key
              ? "bg-white dark:bg-midnight3 text-midnight dark:text-white shadow-sm"
              : "text-slate-muted dark:text-slate-muted hover:text-midnight dark:hover:text-white"
          }`}
        >
          {tab.labelKey === "feed.explore"
            ? "Explore"
            : tab.labelKey === "feed.dreamer"
              ? "Dreamer Blueprints"
              : "Reality Checks"}
        </button>
      ))}
    </div>
  );
}

export function SortPills() {
  const { sortMode, setSortMode } = useFeedStore();

  return (
    <div className="flex items-center gap-1">
      {(["recent", "top"] as const).map((mode) => (
        <button
          key={mode}
          onClick={() => setSortMode(mode)}
          className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold uppercase tracking-wider transition-all ${
            sortMode === mode
              ? "bg-violet/10 dark:bg-violet/10 text-violet dark:text-violet"
              : "text-slate-muted dark:text-slate-muted hover:text-midnight dark:hover:text-white"
          }`}
        >
          {mode === "recent" ? "Recent" : "Top"}
        </button>
      ))}
    </div>
  );
}
