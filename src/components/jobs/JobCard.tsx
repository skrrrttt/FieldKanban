"use client";

import Link from "next/link";
import {
  MapPin,
  Calendar,
  Building2,
  ChevronRight,
  CheckCircle2,
  Clock,
  Archive,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn, formatDate } from "@/lib/utils";
import type { Job } from "@/types";

interface JobCardProps {
  job: Job;
}

const statusConfig = {
  active: {
    icon: Clock,
    label: "Active",
    badgeVariant: "default" as const,
    badgeClass: "bg-primary/10 text-primary border-primary/20",
    borderColor: "border-l-primary",
  },
  completed: {
    icon: CheckCircle2,
    label: "Completed",
    badgeVariant: "secondary" as const,
    badgeClass: "bg-accent/10 text-accent border-accent/20",
    borderColor: "border-l-accent",
  },
  archived: {
    icon: Archive,
    label: "Archived",
    badgeVariant: "outline" as const,
    badgeClass: "bg-muted text-muted-foreground",
    borderColor: "border-l-muted-foreground/30",
  },
};

export function JobCard({ job }: JobCardProps) {
  const status = statusConfig[job.status];
  const StatusIcon = status.icon;

  return (
    <Link href={`/jobs/${job.id}`} className="block group">
      <Card
        className={cn(
          "border-l-4 p-5 transition-all",
          "hover:border-primary/50 hover:shadow-md",
          "touch-manipulation",
          status.borderColor
        )}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            {/* Status badge */}
            <div className="flex items-center gap-2 mb-3">
              <Badge
                variant={status.badgeVariant}
                className={cn("gap-1.5", status.badgeClass)}
              >
                <StatusIcon className="h-3 w-3" />
                {status.label}
              </Badge>
            </div>

            {/* Title */}
            <h3 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors">
              {job.title}
            </h3>

            {/* Description */}
            {job.description && (
              <p className="mt-2 text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                {job.description}
              </p>
            )}

            {/* Meta */}
            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
              {job.address && (
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span className="truncate max-w-[200px]">{job.address}</span>
                </div>
              )}
              {job.clientName && (
                <div className="flex items-center gap-1.5">
                  <Building2 className="h-4 w-4 text-violet-500" />
                  <span>{job.clientName}</span>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-accent" />
                <span>{formatDate(job.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* Arrow */}
          <div className="flex-shrink-0 self-center p-2">
            <ChevronRight className="h-6 w-6 text-muted-foreground/50 group-hover:text-primary group-hover:translate-x-1 transition-all" />
          </div>
        </div>
      </Card>
    </Link>
  );
}
