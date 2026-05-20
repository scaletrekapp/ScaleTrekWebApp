"use client";

import { motion } from "framer-motion";

interface ChatBubbleProps {
  content: string;
  sender: "me" | "them";
  timestamp: string;
  status?: "sent" | "delivered" | "read";
  encrypted?: boolean;
  senderName?: string;
  senderAvatar?: string;
}

export function ChatBubble({ content, sender, timestamp, status = "sent", encrypted = true, senderName, senderAvatar }: ChatBubbleProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className={`flex ${sender === "me" ? "justify-end" : "justify-start"} mb-3`}
    >
      {sender === "them" && (
        <div className="flex items-end mr-2 shrink-0">
          <div className="w-7 h-7 rounded-full bg-violet/15 flex items-center justify-center text-[10px] font-bold text-violet-light">
            {senderAvatar ? (
              <img src={senderAvatar} alt="" className="w-full h-full rounded-full object-cover" />
            ) : (
              senderName?.charAt(0).toUpperCase() || "?"
            )}
          </div>
        </div>
      )}

      <div className={`max-w-[70%] min-w-[120px] ${sender === "me" ? "items-end" : "items-start"}`}>
        <div
          className={`chat-bubble ${sender === "me" ? "sent" : "received"} ${
            sender === "me" ? "rounded-br-md" : "rounded-bl-md"
          }`}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{content}</p>
        </div>

        <div className={`flex items-center gap-2 mt-1 px-1 ${sender === "me" ? "justify-end" : "justify-start"}`}>
          <span className="text-micro font-mono text-subdued">{timestamp}</span>

          {encrypted && sender === "me" && (
            <span className="flex items-center gap-0.5 text-micro text-emerald/70 font-mono" title="End-to-end encrypted">
              <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
              E2EE
            </span>
          )}

          {sender === "me" && (
            <span className="flex items-center" title={`${status.charAt(0).toUpperCase() + status.slice(1)}`}>
              {status === "sent" && (
                <svg className="w-3 h-3 text-slate-subtle" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              )}
              {status === "delivered" && (
                <svg className="w-3 h-3 text-slate-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              {status === "read" && (
                <svg className="w-3 h-3 text-emerald" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
