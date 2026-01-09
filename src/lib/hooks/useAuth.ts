"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAppStore } from "@/lib/store/app-store";
import { clearAllData } from "@/lib/data/local-db";
import type { User } from "@/types";

interface UseAuthReturn {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const router = useRouter();
  const currentUser = useAppStore((state) => state.currentUser);
  const setCurrentUser = useAppStore((state) => state.setCurrentUser);
  const reset = useAppStore((state) => state.reset);

  // Only show loading on initial mount when we don't have a user yet
  const [loading, setLoading] = useState(!currentUser);
  const initializedRef = useRef(false);

  // Fetch user profile from Supabase
  const fetchProfile = useCallback(
    async (userId: string) => {
      try {
        const supabase = createClient();
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .single();

        if (error) {
          console.error("Error fetching profile:", error);
          // Profile might not exist yet (trigger delay)
          // Retry once after a short delay
          await new Promise((resolve) => setTimeout(resolve, 1000));
          const { data: retryProfile, error: retryError } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", userId)
            .single();

          if (retryError || !retryProfile) {
            console.error("Profile not found after retry:", retryError);
            return;
          }

          const user: User = {
            id: retryProfile.id,
            email: retryProfile.email,
            name: retryProfile.name,
            role: retryProfile.role as "admin" | "field",
            avatarUrl: retryProfile.avatar_url ?? undefined,
            createdAt: new Date(retryProfile.created_at),
          };
          setCurrentUser(user);
          return;
        }

        if (profile) {
          const user: User = {
            id: profile.id,
            email: profile.email,
            name: profile.name,
            role: profile.role as "admin" | "field",
            avatarUrl: profile.avatar_url ?? undefined,
            createdAt: new Date(profile.created_at),
          };
          setCurrentUser(user);
        }
      } catch (err) {
        console.error("Unexpected error fetching profile:", err);
      }
    },
    [setCurrentUser]
  );

  useEffect(() => {
    const supabase = createClient();

    // Get initial user - using getUser() validates the session with the server
    // This is more secure than getSession() which only reads from local storage
    const initializeAuth = async () => {
      // Skip if already initialized or we already have a user in store
      if (initializedRef.current) {
        setLoading(false);
        return;
      }

      // If we already have a user in the store, just verify the session
      if (currentUser) {
        console.log("[useAuth] User already in store, skipping full init");
        setLoading(false);
        initializedRef.current = true;
        return;
      }

      try {
        // Add timeout to prevent hanging
        const timeoutPromise = new Promise<{ data: { user: null }; error: Error }>((_, reject) =>
          setTimeout(() => reject(new Error("Auth timeout")), 5000)
        );

        const authPromise = supabase.auth.getUser();
        const result = await Promise.race([authPromise, timeoutPromise]);

        const { data: { user }, error } = result;

        if (error) {
          console.log("[useAuth] No valid session:", error.message);
        }

        if (user) {
          console.log("[useAuth] User found, fetching profile:", user.id);
          await fetchProfile(user.id);
        } else {
          console.log("[useAuth] No user found");
        }
      } catch (err) {
        console.error("[useAuth] Error initializing auth:", err);
      } finally {
        setLoading(false);
        initializedRef.current = true;
      }
    };

    initializeAuth();

    // Subscribe to auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("[useAuth] Auth state changed:", event);

      if (event === "SIGNED_IN" && session?.user) {
        // Only show loading if we don't already have a user
        if (!currentUser) {
          setLoading(true);
        }
        await fetchProfile(session.user.id);
        setLoading(false);
      } else if (event === "SIGNED_OUT") {
        reset();
        initializedRef.current = false;
        setLoading(false);
      } else if (event === "TOKEN_REFRESHED") {
        // Session refreshed, no action needed - don't change loading state
        console.log("[useAuth] Token refreshed");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchProfile, reset]);

  // Sign out function
  const signOut = useCallback(async () => {
    try {
      setLoading(true);
      const supabase = createClient();

      // Sign out from Supabase
      await supabase.auth.signOut();

      // Clear local state
      reset();

      // Clear IndexedDB data
      await clearAllData();

      // Redirect to login
      router.push("/login");
    } catch (err) {
      console.error("Error signing out:", err);
    } finally {
      setLoading(false);
    }
  }, [reset, router]);

  return {
    user: currentUser,
    loading,
    signOut,
  };
}
