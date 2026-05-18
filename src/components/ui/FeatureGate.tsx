"use client";

import { useSubscriptionStore } from "@/stores/useSubscriptionStore";
import Link from "next/link";

interface FeatureGateProps {
  feature: "video" | "multi_media" | "badge" | "analytics";
  children: React.ReactNode;
  fallback?: React.ReactNode;
  lang?: string;
}

export function FeatureGate({ feature, children, fallback, lang }: FeatureGateProps) {
  const { isPro } = useSubscriptionStore();

  if (isPro) return <>{children}</>;

  if (fallback) return <>{fallback}</>;

  return (
    <div className="relative group">
      <div className="pointer-events-none select-none opacity-40 blur-[1px]">{children}</div>
      <div className="absolute inset-0 flex items-center justify-center">
        <Link
          href={`/${lang || "en"}/subscription`}
          className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-violet to-violet-dark text-white text-xs font-semibold hover:brightness-110 transition-all shadow-lg shadow-violet/20"
        >
          Pro Feature
        </Link>
      </div>
    </div>
  );
}
