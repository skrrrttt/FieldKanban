"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, Settings, Users } from "lucide-react";
import Link from "next/link";
import { Board, TaskDetail } from "@/components/kanban";
import { AddTaskDialog } from "@/components/kanban/AddTaskDialog";
import { AddColumnDialog } from "@/components/kanban/AddColumnDialog";
import { JobStatusDropdown } from "@/components/jobs";
import { useAppStore } from "@/lib/store/app-store";
import { useRepository } from "@/lib/data/repository-context";
import { toast } from "sonner";
import type { Job, Column, Task, JobStatus } from "@/types";

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
  const repository = useRepository();

  // Use refs to avoid re-running effect when these change
  const currentUserRef = useRef(currentUser);
  const isAdminRef = useRef(isAdmin);
  currentUserRef.current = currentUser;
  isAdminRef.current = isAdmin;

  // Track if we've loaded data for this job
  const hasLoadedRef = useRef<string | null>(null);

  // Load job data - only when jobId changes, not on every render
  useEffect(() => {
    // Skip if we've already loaded this job
    if (hasLoadedRef.current === jobId) {
      return;
    }

    async function loadJob() {
      setIsLoading(true);
      hasLoadedRef.current = jobId;

      const [jobResult, columnsResult, tasksResult] = await Promise.all([
        repository.getJob(jobId),
        repository.getColumns(jobId),
        repository.getTasks(jobId),
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
        if (!isAdminRef.current && currentUserRef.current) {
          visibleTasks = tasksResult.data.filter((t) =>
            t.assignedTo.includes(currentUserRef.current!.id)
          );
        }
        setTasks(visibleTasks);
      }

      setIsLoading(false);
    }

    loadJob();
  }, [jobId, repository]);

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
      const result = await repository.moveTask(taskId, columnId, newOrder);
      if (!result.success) {
        // Revert on failure (would reload from DB in real app)
        console.error("Failed to move task:", result.error);
      }
    },
    [repository]
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

  // Handle delete column
  const handleDeleteColumn = useCallback(
    async (columnId: string) => {
      if (!confirm("Are you sure you want to delete this column? All tasks in this column will be deleted.")) {
        return;
      }

      const result = await repository.deleteColumn(columnId);
      if (result.success) {
        setColumns((prev) => prev.filter((c) => c.id !== columnId));
        setTasks((prev) => prev.filter((t) => t.columnId !== columnId));
      } else {
        console.error("Failed to delete column:", result.error);
      }
    },
    [repository]
  );

  // Handle delete task
  const handleDeleteTask = useCallback(
    async (taskId: string) => {
      if (!confirm("Are you sure you want to delete this task?")) {
        return;
      }

      const result = await repository.deleteTask(taskId);
      if (result.success) {
        setTasks((prev) => prev.filter((t) => t.id !== taskId));
      } else {
        console.error("Failed to delete task:", result.error);
      }
    },
    [repository]
  );

  // Refresh tasks from repository
  const refreshTasks = useCallback(async () => {
    const result = await repository.getTasks(jobId);
    if (!result.success || !result.data) {
      console.error("Error refreshing tasks:", result.error);
      return;
    }

    // For field users, filter to only their assigned tasks
    let visibleTasks = result.data;
    if (!isAdmin && currentUser) {
      visibleTasks = result.data.filter((t) =>
        t.assignedTo.includes(currentUser.id)
      );
    }
    setTasks(visibleTasks);
  }, [jobId, isAdmin, currentUser, repository]);

  // Refresh columns from repository
  const refreshColumns = useCallback(async () => {
    const result = await repository.getColumns(jobId);
    if (!result.success || !result.data) {
      console.error("Error refreshing columns:", result.error);
      return;
    }
    setColumns(result.data);
  }, [jobId, repository]);

  // Handle job status change - optimistic update
  const handleJobStatusChange = useCallback((newStatus: JobStatus) => {
    if (job) {
      setJob({ ...job, status: newStatus });
    }
  }, [job]);

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
              <div className="flex items-center gap-3">
                <h1 className="font-semibold text-slate-900 dark:text-white text-lg">
                  {job.title}
                </h1>
                <JobStatusDropdown
                  job={job}
                  isAdmin={isAdmin}
                  onStatusChange={handleJobStatusChange}
                />
              </div>
              {job.address && (
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {job.address}
                </p>
              )}
            </div>
          </div>

          {isAdmin && (
            <div className="flex items-center gap-2">
              <button
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                onClick={() => toast.info("Team management coming soon", { description: "Assign users to this job" })}
                title="Manage team"
              >
                <Users className="w-5 h-5" />
              </button>
              <button
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                onClick={() => toast.info("Job settings coming soon", { description: "Edit job details and columns" })}
                title="Job settings"
              >
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
          onDeleteColumn={handleDeleteColumn}
          onDeleteTask={handleDeleteTask}
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
