"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { cn } from "@/lib/utils";

interface CommentFormProps {
  onSubmit: (content: string) => Promise<void>;
  placeholder?: string;
  disabled?: boolean;
}

export function CommentForm({
  onSubmit,
  placeholder = "Add a comment...",
  disabled = false,
}: CommentFormProps) {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onSubmit(content.trim());
      setContent("");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        disabled={disabled || isSubmitting}
        className={cn(
          "flex-1 px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700",
          "bg-white dark:bg-slate-800 text-slate-900 dark:text-white",
          "placeholder:text-slate-400 dark:placeholder:text-slate-500",
          "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "text-sm"
        )}
      />
      <button
        type="submit"
        disabled={!content.trim() || disabled || isSubmitting}
        className={cn(
          "px-4 py-3 rounded-xl bg-blue-600 text-white font-medium",
          "hover:bg-blue-700 transition-colors",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "flex items-center gap-2 min-w-[44px] justify-center"
        )}
        aria-label="Send comment"
      >
        <Send className="w-4 h-4" />
      </button>
    </form>
  );
}
