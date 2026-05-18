"use client";

import { ThemeProvider } from "next-themes";
import { useEffect, useState } from "react";
import { I18nextProvider } from "react-i18next";
import i18n from "@/i18n";
import { usePathname } from "next/navigation";

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
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
    </ThemeProvider>
  );
}
