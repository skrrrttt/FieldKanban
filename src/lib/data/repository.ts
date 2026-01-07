/**
 * Data Repository Interface
 *
 * This abstraction layer allows swapping between:
 * - Mock provider (for development)
 * - Supabase provider (for production)
 * - Any other backend
 */

import type {
  Job,
  Task,
  Column,
  Comment,
  FileAttachment,
  User,
  ApiResponse,
} from "@/types";

// ============================================
// Repository Interface
// ============================================
export interface DataRepository {
  // Jobs
  getJobs(): Promise<ApiResponse<Job[]>>;
  getJob(id: string): Promise<ApiResponse<Job>>;
  createJob(job: Omit<Job, "id" | "createdAt" | "updatedAt">): Promise<ApiResponse<Job>>;
  updateJob(id: string, updates: Partial<Job>): Promise<ApiResponse<Job>>;
  deleteJob(id: string): Promise<ApiResponse<void>>;

  // Columns
  getColumns(jobId: string): Promise<ApiResponse<Column[]>>;
  createColumn(column: Omit<Column, "id">): Promise<ApiResponse<Column>>;
  updateColumn(id: string, updates: Partial<Column>): Promise<ApiResponse<Column>>;
  deleteColumn(id: string): Promise<ApiResponse<void>>;
  reorderColumns(jobId: string, columnIds: string[]): Promise<ApiResponse<void>>;

  // Tasks
  getTasks(jobId: string): Promise<ApiResponse<Task[]>>;
  getTasksForUser(userId: string): Promise<ApiResponse<Task[]>>;
  getTask(id: string): Promise<ApiResponse<Task>>;
  createTask(task: Omit<Task, "id" | "createdAt" | "updatedAt">): Promise<ApiResponse<Task>>;
  updateTask(id: string, updates: Partial<Task>): Promise<ApiResponse<Task>>;
  deleteTask(id: string): Promise<ApiResponse<void>>;
  moveTask(taskId: string, columnId: string, order: number): Promise<ApiResponse<Task>>;

  // Comments
  getComments(taskId: string): Promise<ApiResponse<Comment[]>>;
  createComment(comment: Omit<Comment, "id" | "createdAt">): Promise<ApiResponse<Comment>>;
  deleteComment(id: string): Promise<ApiResponse<void>>;

  // Files
  getFiles(taskId: string): Promise<ApiResponse<FileAttachment[]>>;
  uploadFile(taskId: string, file: File): Promise<ApiResponse<FileAttachment>>;
  deleteFile(id: string): Promise<ApiResponse<void>>;
  getFileUrl(id: string): Promise<ApiResponse<string>>;

  // Users
  getCurrentUser(): Promise<ApiResponse<User>>;
  getUsers(): Promise<ApiResponse<User[]>>;
}

// ============================================
// Repository Context (for dependency injection)
// ============================================
let currentRepository: DataRepository | null = null;

export function setRepository(repo: DataRepository): void {
  currentRepository = repo;
}

export function getRepository(): DataRepository {
  if (!currentRepository) {
    throw new Error("Repository not initialized. Call setRepository() first.");
  }
  return currentRepository;
}

// ============================================
// Helper for creating API responses
// ============================================
export function successResponse<T>(data: T): ApiResponse<T> {
  return { data, error: null, success: true };
}

export function errorResponse<T>(error: string): ApiResponse<T> {
  return { data: null, error, success: false };
}
