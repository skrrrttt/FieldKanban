"use client";

import { useState } from "react";
import { User, Mail, Shield, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AvatarUpload } from "./AvatarUpload";
import type { User as UserType } from "@/types";
import { toast } from "sonner";

interface ProfileSectionProps {
  user: UserType;
  onUpdateProfile: (updates: { name?: string }) => Promise<void>;
  onUploadAvatar: (file: Blob, fileName: string) => Promise<void>;
  isUpdating?: boolean;
  isUploadingAvatar?: boolean;
}

export function ProfileSection({
  user,
  onUpdateProfile,
  onUploadAvatar,
  isUpdating = false,
  isUploadingAvatar = false,
}: ProfileSectionProps) {
  const [name, setName] = useState(user.name);
  const [hasChanges, setHasChanges] = useState(false);

  const handleNameChange = (value: string) => {
    setName(value);
    setHasChanges(value !== user.name);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }

    try {
      await onUpdateProfile({ name: name.trim() });
      setHasChanges(false);
      toast.success("Profile updated");
    } catch {
      toast.error("Failed to update profile");
    }
  };

  const handleAvatarUpload = async (file: Blob, fileName: string) => {
    try {
      await onUploadAvatar(file, fileName);
      toast.success("Avatar updated");
    } catch (error) {
      toast.error("Failed to upload avatar");
      throw error;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5" />
          Profile Information
        </CardTitle>
        <CardDescription>
          Update your profile picture and display name.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Avatar Upload */}
        <AvatarUpload
          currentAvatarUrl={user.avatarUrl}
          userName={user.name}
          onUpload={handleAvatarUpload}
          isUploading={isUploadingAvatar}
        />

        {/* Profile Form */}
        <div className="space-y-4">
          {/* Display Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Display Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Your display name"
              disabled={isUpdating}
            />
            <p className="text-xs text-muted-foreground">
              This is how your name appears to other users.
            </p>
          </div>

          {/* Email (Read-only) */}
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="email"
                value={user.email}
                disabled
                className="pl-10 bg-muted cursor-not-allowed"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Email is managed through your Google account.
            </p>
          </div>

          {/* Role Badge */}
          <div className="space-y-2">
            <Label>Role</Label>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-muted-foreground" />
              <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                {user.role === "admin" ? "Administrator" : "Field User"}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              {user.role === "admin"
                ? "You have full access to manage jobs, tasks, and users."
                : "You can view and update tasks assigned to you."}
            </p>
          </div>
        </div>

        {/* Save Button */}
        {hasChanges && (
          <div className="flex justify-end pt-4 border-t">
            <Button onClick={handleSave} disabled={isUpdating}>
              {isUpdating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
