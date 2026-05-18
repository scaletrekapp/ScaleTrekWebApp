import { create } from "zustand";
import { ShowcasePost, FeedMode, SortMode } from "@/types";

interface FeedState {
  posts: ShowcasePost[];
  feedView: FeedMode;
  sortMode: SortMode;
  isLoading: boolean;
  setPosts: (posts: ShowcasePost[]) => void;
  setFeedView: (view: FeedMode) => void;
  setSortMode: (mode: SortMode) => void;
  setLoading: (loading: boolean) => void;
  toggleLike: (postId: string) => void;
  toggleSignal: (postId: string) => void;
}

export const useFeedStore = create<FeedState>((set) => ({
  posts: [],
  feedView: "explore",
  sortMode: "recent",
  isLoading: false,
  setPosts: (posts) => set({ posts }),
  setFeedView: (feedView) => set({ feedView }),
  setSortMode: (sortMode) => set({ sortMode }),
  setLoading: (isLoading) => set({ isLoading }),
  toggleLike: (postId) =>
    set((state) => ({
      posts: state.posts.map((p) =>
        p.id === postId ? { ...p, likes: p.likes + (p.liked ? -1 : 1), liked: !p.liked } : p
      ),
    })),
  toggleSignal: (postId) =>
    set((state) => ({
      posts: state.posts.map((p) =>
        p.id === postId ? { ...p, signals: p.signals + (p.signaled ? -1 : 1), signaled: !p.signaled } : p
      ),
    })),
}));
