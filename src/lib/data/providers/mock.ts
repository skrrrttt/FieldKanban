/**
 * Mock Data Provider
 *
 * Provides fake data for development without a backend.
 * Uses IndexedDB for persistence.
 */

import type {
  DataRepository,
} from "../repository";
import { successResponse, errorResponse } from "../repository";
import type {
  Job,
  Task,
  Column,
  Comment,
  FileAttachment,
  User,
  ApiResponse,
} from "@/types";
import * as db from "../local-db";
import { generateId } from "@/lib/utils";

// ============================================
// Sample Data for Initial Setup
// ============================================
const MOCK_USER: User = {
  id: "user_1",
  email: "fieldworker@example.com",
  name: "John Field",
  role: "field",
  createdAt: new Date(),
};

const MOCK_ADMIN: User = {
  id: "admin_1",
  email: "admin@example.com",
  name: "Admin User",
  role: "admin",
  createdAt: new Date(),
};

async function seedMockData(): Promise<void> {
  const existingJobs = await db.getAll("jobs");
  if (existingJobs.length > 0) return; // Already seeded

  // Add users
  await db.put("users", MOCK_USER);
  await db.put("users", MOCK_ADMIN);

  // Add sample jobs
  const jobs: Job[] = [
    {
      id: "job_1",
      title: "Downtown Office Renovation",
      description: "Complete renovation of 5th floor office space including electrical, HVAC, and finish work",
      address: "123 Main Street, Suite 500",
      clientName: "ABC Corp",
      status: "active",
      createdAt: new Date(),
      createdBy: "admin_1",
      updatedAt: new Date(),
    },
    {
      id: "job_2",
      title: "Riverside Apartments - Phase 2",
      description: "New construction of 24-unit apartment building, currently in framing phase",
      address: "456 River Road",
      clientName: "Riverside Development LLC",
      status: "active",
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      createdBy: "admin_1",
      updatedAt: new Date(),
    },
    {
      id: "job_3",
      title: "City Hall HVAC Upgrade",
      description: "Replace aging HVAC system with high-efficiency units",
      address: "1 City Plaza",
      clientName: "City of Springfield",
      status: "completed",
      createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      createdBy: "admin_1",
      updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    },
  ];
  for (const job of jobs) {
    await db.put("jobs", job);
  }

  // Add default columns
  const columns: Column[] = [
    { id: "col_1", jobId: "job_1", name: "To Do", order: 0, color: "#94a3b8" },
    { id: "col_2", jobId: "job_1", name: "In Progress", order: 1, color: "#3b82f6" },
    { id: "col_3", jobId: "job_1", name: "Blocked", order: 2, color: "#ef4444" },
    { id: "col_4", jobId: "job_1", name: "Complete", order: 3, color: "#22c55e" },
  ];
  for (const col of columns) {
    await db.put("columns", col);
  }

  // Add sample tasks with new field-specific properties
  const tasks: Task[] = [
    {
      id: "task_1",
      jobId: "job_1",
      columnId: "col_1",
      title: "Install electrical outlets",
      description: "Install 20 new electrical outlets per floor plan. Ensure GFCI outlets near water sources.",
      order: 0,
      assignedTo: ["user_1"],
      createdAt: new Date(),
      createdBy: "admin_1",
      updatedAt: new Date(),
      priority: "high",
      location: "Floor 5, East Wing",
      duration: 240, // 4 hours
      specReference: "E-201",
    },
    {
      id: "task_2",
      jobId: "job_1",
      columnId: "col_1",
      title: "Drywall installation",
      description: "Install drywall in conference room B. Fire-rated drywall required.",
      order: 1,
      assignedTo: ["user_1"],
      createdAt: new Date(),
      createdBy: "admin_1",
      updatedAt: new Date(),
      priority: "medium",
      location: "Floor 5, Conf Room B",
      duration: 180, // 3 hours
      specReference: "A-105",
    },
    {
      id: "task_3",
      jobId: "job_1",
      columnId: "col_2",
      title: "Paint main hallway",
      description: "Apply primer and two coats of paint (Color: Eggshell White SW7012)",
      order: 0,
      assignedTo: ["user_1"],
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      createdAt: new Date(),
      createdBy: "admin_1",
      updatedAt: new Date(),
      priority: "medium",
      location: "Floor 5, Main Hallway",
      duration: 360, // 6 hours
      specReference: "P-301",
    },
    {
      id: "task_4",
      jobId: "job_1",
      columnId: "col_3",
      title: "HVAC ductwork inspection",
      description: "Waiting for inspector availability. Ductwork installed, needs sign-off before ceiling close.",
      order: 0,
      assignedTo: ["user_1"],
      dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // Overdue
      createdAt: new Date(),
      createdBy: "admin_1",
      updatedAt: new Date(),
      priority: "urgent",
      location: "Floor 5, All Areas",
      duration: 120, // 2 hours
      specReference: "M-401",
    },
    {
      id: "task_5",
      jobId: "job_1",
      columnId: "col_4",
      title: "Demolition of old partitions",
      description: "Remove existing office partitions and dispose properly",
      order: 0,
      assignedTo: ["user_1"],
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      createdBy: "admin_1",
      updatedAt: new Date(),
      priority: "low",
      location: "Floor 5, Open Area",
      duration: 480, // 8 hours
    },
  ];
  for (const task of tasks) {
    await db.put("tasks", task);
  }

  // Add a sample comment
  const comment: Comment = {
    id: "comment_1",
    taskId: "task_3",
    userId: "user_1",
    content: "Started work on this today. Will need more paint supplies.",
    createdAt: new Date(),
  };
  await db.put("comments", comment);

  // Set current user in metadata
  await db.setMetadata("currentUser", MOCK_USER);
}

// ============================================
// Mock Repository Implementation
// ============================================
export class MockRepository implements DataRepository {
  private initialized = false;

  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await seedMockData();
      this.initialized = true;
    }
  }

  // Jobs
  async getJobs(): Promise<ApiResponse<Job[]>> {
    await this.ensureInitialized();
    const jobs = await db.getAll("jobs");
    return successResponse(jobs);
  }

  async getJob(id: string): Promise<ApiResponse<Job>> {
    await this.ensureInitialized();
    const job = await db.getById("jobs", id);
    if (!job) return errorResponse("Job not found");
    return successResponse(job);
  }

  async createJob(jobData: Omit<Job, "id" | "createdAt" | "updatedAt">): Promise<ApiResponse<Job>> {
    await this.ensureInitialized();
    const job: Job = {
      ...jobData,
      id: generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await db.put("jobs", job);
    return successResponse(job);
  }

  async updateJob(id: string, updates: Partial<Job>): Promise<ApiResponse<Job>> {
    await this.ensureInitialized();
    const existing = await db.getById("jobs", id);
    if (!existing) return errorResponse("Job not found");
    const updated: Job = { ...existing, ...updates, updatedAt: new Date() };
    await db.put("jobs", updated);
    return successResponse(updated);
  }

  async deleteJob(id: string): Promise<ApiResponse<void>> {
    await this.ensureInitialized();
    await db.deleteById("jobs", id);
    return successResponse(undefined);
  }

  // Columns
  async getColumns(jobId: string): Promise<ApiResponse<Column[]>> {
    await this.ensureInitialized();
    const columns = await db.getByIndex("columns", "jobId", jobId);
    columns.sort((a, b) => a.order - b.order);
    return successResponse(columns);
  }

  async createColumn(columnData: Omit<Column, "id">): Promise<ApiResponse<Column>> {
    await this.ensureInitialized();
    const column: Column = { ...columnData, id: generateId() };
    await db.put("columns", column);
    return successResponse(column);
  }

  async updateColumn(id: string, updates: Partial<Column>): Promise<ApiResponse<Column>> {
    await this.ensureInitialized();
    const existing = await db.getById("columns", id);
    if (!existing) return errorResponse("Column not found");
    const updated: Column = { ...existing, ...updates };
    await db.put("columns", updated);
    return successResponse(updated);
  }

  async deleteColumn(id: string): Promise<ApiResponse<void>> {
    await this.ensureInitialized();
    await db.deleteById("columns", id);
    return successResponse(undefined);
  }

  async reorderColumns(jobId: string, columnIds: string[]): Promise<ApiResponse<void>> {
    await this.ensureInitialized();
    for (let i = 0; i < columnIds.length; i++) {
      const column = await db.getById("columns", columnIds[i]);
      if (column && column.jobId === jobId) {
        column.order = i;
        await db.put("columns", column);
      }
    }
    return successResponse(undefined);
  }

  // Tasks
  async getTasks(jobId: string): Promise<ApiResponse<Task[]>> {
    await this.ensureInitialized();
    const tasks = await db.getByIndex("tasks", "jobId", jobId);
    return successResponse(tasks);
  }

  async getTasksForUser(userId: string): Promise<ApiResponse<Task[]>> {
    await this.ensureInitialized();
    const allTasks = await db.getAll("tasks");
    const userTasks = allTasks.filter((t) => t.assignedTo.includes(userId));
    return successResponse(userTasks);
  }

  async getTask(id: string): Promise<ApiResponse<Task>> {
    await this.ensureInitialized();
    const task = await db.getById("tasks", id);
    if (!task) return errorResponse("Task not found");
    return successResponse(task);
  }

  async createTask(taskData: Omit<Task, "id" | "createdAt" | "updatedAt">): Promise<ApiResponse<Task>> {
    await this.ensureInitialized();
    const task: Task = {
      ...taskData,
      id: generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await db.put("tasks", task);
    return successResponse(task);
  }

  async updateTask(id: string, updates: Partial<Task>): Promise<ApiResponse<Task>> {
    await this.ensureInitialized();
    const existing = await db.getById("tasks", id);
    if (!existing) return errorResponse("Task not found");
    const updated: Task = { ...existing, ...updates, updatedAt: new Date() };
    await db.put("tasks", updated);
    return successResponse(updated);
  }

  async deleteTask(id: string): Promise<ApiResponse<void>> {
    await this.ensureInitialized();
    await db.deleteById("tasks", id);
    return successResponse(undefined);
  }

  async moveTask(taskId: string, columnId: string, order: number): Promise<ApiResponse<Task>> {
    await this.ensureInitialized();
    const task = await db.getById("tasks", taskId);
    if (!task) return errorResponse("Task not found");
    task.columnId = columnId;
    task.order = order;
    task.updatedAt = new Date();
    await db.put("tasks", task);
    return successResponse(task);
  }

  // Comments
  async getComments(taskId: string): Promise<ApiResponse<Comment[]>> {
    await this.ensureInitialized();
    const comments = await db.getByIndex("comments", "taskId", taskId);
    comments.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    return successResponse(comments);
  }

  async createComment(commentData: Omit<Comment, "id" | "createdAt">): Promise<ApiResponse<Comment>> {
    await this.ensureInitialized();
    const comment: Comment = {
      ...commentData,
      id: generateId(),
      createdAt: new Date(),
    };
    await db.put("comments", comment);
    return successResponse(comment);
  }

  async deleteComment(id: string): Promise<ApiResponse<void>> {
    await this.ensureInitialized();
    await db.deleteById("comments", id);
    return successResponse(undefined);
  }

  // Files
  async getFiles(taskId: string): Promise<ApiResponse<FileAttachment[]>> {
    await this.ensureInitialized();
    const files = await db.getByIndex("files", "taskId", taskId);
    return successResponse(files);
  }

  async uploadFile(taskId: string, file: File): Promise<ApiResponse<FileAttachment>> {
    await this.ensureInitialized();
    const currentUser = await db.getMetadata<User>("currentUser");
    const fileAttachment: FileAttachment = {
      id: generateId(),
      taskId,
      name: file.name,
      type: file.type.startsWith("image/") ? "image" : "document",
      mimeType: file.type,
      size: file.size,
      url: URL.createObjectURL(file), // Local URL for mock
      uploadedBy: currentUser?.id || "unknown",
      uploadedAt: new Date(),
      syncStatus: "pending",
    };
    await db.put("files", fileAttachment);
    return successResponse(fileAttachment);
  }

  async deleteFile(id: string): Promise<ApiResponse<void>> {
    await this.ensureInitialized();
    await db.deleteById("files", id);
    return successResponse(undefined);
  }

  async getFileUrl(id: string): Promise<ApiResponse<string>> {
    await this.ensureInitialized();
    const file = await db.getById("files", id);
    if (!file) return errorResponse("File not found");
    return successResponse(file.url);
  }

  // Users
  async getCurrentUser(): Promise<ApiResponse<User>> {
    await this.ensureInitialized();
    const user = await db.getMetadata<User>("currentUser");
    if (!user) return errorResponse("Not authenticated");
    return successResponse(user);
  }

  async getUsers(): Promise<ApiResponse<User[]>> {
    await this.ensureInitialized();
    const users = await db.getAll("users");
    return successResponse(users);
  }
}

// Export singleton instance
export const mockRepository = new MockRepository();
