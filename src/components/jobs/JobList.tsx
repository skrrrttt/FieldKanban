"use client";

import { JobCard } from "./JobCard";
import type { Job, JobStatus } from "@/types";

interface JobListProps {
  jobs: Job[];
  isLoading?: boolean;
  isAdmin?: boolean;
  onStatusChange?: (jobId: string, newStatus: JobStatus) => void;
}

export function JobList({ jobs, isLoading = false, isAdmin = false, onStatusChange }: JobListProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 animate-pulse"
          >
            <div className="h-4 w-20 bg-slate-200 dark:bg-slate-700 rounded mb-3" />
            <div className="h-6 w-3/4 bg-slate-200 dark:bg-slate-700 rounded mb-2" />
            <div className="h-4 w-1/2 bg-slate-200 dark:bg-slate-700 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500 dark:text-slate-400">No jobs found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {jobs.map((job) => (
        <JobCard
          key={job.id}
          job={job}
          isAdmin={isAdmin}
          onStatusChange={onStatusChange}
        />
      ))}
    </div>
  );
}
