"use client";

import { useMemo } from "react";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { Plus, MoreHorizontal } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
    <Card
      className={cn(
        "flex flex-col w-80 min-w-80 max-h-full",
        "bg-muted/50 border-border"
      )}
    >
      {/* Column Header */}
      <CardHeader className="flex flex-row items-center justify-between p-3 pb-2 space-y-0">
        <div className="flex items-center gap-2">
          {/* Color indicator */}
          {column.color && (
            <div
              className="w-2.5 h-2.5 rounded-full ring-2 ring-background shadow-sm"
              style={{ backgroundColor: column.color }}
            />
          )}
          <h3 className="font-semibold text-sm">{column.name}</h3>
          <Badge variant="secondary" className="h-5 px-1.5 text-xs font-medium">
            {tasks.length}
          </Badge>
        </div>

        <div className="flex items-center gap-0.5">
          {isAdmin && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-primary"
              onClick={onAddTask}
              title="Add task"
            >
              <Plus className="h-4 w-4" />
              <span className="sr-only">Add task to this column</span>
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground"
              >
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Column options</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Edit column</DropdownMenuItem>
              <DropdownMenuItem>Sort tasks</DropdownMenuItem>
              {isAdmin && (
                <DropdownMenuItem className="text-destructive">
                  Delete column
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      {/* Tasks Container */}
      <CardContent className="flex-1 overflow-hidden p-0">
        <div
          ref={setNodeRef}
          className={cn(
            "flex flex-col gap-3 p-3 pt-1 overflow-y-auto",
            "min-h-[120px] max-h-[calc(100vh-220px)]",
            isOver && "bg-primary/5 rounded-lg mx-2 transition-colors"
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
            <div className="flex flex-col items-center justify-center h-28 border-2 border-dashed border-border rounded-lg bg-background/50">
              <p className="text-sm text-muted-foreground font-medium">
                No tasks
              </p>
              {isAdmin && (
                <Button
                  variant="link"
                  size="sm"
                  onClick={onAddTask}
                  className="mt-1 h-auto p-0 text-primary"
                >
                  + Add first task
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>

      {/* Add Task Button (bottom) - Admin only */}
      {isAdmin && tasks.length > 0 && (
        <div className="p-3 pt-0">
          <Button
            variant="outline"
            className="w-full justify-center gap-2 text-muted-foreground hover:text-primary"
            onClick={onAddTask}
          >
            <Plus className="h-4 w-4" />
            <span>Add Task</span>
          </Button>
        </div>
      )}
    </Card>
  );
}
