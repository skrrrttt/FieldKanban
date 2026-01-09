"use client";

/**
 * Repository Context
 *
 * Provides the data repository to all components via React context.
 * Uses the Supabase provider by default, can be swapped for testing.
 */

import { createContext, useContext, useMemo, type ReactNode } from "react";
import type { DataRepository } from "./repository";
import { SupabaseRepository } from "./providers/supabase";

// ============================================
// Context
// ============================================
const RepositoryContext = createContext<DataRepository | null>(null);

// ============================================
// Provider Props
// ============================================
interface RepositoryProviderProps {
  children: ReactNode;
  /** Optional custom repository (for testing) */
  repository?: DataRepository;
}

// ============================================
// Provider Component
// ============================================
export function RepositoryProvider({
  children,
  repository,
}: RepositoryProviderProps) {
  // Use provided repository or create Supabase repository
  const repo = useMemo(
    () => repository ?? new SupabaseRepository(),
    [repository]
  );

  return (
    <RepositoryContext.Provider value={repo}>
      {children}
    </RepositoryContext.Provider>
  );
}

// ============================================
// Hook
// ============================================
export function useRepository(): DataRepository {
  const context = useContext(RepositoryContext);

  if (!context) {
    throw new Error(
      "useRepository must be used within a RepositoryProvider. " +
        "Make sure your component is wrapped with <RepositoryProvider>."
    );
  }

  return context;
}
