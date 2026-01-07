"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, Settings, Users } from "lucide-react";
import Link from "next/link";
import { Board, TaskDetail } from "@/components/kanban";
import { useAppStore } from "@/lib/store/app-store";
import { mockRepository } from "@/lib/data/providers/mock";
import type { Job, Column, Task } from "@/types";

export default function JobBoardPage() {
  const params = useParams();
  const jobId = params.jobId as string;

  const [job, setJob] = useState<Job | null>(null);
  const [columns, setColumns] = useState<Column[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

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

  // Handle add task
  const handleAddTask = useCallback(
    async (columnId: string) => {
      // For now, just log - would open a modal in real implementation
      console.log("Add task to column:", columnId);
    },
    []
  );

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
    </div>
  );
}
