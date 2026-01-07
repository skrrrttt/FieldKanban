// ============================================
// User Types
// ============================================
export type UserRole = "admin" | "field";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
  createdAt: Date;
}

// ============================================
// Job Types
// ============================================
export type JobStatus = "active" | "completed" | "archived";

export interface Job {
  id: string;
  title: string;
  description?: string;
  address?: string;
  clientName?: string;
  status: JobStatus;
  createdAt: Date;
  createdBy: string;
  updatedAt: Date;
}

// ============================================
// Column Types (Admin-customizable Kanban columns)
// ============================================
export interface Column {
  id: string;
  jobId: string;
  name: string;
  order: number;
  color?: string;
}

// ============================================
// Task Types
// ============================================
export type TaskPriority = "low" | "medium" | "high" | "urgent";

export interface Task {
  id: string;
  jobId: string;
  columnId: string;
  title: string;
  description?: string;
  order: number;
  assignedTo: string[]; // User IDs
  dueDate?: Date;
  createdAt: Date;
  createdBy: string;
  updatedAt: Date;
  // Field-specific properties
  priority?: TaskPriority;
  location?: string; // e.g., "Floor 2, Room 205"
  duration?: number; // Estimated minutes to complete
  specReference?: string; // Drawing/spec number reference
}

// ============================================
// Comment Types
// ============================================
export interface Comment {
  id: string;
  taskId: string;
  userId: string;
  content: string;
  createdAt: Date;
}

// ============================================
// File Attachment Types
// ============================================
export type FileType = "image" | "document";
export type SyncStatus = "synced" | "pending" | "error";

export interface FileAttachment {
  id: string;
  taskId: string;
  name: string;
  type: FileType;
  mimeType: string;
  size: number;
  url: string;
  localBlobUrl?: string; // For offline cached files
  uploadedBy: string;
  uploadedAt: Date;
  syncStatus: SyncStatus;
}

// ============================================
// Sync Queue Types (for offline operations)
// ============================================
export type SyncOperationType = "create" | "update" | "delete";
export type SyncEntityType = "task" | "comment" | "file" | "job" | "column";
export type SyncOperationStatus = "pending" | "processing" | "failed";

export interface SyncOperation {
  id: string;
  type: SyncOperationType;
  entity: SyncEntityType;
  entityId: string;
  data: unknown;
  timestamp: Date;
  retryCount: number;
  status: SyncOperationStatus;
  errorMessage?: string;
}

// ============================================
// UI State Types
// ============================================
export interface OfflineState {
  isOnline: boolean;
  pendingOperations: number;
  lastSyncedAt?: Date;
}

// ============================================
// API Response Types (for future backend integration)
// ============================================
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}
