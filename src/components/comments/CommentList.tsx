"use client";

import { User } from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";
import type { Comment, User as UserType } from "@/types";

interface CommentListProps {
  comments: Comment[];
  users: Record<string, UserType>;
  isLoading?: boolean;
}

export function CommentList({
  comments,
  users,
  isLoading = false,
}: CommentListProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <div key={i} className="flex gap-3 animate-pulse">
            <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-700" />
            <div className="flex-1">
              <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded mb-2" />
              <div className="h-4 w-full bg-slate-200 dark:bg-slate-700 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500 dark:text-slate-400">
        <p className="text-sm">No comments yet</p>
        <p className="text-xs mt-1">Be the first to add a comment</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {comments.map((comment) => {
        const user = users[comment.userId];
        return (
          <div key={comment.id} className="flex gap-3">
            {/* Avatar */}
            <div className="flex-shrink-0 w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="w-9 h-9 rounded-full"
                />
              ) : (
                <User className="w-5 h-5 text-blue-600 dark:text-blue-300" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2">
                <span className="font-medium text-sm text-slate-900 dark:text-white">
                  {user?.name || "Unknown User"}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {formatRelativeTime(comment.createdAt)}
                </span>
              </div>
              <p className="mt-1 text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap break-words">
                {comment.content}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
