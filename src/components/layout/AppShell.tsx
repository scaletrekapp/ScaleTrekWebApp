"use client";

import { type ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { RightPanel } from "./RightPanel";

interface AppShellProps {
  children: ReactNode;
  lang: string;
  showRightPanel?: boolean;
}

export function AppShell({ children, lang, showRightPanel = true }: AppShellProps) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar lang={lang} />
      <main className="flex-1 overflow-y-auto min-w-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </div>
      </main>
      {showRightPanel && <RightPanel lang={lang} />}
    </div>
  );
}
