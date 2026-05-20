"use client";

import { motion } from "framer-motion";

interface ChatThreadSummary {
  id: string;
  participantName: string;
  participantHandle: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  status: "in_clean_room" | "inquiry" | "archived";
  momentumScore: number;
  online: boolean;
}

interface ChatSidebarProps {
  threads: ChatThreadSummary[];
  activeThreadId: string | null;
  onSelect: (id: string) => void;
}

const STATUS_CONFIG = {
  in_clean_room: { label: "In Clean Room", dot: "bg-emerald", border: "border-l-emerald" },
  inquiry: { label: "Inquiry", dot: "bg-amber", border: "border-l-amber" },
  archived: { label: "Archived", dot: "bg-slate-subtle", border: "border-l-slate-subtle" },
} as const;

function ThreadItem({ thread, isActive, onSelect }: { thread: ChatThreadSummary; isActive: boolean; onSelect: () => void }) {
  const config = STATUS_CONFIG[thread.status];

  return (
    <motion.button
      onClick={onSelect}
      whileTap={{ scale: 0.99 }}
      className={`w-full text-left px-4 py-3 border-l-2 transition-colors ${
        isActive ? "bg-white/[0.04] border-l-violet" : `${config.border} border-l-transparent hover:bg-white/[0.02]`
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="relative shrink-0 mt-0.5">
          <div className="w-9 h-9 rounded-full bg-violet/10 flex items-center justify-center text-xs font-bold text-violet-light">
            {thread.participantName.charAt(0).toUpperCase()}
          </div>
          {thread.online && (
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald border-2 border-onyx-900" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-0.5">
            <span className="text-sm font-medium text-white truncate">{thread.participantName}</span>
            <span className="text-[10px] font-mono text-slate-subtle shrink-0">{thread.timestamp}</span>
          </div>
          <p className="text-xs text-slate-muted truncate mb-1">{thread.lastMessage}</p>
          <div className="flex items-center gap-2">
            <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
            <span className="text-[10px] text-slate-subtle uppercase tracking-wider">{config.label}</span>
            {thread.unread > 0 && (
              <span className="ml-auto w-5 h-4 rounded-full bg-violet/20 text-violet-light text-[10px] font-semibold flex items-center justify-center">
                {thread.unread}
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.button>
  );
}

export function ChatSidebar({ threads, activeThreadId, onSelect }: ChatSidebarProps) {
  const grouped = {
    in_clean_room: threads.filter((t) => t.status === "in_clean_room"),
    inquiry: threads.filter((t) => t.status === "inquiry"),
    archived: threads.filter((t) => t.status === "archived"),
  };

  const sections = [
    { key: "in_clean_room", label: "In Clean Room", threads: grouped.in_clean_room },
    { key: "inquiry", label: "Inquiry", threads: grouped.inquiry },
    { key: "archived", label: "Archived", threads: grouped.archived },
  ] as const;

  return (
    <div className="h-full flex flex-col bg-onyx-950/50 border-r border-onyx-700/60">
      <div className="shrink-0 px-4 py-3 border-b border-onyx-700/60">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold text-slate-muted uppercase tracking-[0.12em]">Conversations</h2>
          <span className="text-[10px] font-mono text-slate-subtle">{threads.length}</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide divide-y divide-onyx-700/30">
        {sections.map((section) => {
          if (section.threads.length === 0) return null;
          return (
            <div key={section.key}>
              <div className="px-4 py-2">
                <span className="text-[10px] font-semibold text-slate-subtle uppercase tracking-wider">{section.label}</span>
              </div>
              {section.threads.map((thread) => (
                <ThreadItem
                  key={thread.id}
                  thread={thread}
                  isActive={thread.id === activeThreadId}
                  onSelect={() => onSelect(thread.id)}
                />
              ))}
            </div>
          );
        })}

        {threads.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <svg className="w-8 h-8 text-slate-subtle mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
            </svg>
            <p className="text-xs text-slate-muted">No conversations yet</p>
            <p className="text-[10px] text-slate-subtle mt-1">Connect with founders to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
}
