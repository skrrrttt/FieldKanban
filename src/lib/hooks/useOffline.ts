"use client";

import { useState, useEffect, useCallback } from "react";
import { getPendingSyncOperations } from "@/lib/data/local-db";
import type { OfflineState } from "@/types";

/**
 * Hook to track online/offline status and pending sync operations
 */
export function useOffline(): OfflineState & { refresh: () => Promise<void> } {
  const [state, setState] = useState<OfflineState>({
    isOnline: typeof navigator !== "undefined" ? navigator.onLine : true,
    pendingOperations: 0,
    lastSyncedAt: undefined,
  });

  const refresh = useCallback(async () => {
    try {
      const pending = await getPendingSyncOperations();
      setState((prev) => ({
        ...prev,
        pendingOperations: pending.length,
      }));
    } catch (error) {
      console.error("Failed to get pending operations:", error);
    }
  }, []);

  useEffect(() => {
    const handleOnline = () => {
      setState((prev) => ({ ...prev, isOnline: true }));
      refresh();
    };

    const handleOffline = () => {
      setState((prev) => ({ ...prev, isOnline: false }));
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Initial check
    refresh();

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [refresh]);

  return { ...state, refresh };
}
