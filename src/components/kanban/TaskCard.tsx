"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  GripVertical,
  Calendar,
  MessageSquare,
  Paperclip,
  User,
  MapPin,
  Clock,
  FileText,
  AlertTriangle,
  Flag,
  AlertCircle,
} from "lucide-react";
import { cn, formatRelativeTime } from "@/lib/utils";
import type { Task, TaskPriority } from "@/types";

interface TaskCardProps {
  task: Task;
  onClick?: () => void;
  overlay?: boolean;
}

// Priority icon and color mapping
const priorityConfig: Record<TaskPriority, { icon: typeof Flag; color: string; label: string }> = {
  low: { icon: Flag, color: "text-slate-400", label: "Low" },
  medium: { icon: Flag, color: "text-blue-500", label: "Medium" },
  high: { icon: AlertCircle, color: "text-orange-500", label: "High" },
  urgent: { icon: AlertTriangle, color: "text-red-500", label: "Urgent" },
};

// Format duration for display
function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

export function TaskCard({ task, onClick, overlay = false }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: "task",
      task,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();
  const priority = task.priority || "medium";
  const PriorityIcon = priorityConfig[priority].icon;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "bg-white dark:bg-slate-800 rounded-xl border-l-4 shadow-sm",
        "hover:shadow-md transition-all cursor-pointer select-none",
        // Adaptive padding: compact on desktop, spacious on mobile
        "p-3 sm:p-3 md:p-3 lg:p-3",
        "touch-manipulation",
        // Priority-based left border color
        priority === "urgent" && "border-l-red-500",
        priority === "high" && "border-l-orange-500",
        priority === "medium" && "border-l-blue-500",
        priority === "low" && "border-l-slate-300",
        // Border for non-left sides
        "border-t border-r border-b border-slate-200 dark:border-slate-700",
        isDragging && "opacity-50 shadow-lg ring-2 ring-blue-500",
        overlay && "shadow-xl rotate-2 scale-105"
      )}
      onClick={onClick}
    >
      {/* Top Row: Priority Icon + Title + Drag Handle */}
      <div className="flex items-start gap-2">
        {/* Priority Icon */}
        <div className={cn("mt-0.5 flex-shrink-0", priorityConfig[priority].color)}>
          <PriorityIcon className="w-4 h-4" aria-label={`${priorityConfig[priority].label} priority`} />
        </div>

        {/* Title */}
        <h4 className="flex-1 font-medium text-slate-900 dark:text-white text-sm leading-snug line-clamp-2">
          {task.title}
        </h4>

        {/* Drag Handle - larger touch target */}
        <button
          className={cn(
            "flex-shrink-0 p-2 -mr-1 rounded-lg",
            "hover:bg-slate-100 dark:hover:bg-slate-700",
            "cursor-grab active:cursor-grabbing touch-none",
            "min-w-[44px] min-h-[44px] flex items-center justify-center"
          )}
          aria-label="Drag to reorder"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="w-5 h-5 text-slate-400" />
        </button>
      </div>

      {/* Description preview */}
      {task.description && (
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 line-clamp-2 pl-6">
          {task.description}
        </p>
      )}

      {/* Field Info Row: Location, Duration, Spec */}
      {(task.location || task.duration || task.specReference) && (
        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 pl-6 text-xs text-slate-500 dark:text-slate-400">
          {task.location && (
            <div className="flex items-center gap-1" title="Location">
              <MapPin className="w-3.5 h-3.5 text-blue-500" />
              <span className="truncate max-w-[120px]">{task.location}</span>
            </div>
          )}
          {task.duration && (
            <div className="flex items-center gap-1" title="Estimated duration">
              <Clock className="w-3.5 h-3.5 text-green-500" />
              <span>{formatDuration(task.duration)}</span>
            </div>
          )}
          {task.specReference && (
            <div className="flex items-center gap-1" title="Spec reference">
              <FileText className="w-3.5 h-3.5 text-purple-500" />
              <span className="truncate max-w-[80px]">{task.specReference}</span>
            </div>
          )}
        </div>
      )}

      {/* Bottom Row: Due Date, Indicators, Assignees */}
      <div className="mt-3 flex items-center gap-3 pl-6">
        {/* Due date */}
        {task.dueDate && (
          <div
            className={cn(
              "flex items-center gap-1 text-xs font-medium",
              isOverdue
                ? "text-red-600 dark:text-red-400"
                : "text-slate-500 dark:text-slate-400"
            )}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>{formatRelativeTime(task.dueDate)}</span>
            {isOverdue && <AlertTriangle className="w-3 h-3 ml-0.5" />}
          </div>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Indicators */}
        <div className="flex items-center gap-2 text-slate-400">
          {/* Comments indicator (placeholder) */}
          <div className="flex items-center gap-0.5" title="Comments">
            <MessageSquare className="w-3.5 h-3.5" />
            <span className="text-xs">0</span>
          </div>

          {/* Attachments indicator (placeholder) */}
          <div className="flex items-center gap-0.5" title="Attachments">
            <Paperclip className="w-3.5 h-3.5" />
            <span className="text-xs">0</span>
          </div>
        </div>

        {/* Assignees */}
        {task.assignedTo.length > 0 && (
          <div className="flex -space-x-1.5">
            {task.assignedTo.slice(0, 3).map((userId) => (
              <div
                key={userId}
                className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900 border-2 border-white dark:border-slate-800 flex items-center justify-center"
                title={userId}
              >
                <User className="w-3.5 h-3.5 text-blue-600 dark:text-blue-300" />
              </div>
            ))}
            {task.assignedTo.length > 3 && (
              <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700 border-2 border-white dark:border-slate-800 flex items-center justify-center text-xs font-medium text-slate-600 dark:text-slate-300">
                +{task.assignedTo.length - 3}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Overlay version for drag preview
export function TaskCardOverlay({ task }: { task: Task }) {
  return <TaskCard task={task} overlay />;
}
