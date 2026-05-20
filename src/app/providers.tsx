"use client";

import { ThemeProvider } from "next-themes";
import { useEffect, useState } from "react";
import { I18nextProvider } from "react-i18next";
import i18n from "@/i18n";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase-client";
import { useAuthStore } from "@/stores/useAuthStore";
import { AnimatedGradient } from "@/components/ui/AnimatedGradient";

function SessionRestorer({ children }: { children: React.ReactNode }) {
  const { setUser, setLoading } = useAuthStore();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single()
          .then(({ data: profile }) => {
            if (profile) {
              setUser({
                id: profile.id,
                handle: profile.handle,
                role: profile.role,
                verified: profile.verified,
                realityScore: profile.reality_score,
                momentumScore: profile.momentum_score,
                headline: profile.headline,
                location: profile.location,
                website: profile.website,
                companyName: profile.company_name,
                sector: profile.sector,
                bio: profile.bio,
                isPro: profile.is_pro,
                avatar: profile.avatar_url,
                coverUrl: profile.cover_url,
                joinedAt: profile.created_at,
              });
            } else {
              setLoading(false);
            }
          });
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        useAuthStore.getState().logout();
      }
    });

    return () => subscription.unsubscribe();
  }, [setUser, setLoading]);

  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const lang = pathname?.split("/")[1] || "en";

  useEffect(() => {
    i18n.changeLanguage(lang);
    setMounted(true);
  }, [lang]);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-midnight">
        <div className="w-8 h-8 border-2 border-violet border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} forcedTheme="dark">
      <I18nextProvider i18n={i18n}>
        <SessionRestorer>
          <AnimatedGradient />
          {children}
        </SessionRestorer>
      </I18nextProvider>
    </ThemeProvider>
  );
}
