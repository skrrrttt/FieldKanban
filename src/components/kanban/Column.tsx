"use client";

import { useMemo } from "react";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { Plus, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { TaskCard } from "./TaskCard";
import type { Column as ColumnType, Task } from "@/types";

interface ColumnProps {
  column: ColumnType;
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
  onAddTask?: () => void;
  isAdmin?: boolean;
}

export function Column({
  column,
  tasks,
  onTaskClick,
  onAddTask,
  isAdmin = false,
}: ColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: {
      type: "column",
      column,
    },
  });

  const taskIds = useMemo(() => tasks.map((t) => t.id), [tasks]);

  // Sort tasks by order
  const sortedTasks = useMemo(
    () => [...tasks].sort((a, b) => a.order - b.order),
    [tasks]
  );

  return (
    <div
      className={cn(
        "flex flex-col w-80 min-w-80 bg-slate-100 dark:bg-slate-900/50 rounded-2xl",
        "max-h-full border border-slate-200 dark:border-slate-800",
        "shadow-sm"
      )}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between p-4 pb-3">
        <div className="flex items-center gap-2.5">
          {/* Color indicator */}
          {column.color && (
            <div
              className="w-3 h-3 rounded-full ring-2 ring-white dark:ring-slate-800 shadow-sm"
              style={{ backgroundColor: column.color }}
            />
          )}
          <h3 className="font-semibold text-slate-900 dark:text-white">
            {column.name}
          </h3>
          <span className="text-sm text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 px-2 py-0.5 rounded-full font-medium shadow-sm">
            {tasks.length}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {isAdmin && (
            <button
              onClick={onAddTask}
              className="p-2 rounded-lg hover:bg-white dark:hover:bg-slate-800 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
              title="Add task"
              aria-label="Add task to this column"
            >
              <Plus className="w-5 h-5" />
            </button>
          )}
          <button
            className="p-2 rounded-lg hover:bg-white dark:hover:bg-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            title="Column options"
            aria-label="Column options"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Tasks Container */}
      <div
        ref={setNodeRef}
        className={cn(
          "flex-1 overflow-y-auto px-3 pb-3 space-y-3",
          "min-h-[120px]",
          isOver && "bg-blue-50 dark:bg-blue-900/20 mx-2 rounded-xl transition-colors"
        )}
      >
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          {sortedTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onClick={() => onTaskClick?.(task)}
            />
          ))}
        </SortableContext>

        {/* Empty state */}
        {tasks.length === 0 && (
          <div className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl bg-white/50 dark:bg-slate-800/50">
            <p className="text-sm text-slate-400 dark:text-slate-500 font-medium">
              No tasks
            </p>
            {isAdmin && (
              <button
                onClick={onAddTask}
                className="mt-2 text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium"
              >
                + Add first task
              </button>
            )}
          </div>
        )}
      </div>

      {/* Add Task Button (bottom) - Admin only */}
      {isAdmin && tasks.length > 0 && (
        <div className="p-3 pt-0">
          <button
            onClick={onAddTask}
            className="w-full flex items-center justify-center gap-2 p-3 text-sm font-medium text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700 rounded-xl transition-colors shadow-sm border border-slate-200 dark:border-slate-700"
          >
            <Plus className="w-4 h-4" />
            <span>Add Task</span>
          </button>
        </div>
      )}
    </div>
  );
}
