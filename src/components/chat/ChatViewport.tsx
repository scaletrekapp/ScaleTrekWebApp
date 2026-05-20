"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChatBubble } from "./ChatBubble";
import { ChatHeader } from "./ChatHeader";
import { ChatInput } from "./ChatInput";
import { MilestoneCard } from "./MilestoneCard";
import { CleanRoomTrigger } from "./CleanRoomTrigger";

interface Message {
  id: string;
  type: "text" | "milestone";
  content: string;
  sender: "me" | "them";
  timestamp: string;
  status: "sent" | "delivered" | "read";
  milestone?: { title: string; description: string; type: "dreamer" | "reality"; verified?: boolean };
}

interface ChatViewportProps {
  founderName: string;
  founderHandle: string;
  momentumScore: number;
  investorVerified: boolean;
  dealStage: string;
  cleanRoomStatus: "none" | "requested" | "granted";
  messages: Message[];
  onSend: (content: string) => void;
  onInsertMilestone: (m: { title: string; description: string; type: "dreamer" | "reality" }) => void;
  onCleanRoomRequest: () => void;
  onCleanRoomGrant: () => void;
  onCleanRoomRevoke: () => void;
  onMilestoneClick?: () => void;
  onBack?: () => void;
}

export function ChatViewport({
  founderName, founderHandle, momentumScore, investorVerified, dealStage,
  cleanRoomStatus, messages, onSend, onInsertMilestone,
  onCleanRoomRequest, onCleanRoomGrant, onCleanRoomRevoke,
  onMilestoneClick, onBack,
}: ChatViewportProps) {
  const [showScrollBtn, setShowScrollBtn] = useState(false);

  return (
    <div className="h-full flex flex-col bg-onyx-900">
      <ChatHeader
        founderName={founderName}
        founderHandle={founderHandle}
        momentumScore={momentumScore}
        investorVerified={investorVerified}
        dealStage={dealStage}
        onBack={onBack}
      />

      {/* Clean Room bar */}
      <div className="shrink-0 px-4 sm:px-6 py-2 border-b border-onyx-700/30 bg-onyx-950/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-subtle uppercase tracking-wider">Data Room</span>
            <span className={`clean-room-badge ${cleanRoomStatus}`}>
              {cleanRoomStatus === "granted" ? "Access Granted" : cleanRoomStatus === "requested" ? "Pending Approval" : "Restricted"}
            </span>
          </div>
          <CleanRoomTrigger
            status={cleanRoomStatus}
            onRequest={onCleanRoomRequest}
            onGrant={onCleanRoomGrant}
            onRevoke={onCleanRoomRevoke}
          />
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 scrollbar-hide" onScroll={(e) => {
        const el = e.currentTarget;
        setShowScrollBtn(el.scrollHeight - el.scrollTop - el.clientHeight > 200);
      }}>
        <div className="max-w-3xl mx-auto">
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div key={msg.id} layout transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}>
                {msg.type === "milestone" && msg.milestone ? (
                  <div className={`flex mb-3 ${msg.sender === "me" ? "justify-end" : "justify-start"}`}>
                    <MilestoneCard
                      title={msg.milestone.title}
                      description={msg.milestone.description}
                      date={msg.timestamp}
                      type={msg.milestone.type}
                      verified={msg.milestone.verified}
                      onClick={onMilestoneClick}
                    />
                  </div>
                ) : (
                  <ChatBubble
                    content={msg.content}
                    sender={msg.sender}
                    timestamp={msg.timestamp}
                    status={msg.status}
                    encrypted={true}
                    senderName={msg.sender === "them" ? founderName : undefined}
                  />
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-12 h-12 rounded-2xl bg-violet/10 border border-violet/20 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-violet-light" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                </svg>
              </div>
              <p className="text-sm text-slate-muted mb-1">No messages yet</p>
              <p className="text-xs text-slate-subtle">E2E-encrypted messages appear here</p>
            </div>
          )}
        </div>
      </div>

      <ChatInput
        onSend={onSend}
        onInsertMilestone={onInsertMilestone}
        disabled={cleanRoomStatus !== "granted"}
        placeholder={cleanRoomStatus !== "granted" ? "Clean Room access required to message..." : "Type an encrypted message..."}
      />
    </div>
  );
}
