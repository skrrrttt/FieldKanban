"use client";

import { Settings, Users, Columns3, Construction } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface AdminLinkCardProps {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}

function AdminLinkCard({ href, icon, title, description }: AdminLinkCardProps) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-start gap-4 p-4 rounded-lg border",
        "hover:bg-accent hover:border-primary/50 transition-colors",
        "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
      )}
    >
      <div className="text-primary">{icon}</div>
      <div>
        <h3 className="font-medium">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </Link>
  );
}

export function AdminSection() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Admin Settings
            </CardTitle>
            <CardDescription>
              Manage organization-level settings and configurations.
            </CardDescription>
          </div>
          <Badge>Admin Only</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <AdminLinkCard
          href="/admin/users"
          icon={<Users className="w-5 h-5" />}
          title="User Management"
          description="Invite team members, assign roles, and manage permissions."
        />

        <AdminLinkCard
          href="/admin/settings"
          icon={<Columns3 className="w-5 h-5" />}
          title="Default Columns"
          description="Configure default Kanban columns for new jobs."
        />

        {/* Future features placeholder */}
        <div className="pt-4 border-t">
          <h4 className="text-sm font-medium mb-3 text-muted-foreground flex items-center gap-2">
            <Construction className="w-4 h-4" />
            Coming Soon
          </h4>
          <div className="grid gap-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
              <span>Organization branding and logo</span>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
              <span>Job templates and presets</span>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
              <span>Export and reporting options</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
