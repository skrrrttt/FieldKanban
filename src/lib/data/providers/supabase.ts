/**
 * Supabase Data Provider
 *
 * Provides real data from Supabase PostgreSQL database.
 * Implements the DataRepository interface.
 */

import type { DataRepository } from "../repository";
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
import type { Database, Tables } from "@/types/supabase";
import { createClient } from "@/lib/supabase/client";
import type { SupabaseClient } from "@supabase/supabase-js";

// ============================================
// Type Aliases for Database Rows
// ============================================
type DbJob = Tables<"jobs">;
type DbColumn = Tables<"columns">;
type DbTask = Tables<"tasks">;
type DbComment = Tables<"comments">;
type DbFile = Tables<"file_attachments">;
type DbProfile = Tables<"profiles">;

// ============================================
// Transformation Functions (snake_case → camelCase)
// ============================================
function toJob(row: DbJob): Job {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? undefined,
    address: row.address ?? undefined,
    clientName: row.client_name ?? undefined,
    status: row.status,
    createdAt: new Date(row.created_at),
    createdBy: row.created_by,
    updatedAt: new Date(row.updated_at),
  };
}

function toColumn(row: DbColumn): Column {
  return {
    id: row.id,
    jobId: row.job_id,
    name: row.name,
    order: row.order,
    color: row.color ?? undefined,
  };
}

function toTask(row: DbTask, assignedTo: string[] = []): Task {
  return {
    id: row.id,
    jobId: row.job_id,
    columnId: row.column_id,
    title: row.title,
    description: row.description ?? undefined,
    order: row.order,
    assignedTo,
    dueDate: row.due_date ? new Date(row.due_date) : undefined,
    createdAt: new Date(row.created_at),
    createdBy: row.created_by,
    updatedAt: new Date(row.updated_at),
    priority: row.priority ?? undefined,
    location: row.location ?? undefined,
    duration: row.duration ?? undefined,
    specReference: row.spec_reference ?? undefined,
  };
}

function toComment(row: DbComment): Comment {
  return {
    id: row.id,
    taskId: row.task_id,
    userId: row.user_id,
    content: row.content,
    createdAt: new Date(row.created_at),
  };
}

function toFile(row: DbFile, url: string): FileAttachment {
  return {
    id: row.id,
    taskId: row.task_id,
    name: row.name,
    type: row.type,
    mimeType: row.mime_type,
    size: row.size,
    url,
    uploadedBy: row.uploaded_by,
    uploadedAt: new Date(row.uploaded_at),
    syncStatus: row.sync_status,
  };
}

function toUser(row: DbProfile): User {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    role: row.role,
    avatarUrl: row.avatar_url ?? undefined,
    createdAt: new Date(row.created_at),
  };
}

// ============================================
// Supabase Repository Implementation
// ============================================
export class SupabaseRepository implements DataRepository {
  private supabase: SupabaseClient<Database>;

  constructor() {
    this.supabase = createClient();
  }

  // ============================================
  // Jobs
  // ============================================
  async getJobs(): Promise<ApiResponse<Job[]>> {
    const { data, error } = await this.supabase
      .from("jobs")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) return errorResponse(error.message);
    return successResponse(data.map(toJob));
  }

  async getJob(id: string): Promise<ApiResponse<Job>> {
    const { data, error } = await this.supabase
      .from("jobs")
      .select("*")
      .eq("id", id)
      .single();

    if (error) return errorResponse(error.message);
    return successResponse(toJob(data));
  }

  async createJob(
    jobData: Omit<Job, "id" | "createdAt" | "updatedAt">
  ): Promise<ApiResponse<Job>> {
    const { data, error } = await this.supabase
      .from("jobs")
      .insert({
        title: jobData.title,
        description: jobData.description,
        address: jobData.address,
        client_name: jobData.clientName,
        status: jobData.status,
        created_by: jobData.createdBy,
      })
      .select()
      .single();

    if (error) return errorResponse(error.message);
    return successResponse(toJob(data));
  }

  async updateJob(id: string, updates: Partial<Job>): Promise<ApiResponse<Job>> {
    const updateData: Partial<Database["public"]["Tables"]["jobs"]["Update"]> = {};

    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.address !== undefined) updateData.address = updates.address;
    if (updates.clientName !== undefined) updateData.client_name = updates.clientName;
    if (updates.status !== undefined) updateData.status = updates.status;

    const { data, error } = await this.supabase
      .from("jobs")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) return errorResponse(error.message);
    return successResponse(toJob(data));
  }

  async deleteJob(id: string): Promise<ApiResponse<void>> {
    const { error } = await this.supabase.from("jobs").delete().eq("id", id);
    if (error) return errorResponse(error.message);
    return successResponse(undefined);
  }

  // ============================================
  // Columns
  // ============================================
  async getColumns(jobId: string): Promise<ApiResponse<Column[]>> {
    const { data, error } = await this.supabase
      .from("columns")
      .select("*")
      .eq("job_id", jobId)
      .order("order", { ascending: true });

    if (error) return errorResponse(error.message);
    return successResponse(data.map(toColumn));
  }

  async createColumn(columnData: Omit<Column, "id">): Promise<ApiResponse<Column>> {
    const { data, error } = await this.supabase
      .from("columns")
      .insert({
        job_id: columnData.jobId,
        name: columnData.name,
        order: columnData.order,
        color: columnData.color,
      })
      .select()
      .single();

    if (error) return errorResponse(error.message);
    return successResponse(toColumn(data));
  }

  async updateColumn(id: string, updates: Partial<Column>): Promise<ApiResponse<Column>> {
    const updateData: Partial<Database["public"]["Tables"]["columns"]["Update"]> = {};

    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.order !== undefined) updateData.order = updates.order;
    if (updates.color !== undefined) updateData.color = updates.color;

    const { data, error } = await this.supabase
      .from("columns")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) return errorResponse(error.message);
    return successResponse(toColumn(data));
  }

  async deleteColumn(id: string): Promise<ApiResponse<void>> {
    const { error } = await this.supabase.from("columns").delete().eq("id", id);
    if (error) return errorResponse(error.message);
    return successResponse(undefined);
  }

  async reorderColumns(jobId: string, columnIds: string[]): Promise<ApiResponse<void>> {
    // Update each column's order
    for (let i = 0; i < columnIds.length; i++) {
      const { error } = await this.supabase
        .from("columns")
        .update({ order: i })
        .eq("id", columnIds[i])
        .eq("job_id", jobId);

      if (error) return errorResponse(error.message);
    }
    return successResponse(undefined);
  }

  // ============================================
  // Tasks
  // ============================================
  async getTasks(jobId: string): Promise<ApiResponse<Task[]>> {
    // Get tasks
    const { data: tasks, error: tasksError } = await this.supabase
      .from("tasks")
      .select("*")
      .eq("job_id", jobId)
      .order("order", { ascending: true });

    if (tasksError) return errorResponse(tasksError.message);

    // Get task assignments for these tasks
    const taskIds = tasks.map((t) => t.id);
    const { data: assignments, error: assignError } = await this.supabase
      .from("task_assignments")
      .select("task_id, user_id")
      .in("task_id", taskIds.length > 0 ? taskIds : ["__none__"]);

    if (assignError) return errorResponse(assignError.message);

    // Group assignments by task
    const assignmentMap = new Map<string, string[]>();
    for (const a of assignments || []) {
      const existing = assignmentMap.get(a.task_id) || [];
      existing.push(a.user_id);
      assignmentMap.set(a.task_id, existing);
    }

    // Convert tasks with assignments
    const result = tasks.map((t) => toTask(t, assignmentMap.get(t.id) || []));
    return successResponse(result);
  }

  async getTasksForUser(userId: string): Promise<ApiResponse<Task[]>> {
    // Get task IDs assigned to this user
    const { data: assignments, error: assignError } = await this.supabase
      .from("task_assignments")
      .select("task_id")
      .eq("user_id", userId);

    if (assignError) return errorResponse(assignError.message);

    const taskIds = assignments.map((a) => a.task_id);
    if (taskIds.length === 0) return successResponse([]);

    // Get the tasks
    const { data: tasks, error: tasksError } = await this.supabase
      .from("tasks")
      .select("*")
      .in("id", taskIds)
      .order("order", { ascending: true });

    if (tasksError) return errorResponse(tasksError.message);

    // Get all assignments for these tasks
    const { data: allAssignments, error: allAssignError } = await this.supabase
      .from("task_assignments")
      .select("task_id, user_id")
      .in("task_id", taskIds);

    if (allAssignError) return errorResponse(allAssignError.message);

    // Group assignments by task
    const assignmentMap = new Map<string, string[]>();
    for (const a of allAssignments || []) {
      const existing = assignmentMap.get(a.task_id) || [];
      existing.push(a.user_id);
      assignmentMap.set(a.task_id, existing);
    }

    const result = tasks.map((t) => toTask(t, assignmentMap.get(t.id) || []));
    return successResponse(result);
  }

  async getTask(id: string): Promise<ApiResponse<Task>> {
    const { data: task, error: taskError } = await this.supabase
      .from("tasks")
      .select("*")
      .eq("id", id)
      .single();

    if (taskError) return errorResponse(taskError.message);

    // Get assignments
    const { data: assignments, error: assignError } = await this.supabase
      .from("task_assignments")
      .select("user_id")
      .eq("task_id", id);

    if (assignError) return errorResponse(assignError.message);

    const assignedTo = assignments.map((a) => a.user_id);
    return successResponse(toTask(task, assignedTo));
  }

  async createTask(
    taskData: Omit<Task, "id" | "createdAt" | "updatedAt">
  ): Promise<ApiResponse<Task>> {
    const { data, error } = await this.supabase
      .from("tasks")
      .insert({
        job_id: taskData.jobId,
        column_id: taskData.columnId,
        title: taskData.title,
        description: taskData.description,
        order: taskData.order,
        created_by: taskData.createdBy,
        priority: taskData.priority,
        location: taskData.location,
        duration: taskData.duration,
        spec_reference: taskData.specReference,
        due_date: taskData.dueDate?.toISOString(),
      })
      .select()
      .single();

    if (error) return errorResponse(error.message);

    // Create task assignments
    if (taskData.assignedTo && taskData.assignedTo.length > 0) {
      const assignments = taskData.assignedTo.map((userId) => ({
        task_id: data.id,
        user_id: userId,
      }));
      await this.supabase.from("task_assignments").insert(assignments);
    }

    return successResponse(toTask(data, taskData.assignedTo || []));
  }

  async updateTask(id: string, updates: Partial<Task>): Promise<ApiResponse<Task>> {
    const updateData: Partial<Database["public"]["Tables"]["tasks"]["Update"]> = {};

    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.columnId !== undefined) updateData.column_id = updates.columnId;
    if (updates.order !== undefined) updateData.order = updates.order;
    if (updates.priority !== undefined) updateData.priority = updates.priority;
    if (updates.location !== undefined) updateData.location = updates.location;
    if (updates.duration !== undefined) updateData.duration = updates.duration;
    if (updates.specReference !== undefined) updateData.spec_reference = updates.specReference;
    if (updates.dueDate !== undefined) {
      updateData.due_date = updates.dueDate?.toISOString() ?? null;
    }

    const { data, error } = await this.supabase
      .from("tasks")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) return errorResponse(error.message);

    // Update assignments if provided
    let assignedTo: string[] = [];
    if (updates.assignedTo !== undefined) {
      // Delete existing assignments
      await this.supabase.from("task_assignments").delete().eq("task_id", id);

      // Create new assignments
      if (updates.assignedTo.length > 0) {
        const assignments = updates.assignedTo.map((userId) => ({
          task_id: id,
          user_id: userId,
        }));
        await this.supabase.from("task_assignments").insert(assignments);
      }
      assignedTo = updates.assignedTo;
    } else {
      // Fetch current assignments
      const { data: assignments } = await this.supabase
        .from("task_assignments")
        .select("user_id")
        .eq("task_id", id);
      assignedTo = assignments?.map((a) => a.user_id) || [];
    }

    return successResponse(toTask(data, assignedTo));
  }

  async deleteTask(id: string): Promise<ApiResponse<void>> {
    // Delete task assignments first (cascade might handle this, but being explicit)
    await this.supabase.from("task_assignments").delete().eq("task_id", id);

    const { error } = await this.supabase.from("tasks").delete().eq("id", id);
    if (error) return errorResponse(error.message);
    return successResponse(undefined);
  }

  async moveTask(
    taskId: string,
    columnId: string,
    order: number
  ): Promise<ApiResponse<Task>> {
    const { data, error } = await this.supabase
      .from("tasks")
      .update({ column_id: columnId, order })
      .eq("id", taskId)
      .select()
      .single();

    if (error) return errorResponse(error.message);

    // Fetch assignments
    const { data: assignments } = await this.supabase
      .from("task_assignments")
      .select("user_id")
      .eq("task_id", taskId);

    const assignedTo = assignments?.map((a) => a.user_id) || [];
    return successResponse(toTask(data, assignedTo));
  }

  // ============================================
  // Comments
  // ============================================
  async getComments(taskId: string): Promise<ApiResponse<Comment[]>> {
    const { data, error } = await this.supabase
      .from("comments")
      .select("*")
      .eq("task_id", taskId)
      .order("created_at", { ascending: true });

    if (error) return errorResponse(error.message);
    return successResponse(data.map(toComment));
  }

  async createComment(
    commentData: Omit<Comment, "id" | "createdAt">
  ): Promise<ApiResponse<Comment>> {
    const { data, error } = await this.supabase
      .from("comments")
      .insert({
        task_id: commentData.taskId,
        user_id: commentData.userId,
        content: commentData.content,
      })
      .select()
      .single();

    if (error) return errorResponse(error.message);
    return successResponse(toComment(data));
  }

  async deleteComment(id: string): Promise<ApiResponse<void>> {
    const { error } = await this.supabase.from("comments").delete().eq("id", id);
    if (error) return errorResponse(error.message);
    return successResponse(undefined);
  }

  // ============================================
  // Files
  // ============================================
  async getFiles(taskId: string): Promise<ApiResponse<FileAttachment[]>> {
    const { data, error } = await this.supabase
      .from("file_attachments")
      .select("*")
      .eq("task_id", taskId)
      .order("uploaded_at", { ascending: false });

    if (error) return errorResponse(error.message);

    // Generate signed URLs for each file
    const files = await Promise.all(
      data.map(async (file) => {
        const { data: urlData } = await this.supabase.storage
          .from("task-attachments")
          .createSignedUrl(file.storage_path, 3600); // 1 hour expiry
        return toFile(file, urlData?.signedUrl || "");
      })
    );

    return successResponse(files);
  }

  async uploadFile(taskId: string, file: File): Promise<ApiResponse<FileAttachment>> {
    // Get current user
    const { data: { user } } = await this.supabase.auth.getUser();
    if (!user) return errorResponse("Not authenticated");

    // Generate storage path
    const fileExt = file.name.split(".").pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const storagePath = `${taskId}/${fileName}`;

    // Upload to storage
    const { error: uploadError } = await this.supabase.storage
      .from("task-attachments")
      .upload(storagePath, file);

    if (uploadError) return errorResponse(uploadError.message);

    // Create file record
    const fileType: "image" | "document" = file.type.startsWith("image/")
      ? "image"
      : "document";

    const { data, error } = await this.supabase
      .from("file_attachments")
      .insert({
        task_id: taskId,
        name: file.name,
        type: fileType,
        mime_type: file.type,
        size: file.size,
        storage_path: storagePath,
        uploaded_by: user.id,
        sync_status: "synced",
      })
      .select()
      .single();

    if (error) return errorResponse(error.message);

    // Get signed URL
    const { data: urlData } = await this.supabase.storage
      .from("task-attachments")
      .createSignedUrl(storagePath, 3600);

    return successResponse(toFile(data, urlData?.signedUrl || ""));
  }

  async deleteFile(id: string): Promise<ApiResponse<void>> {
    // Get file record to find storage path
    const { data: file, error: findError } = await this.supabase
      .from("file_attachments")
      .select("storage_path")
      .eq("id", id)
      .single();

    if (findError) return errorResponse(findError.message);

    // Delete from storage
    const { error: storageError } = await this.supabase.storage
      .from("task-attachments")
      .remove([file.storage_path]);

    if (storageError) return errorResponse(storageError.message);

    // Delete record
    const { error } = await this.supabase
      .from("file_attachments")
      .delete()
      .eq("id", id);

    if (error) return errorResponse(error.message);
    return successResponse(undefined);
  }

  async getFileUrl(id: string): Promise<ApiResponse<string>> {
    const { data: file, error: findError } = await this.supabase
      .from("file_attachments")
      .select("storage_path")
      .eq("id", id)
      .single();

    if (findError) return errorResponse(findError.message);

    const { data: urlData, error: urlError } = await this.supabase.storage
      .from("task-attachments")
      .createSignedUrl(file.storage_path, 3600);

    if (urlError) return errorResponse(urlError.message);
    return successResponse(urlData.signedUrl);
  }

  // ============================================
  // Users
  // ============================================
  async getCurrentUser(): Promise<ApiResponse<User>> {
    const { data: { user } } = await this.supabase.auth.getUser();
    if (!user) return errorResponse("Not authenticated");

    const { data: profile, error } = await this.supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error) return errorResponse(error.message);
    return successResponse(toUser(profile));
  }

  async getUsers(): Promise<ApiResponse<User[]>> {
    const { data, error } = await this.supabase
      .from("profiles")
      .select("*")
      .order("name", { ascending: true });

    if (error) return errorResponse(error.message);
    return successResponse(data.map(toUser));
  }
}

// Export singleton instance
export const supabaseRepository = new SupabaseRepository();
