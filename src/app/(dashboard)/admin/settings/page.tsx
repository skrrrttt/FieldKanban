"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Columns3, Bell, Building2 } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="flex-1 overflow-auto p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Settings</h1>
            <p className="text-muted-foreground">
              Configure your organization&apos;s preferences
            </p>
          </div>
        </div>

        {/* Settings Sections */}
        <div className="grid gap-6">
          {/* Default Columns */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Columns3 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle>Default Kanban Columns</CardTitle>
                  <CardDescription>
                    Configure the default columns for new jobs
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-muted/50 rounded-lg p-4 mb-4">
                <p className="text-sm text-muted-foreground">
                  When you create a new job, it will automatically include these columns:
                </p>
                <div className="flex flex-wrap gap-2 mt-3">
                  {[
                    { name: "To Do", color: "#6b7280" },
                    { name: "In Progress", color: "#3b82f6" },
                    { name: "Review", color: "#f59e0b" },
                    { name: "Done", color: "#22c55e" },
                  ].map((col) => (
                    <div
                      key={col.name}
                      className="flex items-center gap-2 bg-background rounded px-3 py-1.5 border"
                    >
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: col.color }}
                      />
                      <span className="text-sm">{col.name}</span>
                    </div>
                  ))}
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Column customization coming soon. For now, you can edit columns
                within each job.
              </p>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Bell className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle>Notifications</CardTitle>
                  <CardDescription>
                    Configure push notifications and alerts
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Push notification settings coming soon. You&apos;ll be able to configure
                when and how team members receive notifications about task updates.
              </p>
            </CardContent>
          </Card>

          {/* Organization */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle>Organization</CardTitle>
                  <CardDescription>
                    Manage your organization profile
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Organization settings coming soon. You&apos;ll be able to customize
                your company name, logo, and other branding options.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
