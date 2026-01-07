"use client";

import Link from "next/link";
import { MapPin, Calendar, Building2, ChevronRight, CheckCircle2, Clock, Archive } from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import type { Job } from "@/types";

interface JobCardProps {
  job: Job;
}

const statusConfig = {
  active: {
    icon: Clock,
    label: "Active",
    bg: "bg-blue-100 dark:bg-blue-900/50",
    text: "text-blue-700 dark:text-blue-300",
    border: "border-l-blue-500",
  },
  completed: {
    icon: CheckCircle2,
    label: "Completed",
    bg: "bg-green-100 dark:bg-green-900/50",
    text: "text-green-700 dark:text-green-300",
    border: "border-l-green-500",
  },
  archived: {
    icon: Archive,
    label: "Archived",
    bg: "bg-slate-100 dark:bg-slate-800",
    text: "text-slate-600 dark:text-slate-400",
    border: "border-l-slate-400",
  },
};

export function JobCard({ job }: JobCardProps) {
  const status = statusConfig[job.status];
  const StatusIcon = status.icon;

  return (
    <Link
      href={`/jobs/${job.id}`}
      className={cn(
        "block bg-white dark:bg-slate-900 rounded-xl",
        "border-l-4 border border-slate-200 dark:border-slate-800",
        status.border,
        "p-5 hover:shadow-lg hover:border-slate-300 dark:hover:border-slate-700 transition-all",
        "group touch-manipulation"
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {/* Status badge */}
          <div className="flex items-center gap-2 mb-3">
            <span
              className={cn(
                "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold",
                status.bg,
                status.text
              )}
            >
              <StatusIcon className="w-3.5 h-3.5" />
              {status.label}
            </span>
          </div>

          {/* Title */}
          <h3 className="font-bold text-slate-900 dark:text-white text-lg group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-tight">
            {job.title}
          </h3>

          {/* Description */}
          {job.description && (
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
              {job.description}
            </p>
          )}

          {/* Meta */}
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500 dark:text-slate-400">
            {job.address && (
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-blue-500" />
                <span className="truncate max-w-[200px]">{job.address}</span>
              </div>
            )}
            {job.clientName && (
              <div className="flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-purple-500" />
                <span>{job.clientName}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-green-500" />
              <span>{formatDate(job.createdAt)}</span>
            </div>
          </div>
        </div>

        {/* Arrow */}
        <div className="flex-shrink-0 self-center p-2">
          <ChevronRight className="w-6 h-6 text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
        </div>
      </div>
    </Link>
  );
}
