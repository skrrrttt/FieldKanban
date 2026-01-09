"use client";

import { useState, useEffect, useCallback } from "react";
import { Bell, AtSign, Clock, Info } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { UserPreferences, UserPreferencesUpdate } from "@/types";
import { toast } from "sonner";

interface NotificationSectionProps {
  preferences: UserPreferences;
  onUpdate: (updates: UserPreferencesUpdate) => Promise<void>;
}

interface NotificationSettingProps {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
}

function NotificationSetting({
  id,
  icon,
  title,
  description,
  checked,
  onCheckedChange,
  disabled = false,
}: NotificationSettingProps) {
  return (
    <div className="flex items-start justify-between gap-4 py-4 border-b last:border-b-0">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 text-muted-foreground">{icon}</div>
        <div className="space-y-1">
          <Label htmlFor={id} className="text-sm font-medium cursor-pointer">
            {title}
          </Label>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      <Switch
        id={id}
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
      />
    </div>
  );
}

export function NotificationSection({
  preferences,
  onUpdate,
}: NotificationSectionProps) {
  const [localPrefs, setLocalPrefs] = useState(preferences);
  const [pendingUpdate, setPendingUpdate] = useState<UserPreferencesUpdate | null>(null);

  // Debounced update
  useEffect(() => {
    if (!pendingUpdate) return;

    const timeout = setTimeout(async () => {
      try {
        await onUpdate(pendingUpdate);
        toast.success("Notification preferences updated");
      } catch {
        // Revert on error
        setLocalPrefs(preferences);
        toast.error("Failed to update preferences");
      }
      setPendingUpdate(null);
    }, 500);

    return () => clearTimeout(timeout);
  }, [pendingUpdate, onUpdate, preferences]);

  const handleChange = useCallback(
    (key: keyof UserPreferencesUpdate, value: boolean) => {
      setLocalPrefs((prev) => ({ ...prev, [key]: value }));
      setPendingUpdate((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Email Notifications
            </CardTitle>
            <CardDescription>
              Choose which email notifications you want to receive.
            </CardDescription>
          </div>
          <Badge variant="outline" className="text-xs">
            <Info className="w-3 h-3 mr-1" />
            Coming Soon
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="divide-y">
          <NotificationSetting
            id="task-assigned"
            icon={<Bell className="w-4 h-4" />}
            title="Task Assignments"
            description="Receive an email when you are assigned to a new task."
            checked={localPrefs.emailOnTaskAssigned}
            onCheckedChange={(checked) => handleChange("emailOnTaskAssigned", checked)}
          />

          <NotificationSetting
            id="comment-mention"
            icon={<AtSign className="w-4 h-4" />}
            title="Comment Mentions"
            description="Receive an email when someone mentions you in a comment."
            checked={localPrefs.emailOnCommentMention}
            onCheckedChange={(checked) => handleChange("emailOnCommentMention", checked)}
          />

          <NotificationSetting
            id="task-due-soon"
            icon={<Clock className="w-4 h-4" />}
            title="Upcoming Due Dates"
            description="Receive a reminder email when tasks are due within 24 hours."
            checked={localPrefs.emailOnTaskDueSoon}
            onCheckedChange={(checked) => handleChange("emailOnTaskDueSoon", checked)}
          />
        </div>

        <p className="text-xs text-muted-foreground mt-4 pt-4 border-t">
          Email notifications are saved automatically. Actual email sending will be implemented in a future update.
        </p>
      </CardContent>
    </Card>
  );
}
