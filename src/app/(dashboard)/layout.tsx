"use client";

import { AppSidebar, AppHeader } from "@/components/layout";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { useAuth } from "@/lib/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";
import { RepositoryProvider } from "@/lib/data/repository-context";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { loading } = useAuth();

  // Show loading skeleton while auth is being determined
  if (loading) {
    return (
      <div className="flex h-screen bg-background">
        {/* Sidebar skeleton */}
        <div className="hidden lg:flex w-64 flex-col border-r bg-card p-4 gap-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-8 w-1/2" />
          <div className="flex-1" />
          <Skeleton className="h-12 w-full" />
        </div>
        {/* Main content skeleton */}
        <div className="flex-1 flex flex-col">
          <div className="h-14 border-b bg-card px-4 flex items-center gap-4">
            <Skeleton className="h-8 w-8 lg:hidden" />
            <Skeleton className="h-6 w-32" />
            <div className="flex-1" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
          <div className="flex-1 p-6">
            <Skeleton className="h-8 w-48 mb-4" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <RepositoryProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <AppHeader />
          <main className="flex-1 flex flex-col overflow-hidden bg-background">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </RepositoryProvider>
  );
}
