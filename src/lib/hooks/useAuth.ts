"use client";

import { useEffect, useState, useCallback } from "react";
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
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const currentUser = useAppStore((state) => state.currentUser);
  const setCurrentUser = useAppStore((state) => state.setCurrentUser);
  const reset = useAppStore((state) => state.reset);

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

    // Get initial session
    const initializeAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user) {
          await fetchProfile(session.user.id);
        }
      } catch (err) {
        console.error("Error initializing auth:", err);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Subscribe to auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        setLoading(true);
        await fetchProfile(session.user.id);
        setLoading(false);
      } else if (event === "SIGNED_OUT") {
        reset();
        setLoading(false);
      } else if (event === "TOKEN_REFRESHED") {
        // Session refreshed, no action needed
      }
    });

    return () => {
      subscription.unsubscribe();
    };
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
