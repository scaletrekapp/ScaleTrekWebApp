"use client";

import { usePathname } from "next/navigation";
import { type ReactNode } from "react";
import { AppShell } from "@/components/layout/AppShell";

interface LayoutProviderProps {
  children: ReactNode;
  lang: string;
}

export function LayoutProvider({ children, lang }: LayoutProviderProps) {
  const pathname = usePathname();

  // Auth landing page gets no sidebar shell
  if (pathname === `/${lang}`) {
    return <>{children}</>;
  }

  return (
    <AppShell lang={lang}>
      {children}
    </AppShell>
  );
}
