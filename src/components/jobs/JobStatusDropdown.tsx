"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useRepository } from "@/lib/data/repository-context";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { JOB_STATUS_CONFIG, JobStatusBadge } from "./JobStatusBadge";
import type { Job, JobStatus } from "@/types";

interface JobStatusDropdownProps {
  job: Job;
  isAdmin: boolean;
  onStatusChange?: (newStatus: JobStatus) => void;
  className?: string;
}

const STATUS_CHANGE_MESSAGES: Record<
  JobStatus,
  { title: string; description: string; action: string }
> = {
  active: {
    title: "Reopen this job?",
    description: "This job will be moved back to the active jobs list.",
    action: "Reopen Job",
  },
  completed: {
    title: "Mark job as completed?",
    description:
      "This job will be moved to the completed list. You can reopen it later if needed.",
    action: "Mark Complete",
  },
  archived: {
    title: "Archive this job?",
    description:
      "Archived jobs will be hidden from the active jobs list. You can find them by filtering for archived jobs.",
    action: "Archive Job",
  },
};

export function JobStatusDropdown({
  job,
  isAdmin,
  onStatusChange,
  className,
}: JobStatusDropdownProps) {
  const repository = useRepository();
  const [isUpdating, setIsUpdating] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<JobStatus | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // If not admin, show read-only badge
  if (!isAdmin) {
    return <JobStatusBadge status={job.status} className={className} />;
  }

  const handleStatusSelect = (newStatus: string) => {
    const status = newStatus as JobStatus;
    if (status === job.status) return;

    // Show confirmation dialog for status changes
    setPendingStatus(status);
    setShowConfirmDialog(true);
  };

  const handleConfirmStatusChange = async () => {
    if (!pendingStatus) return;

    setShowConfirmDialog(false);
    setIsUpdating(true);

    const result = await repository.updateJob(job.id, { status: pendingStatus });

    if (result.success) {
      toast.success(`Job ${STATUS_CHANGE_MESSAGES[pendingStatus].action.toLowerCase()}`, {
        description: `"${job.title}" is now ${pendingStatus}.`,
      });
      onStatusChange?.(pendingStatus);
    } else {
      toast.error("Failed to update job status", {
        description: result.error || "Please try again.",
      });
    }

    setIsUpdating(false);
    setPendingStatus(null);
  };

  const handleCancelStatusChange = () => {
    setShowConfirmDialog(false);
    setPendingStatus(null);
  };

  const currentConfig = JOB_STATUS_CONFIG[job.status];
  const CurrentIcon = currentConfig.icon;

  return (
    <>
      <Select
        value={job.status}
        onValueChange={handleStatusSelect}
        disabled={isUpdating}
      >
        <SelectTrigger
          className={cn(
            "w-auto min-w-[130px] h-8 gap-2",
            currentConfig.badgeClass,
            "border focus:ring-1",
            className
          )}
          onClick={(e) => e.stopPropagation()}
          aria-label="Change job status"
        >
          {isUpdating ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <CurrentIcon className="h-3 w-3" />
          )}
          <SelectValue />
        </SelectTrigger>
        <SelectContent onClick={(e) => e.stopPropagation()}>
          {(Object.keys(JOB_STATUS_CONFIG) as JobStatus[]).map((status) => {
            const config = JOB_STATUS_CONFIG[status];
            const Icon = config.icon;
            return (
              <SelectItem
                key={status}
                value={status}
                className="cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  <span>{config.label}</span>
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent onClick={(e) => e.stopPropagation()}>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pendingStatus && STATUS_CHANGE_MESSAGES[pendingStatus].title}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pendingStatus && STATUS_CHANGE_MESSAGES[pendingStatus].description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelStatusChange}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmStatusChange}>
              {pendingStatus && STATUS_CHANGE_MESSAGES[pendingStatus].action}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
