"use client";

import { useEffect, useState, useCallback } from "react";
import { Settings, User, Bell, Shield } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { ProfileSection } from "@/components/settings/ProfileSection";
import { NotificationSection } from "@/components/settings/NotificationSection";
import { AdminSection } from "@/components/settings/AdminSection";
import { useAppStore } from "@/lib/store/app-store";
import { useRepository } from "@/lib/data/repository-context";
import type { UserPreferences, UserPreferencesUpdate } from "@/types";
import { toast } from "sonner";

function SettingsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>
      <Skeleton className="h-10 w-full max-w-md" />
      <div className="space-y-4">
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const currentUser = useAppStore((state) => state.currentUser);
  const setCurrentUser = useAppStore((state) => state.setCurrentUser);
  const repository = useRepository();

  const isAdmin = currentUser?.role === "admin";

  // Load user preferences
  useEffect(() => {
    async function loadPreferences() {
      if (!currentUser) return;

      setIsLoading(true);
      try {
        const result = await repository.getUserPreferences(currentUser.id);
        if (result.success && result.data) {
          setPreferences(result.data);
        }
      } catch {
        toast.error("Failed to load preferences");
      } finally {
        setIsLoading(false);
      }
    }

    loadPreferences();
  }, [currentUser, repository]);

  // Update profile (name)
  const handleUpdateProfile = useCallback(
    async (updates: { name?: string }) => {
      if (!currentUser) return;

      setIsUpdatingProfile(true);
      try {
        const result = await repository.updateUser(currentUser.id, updates);
        if (result.success && result.data) {
          setCurrentUser(result.data);
        } else {
          throw new Error(result.error || "Failed to update profile");
        }
      } finally {
        setIsUpdatingProfile(false);
      }
    },
    [currentUser, repository, setCurrentUser]
  );

  // Upload avatar
  const handleUploadAvatar = useCallback(
    async (file: Blob, fileName: string) => {
      if (!currentUser) return;

      setIsUploadingAvatar(true);
      try {
        const result = await repository.uploadAvatar(currentUser.id, file, fileName);
        if (result.success && result.data) {
          // Update local user state with new avatar URL
          setCurrentUser({
            ...currentUser,
            avatarUrl: result.data,
          });
        } else {
          throw new Error(result.error || "Failed to upload avatar");
        }
      } finally {
        setIsUploadingAvatar(false);
      }
    },
    [currentUser, repository, setCurrentUser]
  );

  // Update notification preferences
  const handleUpdatePreferences = useCallback(
    async (updates: UserPreferencesUpdate) => {
      if (!currentUser || !preferences) return;

      // Optimistic update
      setPreferences((prev) => (prev ? { ...prev, ...updates } : prev));

      try {
        const result = await repository.updateUserPreferences(currentUser.id, updates);
        if (result.success && result.data) {
          setPreferences(result.data);
        } else {
          throw new Error(result.error || "Failed to update preferences");
        }
      } catch (error) {
        // Revert on error - reload preferences
        const result = await repository.getUserPreferences(currentUser.id);
        if (result.success && result.data) {
          setPreferences(result.data);
        }
        throw error;
      }
    },
    [currentUser, preferences, repository]
  );

  if (!currentUser) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-muted-foreground">Please sign in to view settings.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-3xl mx-auto p-4 sm:p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Settings className="w-6 h-6" />
            Account Settings
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your profile and preferences
          </p>
        </div>

        {isLoading ? (
          <SettingsSkeleton />
        ) : (
          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className={`grid w-full ${isAdmin ? "grid-cols-3" : "grid-cols-2"}`}>
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">Profile</span>
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center gap-2">
                <Bell className="w-4 h-4" />
                <span className="hidden sm:inline">Notifications</span>
              </TabsTrigger>
              {isAdmin && (
                <TabsTrigger value="admin" className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  <span className="hidden sm:inline">Admin</span>
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="profile" className="space-y-6">
              <ProfileSection
                user={currentUser}
                onUpdateProfile={handleUpdateProfile}
                onUploadAvatar={handleUploadAvatar}
                isUpdating={isUpdatingProfile}
                isUploadingAvatar={isUploadingAvatar}
              />
            </TabsContent>

            <TabsContent value="notifications" className="space-y-6">
              {preferences && (
                <NotificationSection
                  preferences={preferences}
                  onUpdate={handleUpdatePreferences}
                />
              )}
            </TabsContent>

            {isAdmin && (
              <TabsContent value="admin" className="space-y-6">
                <AdminSection />
              </TabsContent>
            )}
          </Tabs>
        )}
      </div>
    </div>
  );
}
