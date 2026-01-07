"use client";

import { useEffect } from "react";
import { AppSidebar, AppHeader } from "@/components/layout";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
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
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <AppHeader />
        <main className="flex-1 flex flex-col overflow-hidden bg-background">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
