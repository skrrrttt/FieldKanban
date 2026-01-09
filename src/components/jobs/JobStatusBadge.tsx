"use client";

import { Clock, CheckCircle2, Archive } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { JobStatus } from "@/types";

export const JOB_STATUS_CONFIG = {
  active: {
    icon: Clock,
    label: "Active",
    badgeVariant: "default" as const,
    badgeClass: "bg-primary/10 text-primary border-primary/20",
    borderColor: "border-l-primary",
    description: "Job is currently in progress",
  },
  completed: {
    icon: CheckCircle2,
    label: "Completed",
    badgeVariant: "secondary" as const,
    badgeClass: "bg-accent/10 text-accent border-accent/20",
    borderColor: "border-l-accent",
    description: "Job has been finished",
  },
  archived: {
    icon: Archive,
    label: "Archived",
    badgeVariant: "outline" as const,
    badgeClass: "bg-muted text-muted-foreground",
    borderColor: "border-l-muted-foreground/30",
    description: "Job is archived and hidden from active view",
  },
} as const;

interface JobStatusBadgeProps {
  status: JobStatus;
  className?: string;
  showIcon?: boolean;
}

export function JobStatusBadge({
  status,
  className,
  showIcon = true,
}: JobStatusBadgeProps) {
  const config = JOB_STATUS_CONFIG[status];
  const StatusIcon = config.icon;

  return (
    <Badge
      variant={config.badgeVariant}
      className={cn("gap-1.5", config.badgeClass, className)}
    >
      {showIcon && <StatusIcon className="h-3 w-3" />}
      {config.label}
    </Badge>
  );
}
