"use client";

import { useEffect } from "react";
import { Header, OfflineIndicator } from "@/components/layout";
import { useAppStore } from "@/lib/store/app-store";
import { mockRepository } from "@/lib/data/providers/mock";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const setCurrentUser = useAppStore((state) => state.setCurrentUser);

  // Initialize app with mock user on mount
  useEffect(() => {
    async function init() {
      const result = await mockRepository.getCurrentUser();
      if (result.success && result.data) {
        setCurrentUser(result.data);
      }
    }
    init();
  }, [setCurrentUser]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      <Header />
      <main className="flex-1 flex flex-col overflow-hidden">
        {children}
      </main>
      <OfflineIndicator />
    </div>
  );
}
