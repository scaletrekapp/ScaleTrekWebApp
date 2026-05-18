export interface User {
  id: string;
  handle: string;
  avatar?: string;
  coverUrl?: string;
  role: "dreamer" | "investor" | "admin";
  verified: boolean;
  realityScore: number;
  momentumScore: number;
  joinedAt: string;
  publicKey?: string;
  headline?: string;
  location?: string;
  website?: string;
  companyName?: string;
  sector?: string;
  bio?: string;
  isPro?: boolean;
  onboarded?: boolean;
}

export interface ShowcasePost {
  id: string;
  userId: string;
  user: User;
  type: "dreamer" | "reality";
  title: string;
  description: string;
  mediaUrl?: string;
  mediaType?: "image" | "video";
  milestone: string;
  milestoneDate: string;
  likes: number;
  comments: number;
  signals: number;
  riskLevel: number;
  createdAt: string;
  realityScore?: "gold" | "platinum";
  liked?: boolean;
  signaled?: boolean;
  media?: PostMedia[];
}

export interface PostMedia {
  id: string;
  postId: string;
  url: string;
  type: "image" | "video";
  order: number;
}

export interface InvestorProfile {
  id: string;
  handle: string;
  avatar: string;
  riskTolerance: number;
  portfolioSize: number;
  connectedDreamers: string[];
}

export interface ChatMessage {
  id: string;
  threadId: string;
  senderId: string;
  content: string;
  encrypted?: boolean;
  nonce?: string;
  createdAt: string;
  read: boolean;
}

export interface ChatThread {
  id: string;
  participants: string[];
  dealStage: "exploring" | "negotiating" | "committed" | "closed";
  lastMessage?: ChatMessage;
  createdAt: string;
}

export interface Deal {
  id: string;
  dreamerId: string;
  investorId: string;
  stage: DealStage;
  amount?: number;
  currency?: string;
  terms?: string;
  createdAt: string;
  updatedAt: string;
}

export type DealStage = "exploring" | "negotiating" | "committed" | "closed";

export interface AppNotification {
  id: string;
  type: "like" | "connect" | "invest" | "milestone" | "verify" | "message";
  title: string;
  body: string;
  fromHandle: string;
  fromAvatar?: string;
  read: boolean;
  createdAt: Date | string;
  postId?: string;
}

export type FeedMode = "dreamer" | "reality" | "explore";
export type SortMode = "recent" | "top";
