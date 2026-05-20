"use client";

import { useState, useCallback } from "react";
import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { ChatViewport } from "@/components/chat/ChatViewport";
import { useTranslation } from "react-i18next";

interface Message {
  id: string;
  type: "text" | "milestone";
  content: string;
  sender: "me" | "them";
  timestamp: string;
  status: "sent" | "delivered" | "read";
  milestone?: { title: string; description: string; type: "dreamer" | "reality"; verified?: boolean };
}

// ── Mock data — replace with real Supabase queries ──
const MOCK_THREADS = [
  { id: "t1", participantName: "Youssef Kamal", participantHandle: "youssef_k", lastMessage: "MVP is live, check the audit log", timestamp: "2m", unread: 2, status: "in_clean_room" as const, momentumScore: 78, online: true },
  { id: "t2", participantName: "Amina Rami", participantHandle: "amina_r", lastMessage: "Would you like to review the traction data?", timestamp: "1h", unread: 0, status: "inquiry" as const, momentumScore: 62, online: false },
  { id: "t3", participantName: "Karim Ouali", participantHandle: "karim_o", lastMessage: "Deck attached for Series A discussion", timestamp: "3d", unread: 0, status: "archived" as const, momentumScore: 44, online: false },
];

const MOCK_MESSAGES: Message[] = [
  { id: "m1", type: "text", content: "Assalamu alaykum, thanks for connecting. I'd love to share our latest traction.", sender: "them", timestamp: "10:32 AM", status: "read" },
  { id: "m2", type: "text", content: "Wa alaykum salam! Absolutely, I've been following your journey since the MVP launch.", sender: "me", timestamp: "10:33 AM", status: "read" },
  { id: "m3", type: "milestone", content: "", sender: "them", timestamp: "10:35 AM", status: "read", milestone: { title: "MVP V1 Deployed", description: "Core platform launched with 200+ early adopters and first revenue cycle initiated.", type: "reality", verified: true } },
  { id: "m4", type: "text", content: "We've just crossed $4.2K MRR with 12 paying customers. The clean room has the full breakdown.", sender: "them", timestamp: "10:36 AM", status: "read" },
  { id: "m5", type: "text", content: "Impressive growth rate. Let me request access to review the numbers.", sender: "me", timestamp: "10:38 AM", status: "delivered" },
];

export default function ChatPage({ params: { lang } }: { params: { lang: string } }) {
  const { t } = useTranslation();
  const [activeThreadId, setActiveThreadId] = useState<string | null>("t1");
  const [showMobileList, setShowMobileList] = useState(true);
  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES);
  const [cleanRoomStatus, setCleanRoomStatus] = useState<"none" | "requested" | "granted">("granted");
  const [dealStage] = useState("negotiating");

  const activeThread = MOCK_THREADS.find((t) => t.id === activeThreadId);

  const handleSend = useCallback((content: string) => {
    const newMsg = {
      id: `m${Date.now()}`,
      type: "text" as const,
      content,
      sender: "me" as const,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      status: "sent" as const,
    };
    setMessages((prev) => [...prev, newMsg]);
  }, []);

  const handleInsertMilestone = useCallback((m: { title: string; description: string; type: "dreamer" | "reality" }) => {
    const newMsg = {
      id: `m${Date.now()}`,
      type: "milestone" as const,
      content: "",
      sender: "me" as const,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      status: "sent" as const,
      milestone: { ...m, verified: false },
    };
    setMessages((prev) => [...prev, newMsg]);
  }, []);

  const handleSelectThread = (id: string) => {
    setActiveThreadId(id);
    setShowMobileList(false);
  };

  return (
    <div className="h-[calc(100vh-4rem)] -mx-4 sm:-mx-6 lg:-mx-8 flex">
      {/* Mobile: toggle between list and viewport */}
      <div className={`w-full sm:w-80 lg:w-96 shrink-0 ${showMobileList ? "block" : "hidden sm:block"}`}>
        <ChatSidebar
          threads={MOCK_THREADS}
          activeThreadId={activeThreadId}
          onSelect={handleSelectThread}
        />
      </div>

      <div className={`flex-1 min-w-0 ${showMobileList ? "hidden sm:block" : "block"}`}>
        {activeThread ? (
          <ChatViewport
            founderName={activeThread.participantName}
            founderHandle={activeThread.participantHandle}
            momentumScore={activeThread.momentumScore}
            investorVerified={true}
            dealStage={dealStage}
            cleanRoomStatus={cleanRoomStatus}
            messages={messages}
            onSend={handleSend}
            onInsertMilestone={handleInsertMilestone}
            onCleanRoomRequest={() => setCleanRoomStatus("requested")}
            onCleanRoomGrant={() => setCleanRoomStatus("granted")}
            onCleanRoomRevoke={() => setCleanRoomStatus("none")}
            onMilestoneClick={() => {}}
            onBack={() => setShowMobileList(true)}
          />
        ) : (
          <div className="h-full flex items-center justify-center bg-onyx-900">
            <div className="text-center">
              <svg className="w-12 h-12 text-slate-subtle mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
              </svg>
              <p className="text-sm text-slate-muted">Select a conversation</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
