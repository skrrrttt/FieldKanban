"use client";

import { WifiOff, RefreshCw } from "lucide-react";
import { useOffline } from "@/lib/hooks/useOffline";
import { cn } from "@/lib/utils";

export function OfflineIndicator() {
  const { isOnline, pendingOperations } = useOffline();

  // Don't show if online and no pending operations
  if (isOnline && pendingOperations === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        "fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-auto",
        "flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg",
        "text-sm font-medium z-50",
        isOnline
          ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
          : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      )}
    >
      {isOnline ? (
        <>
          <RefreshCw className="w-4 h-4 animate-spin" />
          <span>Syncing {pendingOperations} changes...</span>
        </>
      ) : (
        <>
          <WifiOff className="w-4 h-4" />
          <span>
            You&apos;re offline
            {pendingOperations > 0 && ` • ${pendingOperations} changes pending`}
          </span>
        </>
      )}
    </div>
  );
}
