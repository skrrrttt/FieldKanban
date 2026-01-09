"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, Settings, Users } from "lucide-react";
import Link from "next/link";
import { Board, TaskDetail } from "@/components/kanban";
import { AddTaskDialog } from "@/components/kanban/AddTaskDialog";
import { AddColumnDialog } from "@/components/kanban/AddColumnDialog";
import { useAppStore } from "@/lib/store/app-store";
import { mockRepository } from "@/lib/data/providers/mock";
import { createClient } from "@/lib/supabase/client";
import type { Job, Column, Task } from "@/types";

export default function JobBoardPage() {
  const params = useParams();
  const jobId = params.jobId as string;

  const [job, setJob] = useState<Job | null>(null);
  const [columns, setColumns] = useState<Column[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Add task dialog state
  const [addTaskDialogOpen, setAddTaskDialogOpen] = useState(false);
  const [addTaskColumnId, setAddTaskColumnId] = useState<string | null>(null);

  // Add column dialog state
  const [addColumnDialogOpen, setAddColumnDialogOpen] = useState(false);

  const currentUser = useAppStore((state) => state.currentUser);
  const isAdmin = currentUser?.role === "admin";

  // Load job data
  useEffect(() => {
    async function loadJob() {
      setIsLoading(true);

      const [jobResult, columnsResult, tasksResult] = await Promise.all([
        mockRepository.getJob(jobId),
        mockRepository.getColumns(jobId),
        mockRepository.getTasks(jobId),
      ]);

      if (jobResult.success && jobResult.data) {
        setJob(jobResult.data);
      }
      if (columnsResult.success && columnsResult.data) {
        setColumns(columnsResult.data);
      }
      if (tasksResult.success && tasksResult.data) {
        // For field users, filter to only their assigned tasks
        let visibleTasks = tasksResult.data;
        if (!isAdmin && currentUser) {
          visibleTasks = tasksResult.data.filter((t) =>
            t.assignedTo.includes(currentUser.id)
          );
        }
        setTasks(visibleTasks);
      }

      setIsLoading(false);
    }

    loadJob();
  }, [jobId, isAdmin, currentUser]);

  // Handle task move (drag and drop)
  const handleTaskMove = useCallback(
    async (taskId: string, columnId: string, newOrder: number) => {
      // Optimistic update
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId ? { ...t, columnId, order: newOrder } : t
        )
      );

      // Persist to repository
      const result = await mockRepository.moveTask(taskId, columnId, newOrder);
      if (!result.success) {
        // Revert on failure (would reload from DB in real app)
        console.error("Failed to move task:", result.error);
      }
    },
    []
  );

  // Handle task click - open detail modal
  const handleTaskClick = useCallback((task: Task) => {
    setSelectedTask(task);
  }, []);

  // Handle task update from detail modal
  const handleTaskUpdate = useCallback((updatedTask: Task) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === updatedTask.id ? updatedTask : t))
    );
    setSelectedTask(updatedTask);
  }, []);

  // Handle add task - open the dialog
  const handleAddTask = useCallback((columnId: string) => {
    setAddTaskColumnId(columnId);
    setAddTaskDialogOpen(true);
  }, []);

  // Handle add column - open the dialog
  const handleAddColumn = useCallback(() => {
    setAddColumnDialogOpen(true);
  }, []);

  // Refresh tasks from Supabase
  const refreshTasks = useCallback(async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("job_id", jobId)
      .order("order", { ascending: true });

    if (error) {
      console.error("Error refreshing tasks:", error);
      return;
    }

    if (data) {
      // Transform from snake_case to camelCase
      const transformedTasks: Task[] = data.map((t) => ({
        id: t.id,
        jobId: t.job_id,
        columnId: t.column_id,
        title: t.title,
        description: t.description ?? undefined,
        order: t.order,
        assignedTo: [], // Would need to fetch from task_assignments
        dueDate: t.due_date ? new Date(t.due_date) : undefined,
        createdAt: new Date(t.created_at),
        createdBy: t.created_by,
        updatedAt: new Date(t.updated_at),
        priority: t.priority ?? undefined,
        location: t.location ?? undefined,
        duration: t.duration ?? undefined,
        specReference: t.spec_reference ?? undefined,
      }));

      // For field users, filter to only their assigned tasks
      let visibleTasks = transformedTasks;
      if (!isAdmin && currentUser) {
        visibleTasks = transformedTasks.filter((t) =>
          t.assignedTo.includes(currentUser.id)
        );
      }
      setTasks(visibleTasks);
    }
  }, [jobId, isAdmin, currentUser]);

  // Refresh columns from Supabase
  const refreshColumns = useCallback(async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("columns")
      .select("*")
      .eq("job_id", jobId)
      .order("order", { ascending: true });

    if (error) {
      console.error("Error refreshing columns:", error);
      return;
    }

    if (data) {
      // Transform from snake_case to camelCase
      const transformedColumns: Column[] = data.map((c) => ({
        id: c.id,
        jobId: c.job_id,
        name: c.name,
        order: c.order,
        color: c.color ?? undefined,
        createdAt: new Date(c.created_at),
      }));
      setColumns(transformedColumns);
    }
  }, [jobId]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4">
        <p className="text-slate-500 dark:text-slate-400">Job not found</p>
        <Link
          href="/jobs"
          className="text-blue-600 hover:text-blue-700 font-medium"
        >
          Back to Jobs
        </Link>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Job Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/jobs"
              className="p-2 -ml-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="font-semibold text-slate-900 dark:text-white text-lg">
                {job.title}
              </h1>
              {job.address && (
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {job.address}
                </p>
              )}
            </div>
          </div>

          {isAdmin && (
            <div className="flex items-center gap-2">
              <button className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
                <Users className="w-5 h-5" />
              </button>
              <button className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
                <Settings className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-hidden">
        <Board
          columns={columns}
          tasks={tasks}
          onTaskMove={handleTaskMove}
          onTaskClick={handleTaskClick}
          onAddTask={handleAddTask}
          onAddColumn={handleAddColumn}
          isAdmin={isAdmin}
        />
      </div>

      {/* Task Detail Modal */}
      {selectedTask && (
        <TaskDetail
          task={selectedTask}
          isOpen={!!selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdate={handleTaskUpdate}
        />
      )}

      {/* Add Task Dialog */}
      {addTaskColumnId && currentUser && (
        <AddTaskDialog
          open={addTaskDialogOpen}
          onOpenChange={setAddTaskDialogOpen}
          jobId={jobId}
          columnId={addTaskColumnId}
          columnName={columns.find((c) => c.id === addTaskColumnId)?.name || "Column"}
          userId={currentUser.id}
          onTaskCreated={refreshTasks}
        />
      )}

      {/* Add Column Dialog */}
      <AddColumnDialog
        open={addColumnDialogOpen}
        onOpenChange={setAddColumnDialogOpen}
        jobId={jobId}
        onColumnCreated={refreshColumns}
      />
    </div>
  );
}
