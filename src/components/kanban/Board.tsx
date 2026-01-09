"use client";

import { useState, useMemo, useCallback } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { Column } from "./Column";
import { TaskCardOverlay } from "./TaskCard";
import type { Column as ColumnType, Task } from "@/types";

interface BoardProps {
  columns: ColumnType[];
  tasks: Task[];
  onTaskMove?: (taskId: string, columnId: string, newOrder: number) => void;
  onTaskClick?: (task: Task) => void;
  onAddTask?: (columnId: string) => void;
  onAddColumn?: () => void;
  onDeleteColumn?: (columnId: string) => void;
  onDeleteTask?: (taskId: string) => void;
  isAdmin?: boolean;
}

export function Board({
  columns,
  tasks,
  onTaskMove,
  onTaskClick,
  onAddTask,
  onAddColumn,
  onDeleteColumn,
  onDeleteTask,
  isAdmin = false,
}: BoardProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  // Sort columns by order
  const sortedColumns = useMemo(
    () => [...columns].sort((a, b) => a.order - b.order),
    [columns]
  );

  // Group tasks by column
  const tasksByColumn = useMemo(() => {
    const grouped: Record<string, Task[]> = {};
    for (const col of columns) {
      grouped[col.id] = [];
    }
    for (const task of tasks) {
      if (grouped[task.columnId]) {
        grouped[task.columnId].push(task);
      }
    }
    return grouped;
  }, [columns, tasks]);

  // Sensors for drag detection
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    const task = active.data.current?.task as Task | undefined;
    if (task) {
      setActiveTask(task);
    }
  }, []);

  const handleDragOver = useCallback(() => {
    // Optional: Handle drag over for visual feedback
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveTask(null);

      if (!over) return;

      const activeTask = active.data.current?.task as Task | undefined;
      if (!activeTask) return;

      // Determine target column
      let targetColumnId: string;
      let newOrder: number;

      if (over.data.current?.type === "column") {
        // Dropped on column (empty area)
        targetColumnId = over.id as string;
        const columnTasks = tasksByColumn[targetColumnId] || [];
        newOrder = columnTasks.length; // Add to end
      } else if (over.data.current?.type === "task") {
        // Dropped on another task
        const overTask = over.data.current.task as Task;
        targetColumnId = overTask.columnId;
        newOrder = overTask.order;
      } else {
        return;
      }

      // Only trigger if something changed
      if (activeTask.columnId !== targetColumnId || activeTask.order !== newOrder) {
        onTaskMove?.(activeTask.id, targetColumnId, newOrder);
      }
    },
    [tasksByColumn, onTaskMove]
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 p-4 overflow-x-auto h-full">
        {sortedColumns.map((column) => (
          <Column
            key={column.id}
            column={column}
            tasks={tasksByColumn[column.id] || []}
            onTaskClick={onTaskClick}
            onAddTask={() => onAddTask?.(column.id)}
            onDeleteColumn={onDeleteColumn}
            onDeleteTask={onDeleteTask}
            isAdmin={isAdmin}
          />
        ))}

        {/* Add Column button (admin only) */}
        {isAdmin && (
          <div className="flex-shrink-0 w-72">
            <button
              onClick={onAddColumn}
              className="w-full flex items-center justify-center gap-2 p-4 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:border-slate-400 dark:hover:border-slate-600 transition-colors"
            >
              + Add Column
            </button>
          </div>
        )}
      </div>

      {/* Drag Overlay */}
      <DragOverlay>
        {activeTask ? <TaskCardOverlay task={activeTask} /> : null}
      </DragOverlay>
    </DndContext>
  );
}
