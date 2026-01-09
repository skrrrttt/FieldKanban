"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Briefcase,
  Users,
  CheckCircle2,
  Clock,
  Plus,
  UserPlus,
  Settings,
  FolderOpen
} from "lucide-react";

interface DashboardStats {
  activeJobs: number;
  fieldUsers: number;
  completedThisWeek: number;
  pendingTasks: number;
}

function StatCard({
  title,
  value,
  icon: Icon,
  loading
}: {
  title: string;
  value: number;
  icon: React.ElementType;
  loading: boolean;
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            {loading ? (
              <>
                <Skeleton className="h-8 w-16 mb-1" />
                <Skeleton className="h-4 w-24" />
              </>
            ) : (
              <>
                <p className="text-3xl font-bold">{value}</p>
                <p className="text-sm text-muted-foreground">{title}</p>
              </>
            )}
          </div>
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Icon className="h-6 w-6 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function QuickActionCard({
  title,
  description,
  href,
  icon: Icon
}: {
  title: string;
  description: string;
  href: string;
  icon: React.ElementType;
}) {
  return (
    <Link href={href}>
      <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
        <CardContent className="p-4 flex items-center gap-4">
          <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
            <Icon className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="min-w-0">
            <p className="font-medium truncate">{title}</p>
            <p className="text-sm text-muted-foreground truncate">{description}</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    activeJobs: 0,
    fieldUsers: 0,
    completedThisWeek: 0,
    pendingTasks: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      const supabase = createClient();

      try {
        // Fetch active jobs count
        const { count: jobsCount } = await supabase
          .from("jobs")
          .select("*", { count: "exact", head: true })
          .eq("status", "active");

        // Fetch field users count
        const { count: usersCount } = await supabase
          .from("profiles")
          .select("*", { count: "exact", head: true })
          .eq("role", "field");

        // Fetch tasks completed this week
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const { count: completedCount } = await supabase
          .from("tasks")
          .select("*", { count: "exact", head: true })
          .gte("updated_at", weekAgo.toISOString());

        // Fetch total tasks (as pending for now)
        const { count: tasksCount } = await supabase
          .from("tasks")
          .select("*", { count: "exact", head: true });

        setStats({
          activeJobs: jobsCount || 0,
          fieldUsers: usersCount || 0,
          completedThisWeek: completedCount || 0,
          pendingTasks: tasksCount || 0,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  return (
    <div className="flex-1 overflow-auto p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">
              Manage your organization&apos;s jobs, users, and settings
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/admin/users">
                <UserPlus className="h-4 w-4 mr-2" />
                Invite User
              </Link>
            </Button>
            <Button asChild>
              <Link href="/admin/jobs/new">
                <Plus className="h-4 w-4 mr-2" />
                New Job
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Active Jobs"
            value={stats.activeJobs}
            icon={Briefcase}
            loading={loading}
          />
          <StatCard
            title="Field Users"
            value={stats.fieldUsers}
            icon={Users}
            loading={loading}
          />
          <StatCard
            title="Updated This Week"
            value={stats.completedThisWeek}
            icon={CheckCircle2}
            loading={loading}
          />
          <StatCard
            title="Total Tasks"
            value={stats.pendingTasks}
            icon={Clock}
            loading={loading}
          />
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <QuickActionCard
              title="Manage Users"
              description="View and manage team members"
              href="/admin/users"
              icon={Users}
            />
            <QuickActionCard
              title="View All Jobs"
              description="Browse and manage all jobs"
              href="/admin/jobs"
              icon={FolderOpen}
            />
            <QuickActionCard
              title="Settings"
              description="Configure app settings"
              href="/admin/settings"
              icon={Settings}
            />
          </div>
        </div>

        {/* Recent Activity Placeholder */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
          <Card>
            <CardHeader>
              <CardDescription>
                Activity feed coming soon. This will show recent task updates,
                user actions, and system events.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    </div>
  );
}
