import { create } from "zustand";

interface SubscriptionState {
  tier: "free" | "pro";
  status: "active" | "inactive" | "past_due" | null;
  isPro: boolean;
  interestRegistered: boolean;
  setSubscription: (tier: "free" | "pro", status: "active" | "inactive" | "past_due" | null) => void;
  setInterestRegistered: (v: boolean) => void;
}

export const useSubscriptionStore = create<SubscriptionState>((set) => ({
  tier: "free",
  status: null,
  isPro: false,
  interestRegistered: false,
  setSubscription: (tier, status) =>
    set({ tier, status, isPro: tier === "pro" && status === "active" }),
  setInterestRegistered: (interestRegistered) => set({ interestRegistered }),
}));
