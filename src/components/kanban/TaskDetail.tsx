"use client";

import { useState, useEffect, useCallback } from "react";
import {
  X,
  MapPin,
  Clock,
  FileText,
  Calendar,
  User,
  MessageSquare,
  Paperclip,
  AlertTriangle,
  Flag,
  AlertCircle,
  Camera,
  Upload,
  CheckCircle2,
} from "lucide-react";
import { cn, formatRelativeTime, formatDate } from "@/lib/utils";
import { CommentList, CommentForm } from "@/components/comments";
import { mockRepository } from "@/lib/data/providers/mock";
import type { Task, TaskPriority, Comment, User as UserType, FileAttachment } from "@/types";

interface TaskDetailProps {
  task: Task;
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: (task: Task) => void;
}

// Priority configuration
const priorityConfig: Record<TaskPriority, { icon: typeof Flag; color: string; bg: string; label: string }> = {
  low: { icon: Flag, color: "text-slate-500", bg: "bg-slate-100 dark:bg-slate-800", label: "Low Priority" },
  medium: { icon: Flag, color: "text-blue-500", bg: "bg-blue-100 dark:bg-blue-900/50", label: "Medium Priority" },
  high: { icon: AlertCircle, color: "text-orange-500", bg: "bg-orange-100 dark:bg-orange-900/50", label: "High Priority" },
  urgent: { icon: AlertTriangle, color: "text-red-500", bg: "bg-red-100 dark:bg-red-900/50", label: "Urgent" },
};

// Format duration for display
function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} minutes`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours} hours`;
}

export function TaskDetail({ task, isOpen, onClose, onUpdate }: TaskDetailProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [files, setFiles] = useState<FileAttachment[]>([]);
  const [users, setUsers] = useState<Record<string, UserType>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"details" | "comments" | "files">("details");

  const priority = task.priority || "medium";
  const PriorityIcon = priorityConfig[priority].icon;
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();

  // Load comments, files, and users
  useEffect(() => {
    if (!isOpen) return;

    async function loadData() {
      setIsLoading(true);
      const [commentsResult, filesResult, usersResult] = await Promise.all([
        mockRepository.getComments(task.id),
        mockRepository.getFiles(task.id),
        mockRepository.getUsers(),
      ]);

      if (commentsResult.success && commentsResult.data) {
        setComments(commentsResult.data);
      }
      if (filesResult.success && filesResult.data) {
        setFiles(filesResult.data);
      }
      if (usersResult.success && usersResult.data) {
        const usersMap: Record<string, UserType> = {};
        usersResult.data.forEach((u) => (usersMap[u.id] = u));
        setUsers(usersMap);
      }
      setIsLoading(false);
    }

    loadData();
  }, [task.id, isOpen]);

  // Handle adding a comment
  const handleAddComment = useCallback(
    async (content: string) => {
      const currentUser = await mockRepository.getCurrentUser();
      if (!currentUser.success || !currentUser.data) return;

      const result = await mockRepository.createComment({
        taskId: task.id,
        userId: currentUser.data.id,
        content,
      });

      if (result.success && result.data) {
        setComments((prev) => [...prev, result.data!]);
      }
    },
    [task.id]
  );

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center sm:items-center p-0 sm:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel - Full screen on mobile, modal on desktop */}
      <div
        className={cn(
          "relative w-full h-full sm:h-auto sm:max-h-[90vh] sm:max-w-2xl",
          "bg-white dark:bg-slate-900 sm:rounded-2xl shadow-2xl",
          "flex flex-col overflow-hidden",
          "animate-in slide-in-from-bottom sm:fade-in sm:zoom-in-95 duration-200"
        )}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex-shrink-0 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-start justify-between p-4 sm:p-6 pb-4">
            <div className="flex-1 pr-4">
              {/* Priority Badge */}
              <div className="flex items-center gap-2 mb-2">
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold",
                    priorityConfig[priority].bg,
                    priorityConfig[priority].color
                  )}
                >
                  <PriorityIcon className="w-3.5 h-3.5" />
                  {priorityConfig[priority].label}
                </span>
                {isOverdue && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400">
                    <AlertTriangle className="w-3 h-3" />
                    Overdue
                  </span>
                )}
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">
                {task.title}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Close"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex px-4 sm:px-6 gap-1">
            <TabButton
              active={activeTab === "details"}
              onClick={() => setActiveTab("details")}
              icon={FileText}
              label="Details"
            />
            <TabButton
              active={activeTab === "comments"}
              onClick={() => setActiveTab("comments")}
              icon={MessageSquare}
              label="Comments"
              count={comments.length}
            />
            <TabButton
              active={activeTab === "files"}
              onClick={() => setActiveTab("files")}
              icon={Paperclip}
              label="Files"
              count={files.length}
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {activeTab === "details" && (
            <DetailsTab task={task} users={users} isOverdue={isOverdue} />
          )}
          {activeTab === "comments" && (
            <CommentsTab
              comments={comments}
              users={users}
              isLoading={isLoading}
              onAddComment={handleAddComment}
            />
          )}
          {activeTab === "files" && (
            <FilesTab files={files} isLoading={isLoading} />
          )}
        </div>
      </div>
    </div>
  );
}

// Tab Button Component
function TabButton({
  active,
  onClick,
  icon: Icon,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof FileText;
  label: string;
  count?: number;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors",
        active
          ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 -mb-[1px]"
          : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
      )}
    >
      <Icon className="w-4 h-4" />
      <span>{label}</span>
      {count !== undefined && count > 0 && (
        <span className={cn(
          "px-1.5 py-0.5 text-xs rounded-full",
          active ? "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400" : "bg-slate-200 dark:bg-slate-700"
        )}>
          {count}
        </span>
      )}
    </button>
  );
}

// Details Tab
function DetailsTab({
  task,
  users,
  isOverdue,
}: {
  task: Task;
  users: Record<string, UserType>;
  isOverdue: boolean | null | undefined;
}) {
  return (
    <div className="space-y-6">
      {/* Description */}
      {task.description && (
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">
            Description
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-wrap">
            {task.description}
          </p>
        </div>
      )}

      {/* Field Info Grid */}
      <div className="grid grid-cols-2 gap-4">
        {task.location && (
          <InfoItem icon={MapPin} label="Location" value={task.location} iconColor="text-blue-500" />
        )}
        {task.duration && (
          <InfoItem icon={Clock} label="Duration" value={formatDuration(task.duration)} iconColor="text-green-500" />
        )}
        {task.specReference && (
          <InfoItem icon={FileText} label="Spec Reference" value={task.specReference} iconColor="text-purple-500" />
        )}
        {task.dueDate && (
          <InfoItem
            icon={Calendar}
            label="Due Date"
            value={formatDate(task.dueDate)}
            iconColor={isOverdue ? "text-red-500" : "text-slate-500"}
          />
        )}
      </div>

      {/* Assignees */}
      {task.assignedTo.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
            Assigned To
          </h3>
          <div className="flex flex-wrap gap-2">
            {task.assignedTo.map((userId) => {
              const user = users[userId];
              return (
                <div
                  key={userId}
                  className="flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg"
                >
                  <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                    <User className="w-4 h-4 text-blue-600 dark:text-blue-300" />
                  </div>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {user?.name || userId}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Timestamps */}
      <div className="pt-4 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
        <p>Created {formatRelativeTime(task.createdAt)}</p>
        <p>Updated {formatRelativeTime(task.updatedAt)}</p>
      </div>
    </div>
  );
}

// Info Item Component
function InfoItem({
  icon: Icon,
  label,
  value,
  iconColor,
}: {
  icon: typeof MapPin;
  label: string;
  value: string;
  iconColor: string;
}) {
  return (
    <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
      <Icon className={cn("w-5 h-5 mt-0.5", iconColor)} />
      <div>
        <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
        <p className="text-sm font-medium text-slate-900 dark:text-white">{value}</p>
      </div>
    </div>
  );
}

// Comments Tab
function CommentsTab({
  comments,
  users,
  isLoading,
  onAddComment,
}: {
  comments: Comment[];
  users: Record<string, UserType>;
  isLoading: boolean;
  onAddComment: (content: string) => Promise<void>;
}) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 mb-4">
        <CommentList comments={comments} users={users} isLoading={isLoading} />
      </div>
      <div className="flex-shrink-0 pt-4 border-t border-slate-200 dark:border-slate-800">
        <CommentForm onSubmit={onAddComment} />
      </div>
    </div>
  );
}

// Files Tab
function FilesTab({
  files,
  isLoading,
}: {
  files: FileAttachment[];
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2].map((i) => (
          <div key={i} className="h-16 bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Upload Buttons */}
      <div className="flex gap-2">
        <button className="flex-1 flex items-center justify-center gap-2 p-4 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl text-slate-500 hover:text-blue-600 hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
          <Camera className="w-5 h-5" />
          <span className="text-sm font-medium">Take Photo</span>
        </button>
        <button className="flex-1 flex items-center justify-center gap-2 p-4 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl text-slate-500 hover:text-blue-600 hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
          <Upload className="w-5 h-5" />
          <span className="text-sm font-medium">Upload File</span>
        </button>
      </div>

      {/* Files List */}
      {files.length === 0 ? (
        <div className="text-center py-8 text-slate-500 dark:text-slate-400">
          <Paperclip className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No files attached</p>
          <p className="text-xs mt-1">Take a photo or upload a file</p>
        </div>
      ) : (
        <div className="space-y-2">
          {files.map((file) => (
            <div
              key={file.id}
              className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl"
            >
              <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                {file.type === "image" ? (
                  <Camera className="w-5 h-5 text-blue-600 dark:text-blue-300" />
                ) : (
                  <FileText className="w-5 h-5 text-blue-600 dark:text-blue-300" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                  {file.name}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {formatRelativeTime(file.uploadedAt)}
                </p>
              </div>
              {file.syncStatus === "synced" && (
                <CheckCircle2 className="w-4 h-4 text-green-500" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
