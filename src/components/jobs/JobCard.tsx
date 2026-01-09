"use client";

import Link from "next/link";
import {
  MapPin,
  Calendar,
  Building2,
  ChevronRight,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn, formatDate } from "@/lib/utils";
import { JobStatusDropdown } from "./JobStatusDropdown";
import { JOB_STATUS_CONFIG } from "./JobStatusBadge";
import type { Job, JobStatus } from "@/types";

interface JobCardProps {
  job: Job;
  isAdmin?: boolean;
  onStatusChange?: (jobId: string, newStatus: JobStatus) => void;
}

export function JobCard({ job, isAdmin = false, onStatusChange }: JobCardProps) {
  const statusConfig = JOB_STATUS_CONFIG[job.status];

  const handleStatusChange = (newStatus: JobStatus) => {
    onStatusChange?.(job.id, newStatus);
  };

  return (
    <Link href={`/jobs/${job.id}`} className="block group">
      <Card
        className={cn(
          "border-l-4 p-5 transition-all",
          "hover:border-primary/50 hover:shadow-md",
          "touch-manipulation",
          statusConfig.borderColor
        )}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            {/* Status dropdown/badge */}
            <div className="flex items-center gap-2 mb-3">
              <JobStatusDropdown
                job={job}
                isAdmin={isAdmin}
                onStatusChange={handleStatusChange}
              />
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
