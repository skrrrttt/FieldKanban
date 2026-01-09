"use client";

import { memo } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  GripVertical,
  Calendar,
  MessageSquare,
  Paperclip,
  MapPin,
  Clock,
  FileText,
  AlertTriangle,
  Flag,
  AlertCircle,
  Trash2,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn, formatRelativeTime } from "@/lib/utils";
import type { Task, TaskPriority } from "@/types";

interface TaskCardProps {
  task: Task;
  onClick?: () => void;
  onDelete?: () => void;
  overlay?: boolean;
}

// Priority configuration with icon, colors, and labels
const priorityConfig: Record<
  TaskPriority,
  {
    icon: typeof Flag;
    borderColor: string;
    badgeBg: string;
    badgeText: string;
    label: string;
  }
> = {
  low: {
    icon: Flag,
    borderColor: "border-l-muted-foreground/30",
    badgeBg: "bg-muted",
    badgeText: "text-muted-foreground",
    label: "Low",
  },
  medium: {
    icon: Flag,
    borderColor: "border-l-primary",
    badgeBg: "bg-primary/10",
    badgeText: "text-primary",
    label: "Medium",
  },
  high: {
    icon: AlertCircle,
    borderColor: "border-l-orange-500",
    badgeBg: "bg-orange-100 dark:bg-orange-950",
    badgeText: "text-orange-700 dark:text-orange-400",
    label: "High",
  },
  urgent: {
    icon: AlertTriangle,
    borderColor: "border-l-destructive",
    badgeBg: "bg-destructive/10",
    badgeText: "text-destructive",
    label: "Urgent",
  },
};

// Format duration for display
function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

// Memoized to prevent re-renders when parent re-renders
export const TaskCard = memo(function TaskCard({ task, onClick, onDelete, overlay = false }: TaskCardProps) {
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
  const config = priorityConfig[priority];
  const PriorityIcon = config.icon;

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn(
        // Base styles - bordered card
        "group relative border bg-card hover:border-primary/50 transition-all cursor-pointer select-none",
        // Left border for priority
        "border-l-4",
        config.borderColor,
        // Padding
        "p-3",
        // Touch handling
        "touch-manipulation",
        // Drag states
        isDragging && "opacity-50 shadow-lg ring-2 ring-primary",
        overlay && "shadow-xl rotate-2 scale-105"
      )}
      onClick={onClick}
    >
      {/* Top Row: Title + Priority Badge + Actions */}
      <div className="flex items-start gap-2">
        {/* Title */}
        <h4 className="flex-1 font-medium text-sm leading-snug line-clamp-2">
          {task.title}
        </h4>

        {/* Priority Badge - inline */}
        <Badge
          className={cn(
            "flex-shrink-0 gap-1 h-5",
            config.badgeBg,
            config.badgeText,
            "border-0"
          )}
        >
          <PriorityIcon className="h-3 w-3" />
          <span className="text-[10px]">{config.label}</span>
        </Badge>

        {/* Delete button - only shown for admins */}
        {onDelete && (
          <button
            className={cn(
              "flex-shrink-0 p-2 rounded-lg",
              "hover:bg-destructive/10 text-muted-foreground hover:text-destructive",
              "min-w-[36px] min-h-[36px] flex items-center justify-center",
              "opacity-0 group-hover:opacity-100 transition-opacity"
            )}
            aria-label="Delete task"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}

        {/* Drag Handle - larger touch target */}
        <button
          className={cn(
            "flex-shrink-0 p-2 -mr-1 -mt-1 rounded-lg",
            "hover:bg-muted",
            "cursor-grab active:cursor-grabbing touch-none",
            "min-w-[44px] min-h-[44px] flex items-center justify-center"
          )}
          aria-label="Drag to reorder"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>

      {/* Description preview */}
      {task.description && (
        <p className="mt-2 text-xs text-muted-foreground line-clamp-2">
          {task.description}
        </p>
      )}

      {/* Field Info Row: Location, Duration, Spec */}
      {(task.location || task.duration || task.specReference) && (
        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          {task.location && (
            <div className="flex items-center gap-1" title="Location">
              <MapPin className="h-3 w-3 text-primary" />
              <span className="truncate max-w-[120px]">{task.location}</span>
            </div>
          )}
          {task.duration && (
            <div className="flex items-center gap-1" title="Estimated duration">
              <Clock className="h-3 w-3 text-accent" />
              <span>{formatDuration(task.duration)}</span>
            </div>
          )}
          {task.specReference && (
            <div className="flex items-center gap-1" title="Spec reference">
              <FileText className="h-3 w-3 text-violet-500" />
              <span className="truncate max-w-[80px]">{task.specReference}</span>
            </div>
          )}
        </div>
      )}

      {/* Bottom Row: Due Date, Indicators, Assignees */}
      <div className="mt-3 flex items-center gap-3">
        {/* Due date */}
        {task.dueDate && (
          <div
            className={cn(
              "flex items-center gap-1 text-xs font-medium",
              isOverdue ? "text-destructive" : "text-muted-foreground"
            )}
          >
            <Calendar className="h-3 w-3" />
            <span>{formatRelativeTime(task.dueDate)}</span>
            {isOverdue && <AlertTriangle className="h-3 w-3 ml-0.5" />}
          </div>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Indicators */}
        <div className="flex items-center gap-2 text-muted-foreground">
          {/* Comments indicator */}
          <div className="flex items-center gap-0.5" title="Comments">
            <MessageSquare className="h-3.5 w-3.5" />
            <span className="text-xs">0</span>
          </div>

          {/* Attachments indicator */}
          <div className="flex items-center gap-0.5" title="Attachments">
            <Paperclip className="h-3.5 w-3.5" />
            <span className="text-xs">0</span>
          </div>
        </div>

        {/* Assignees */}
        {task.assignedTo.length > 0 && (
          <div className="flex -space-x-1.5">
            {task.assignedTo.slice(0, 3).map((userId) => (
              <Avatar
                key={userId}
                className="h-6 w-6 border-2 border-card"
                title={userId}
              >
                <AvatarFallback className="text-[10px] bg-primary text-primary-foreground">
                  {userId.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            ))}
            {task.assignedTo.length > 3 && (
              <Avatar className="h-6 w-6 border-2 border-card">
                <AvatarFallback className="text-[10px] bg-muted text-muted-foreground">
                  +{task.assignedTo.length - 3}
                </AvatarFallback>
              </Avatar>
            )}
          </div>
        )}
      </div>
    </Card>
  );
});

// Overlay version for drag preview
export function TaskCardOverlay({ task }: { task: Task }) {
  return <TaskCard task={task} overlay />;
}
