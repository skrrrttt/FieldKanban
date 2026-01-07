/**
 * IndexedDB Local Database
 *
 * Handles offline data storage using the idb library.
 * All data is stored locally and synced when online.
 */

import { openDB, type IDBPDatabase } from "idb";
import type {
  Job,
  Task,
  Column,
  Comment,
  FileAttachment,
  User,
  SyncOperation,
} from "@/types";

// ============================================
// Database Schema
// ============================================
const DB_NAME = "fieldkanban";
const DB_VERSION = 1;

interface FieldKanbanDB {
  jobs: Job;
  tasks: Task;
  columns: Column;
  comments: Comment;
  files: FileAttachment;
  users: User;
  syncQueue: SyncOperation;
  metadata: { key: string; value: unknown };
}

type StoreName = keyof FieldKanbanDB;

// ============================================
// Database Initialization
// ============================================
let dbInstance: IDBPDatabase<FieldKanbanDB> | null = null;

export async function getDB(): Promise<IDBPDatabase<FieldKanbanDB>> {
  if (dbInstance) return dbInstance;

  dbInstance = await openDB<FieldKanbanDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Jobs store
      if (!db.objectStoreNames.contains("jobs")) {
        const jobStore = db.createObjectStore("jobs", { keyPath: "id" });
        jobStore.createIndex("status", "status");
        jobStore.createIndex("updatedAt", "updatedAt");
      }

      // Tasks store
      if (!db.objectStoreNames.contains("tasks")) {
        const taskStore = db.createObjectStore("tasks", { keyPath: "id" });
        taskStore.createIndex("jobId", "jobId");
        taskStore.createIndex("columnId", "columnId");
        taskStore.createIndex("assignedTo", "assignedTo", { multiEntry: true });
        taskStore.createIndex("updatedAt", "updatedAt");
      }

      // Columns store
      if (!db.objectStoreNames.contains("columns")) {
        const columnStore = db.createObjectStore("columns", { keyPath: "id" });
        columnStore.createIndex("jobId", "jobId");
        columnStore.createIndex("order", "order");
      }

      // Comments store
      if (!db.objectStoreNames.contains("comments")) {
        const commentStore = db.createObjectStore("comments", { keyPath: "id" });
        commentStore.createIndex("taskId", "taskId");
        commentStore.createIndex("createdAt", "createdAt");
      }

      // Files store
      if (!db.objectStoreNames.contains("files")) {
        const fileStore = db.createObjectStore("files", { keyPath: "id" });
        fileStore.createIndex("taskId", "taskId");
        fileStore.createIndex("syncStatus", "syncStatus");
      }

      // Users store
      if (!db.objectStoreNames.contains("users")) {
        db.createObjectStore("users", { keyPath: "id" });
      }

      // Sync queue store
      if (!db.objectStoreNames.contains("syncQueue")) {
        const syncStore = db.createObjectStore("syncQueue", { keyPath: "id" });
        syncStore.createIndex("timestamp", "timestamp");
        syncStore.createIndex("status", "status");
        syncStore.createIndex("entity", "entity");
      }

      // Metadata store (for app state like last sync time)
      if (!db.objectStoreNames.contains("metadata")) {
        db.createObjectStore("metadata", { keyPath: "key" });
      }
    },
  });

  return dbInstance;
}

// ============================================
// Generic CRUD Operations
// ============================================
export async function getAll<T extends StoreName>(
  storeName: T
): Promise<FieldKanbanDB[T][]> {
  const db = await getDB();
  return db.getAll(storeName) as Promise<FieldKanbanDB[T][]>;
}

export async function getById<T extends StoreName>(
  storeName: T,
  id: string
): Promise<FieldKanbanDB[T] | undefined> {
  const db = await getDB();
  return db.get(storeName, id) as Promise<FieldKanbanDB[T] | undefined>;
}

export async function put<T extends StoreName>(
  storeName: T,
  item: FieldKanbanDB[T]
): Promise<void> {
  const db = await getDB();
  await db.put(storeName, item);
}

export async function deleteById<T extends StoreName>(
  storeName: T,
  id: string
): Promise<void> {
  const db = await getDB();
  return db.delete(storeName, id);
}

// ============================================
// Index-based Queries
// ============================================
export async function getByIndex<T extends StoreName>(
  storeName: T,
  indexName: string,
  value: IDBValidKey
): Promise<FieldKanbanDB[T][]> {
  const db = await getDB();
  return db.getAllFromIndex(storeName, indexName, value) as Promise<FieldKanbanDB[T][]>;
}

// ============================================
// Sync Queue Operations
// ============================================
export async function addToSyncQueue(operation: SyncOperation): Promise<void> {
  const db = await getDB();
  await db.put("syncQueue", operation);
}

export async function getPendingSyncOperations(): Promise<SyncOperation[]> {
  const db = await getDB();
  return db.getAllFromIndex("syncQueue", "status", "pending");
}

export async function removeSyncOperation(id: string): Promise<void> {
  const db = await getDB();
  await db.delete("syncQueue", id);
}

export async function updateSyncOperationStatus(
  id: string,
  status: SyncOperation["status"],
  errorMessage?: string
): Promise<void> {
  const db = await getDB();
  const operation = await db.get("syncQueue", id);
  if (operation) {
    operation.status = status;
    if (errorMessage) {
      operation.errorMessage = errorMessage;
    }
    await db.put("syncQueue", operation);
  }
}

// ============================================
// Metadata Operations
// ============================================
export async function getMetadata<T>(key: string): Promise<T | undefined> {
  const db = await getDB();
  const result = await db.get("metadata", key);
  return result?.value as T | undefined;
}

export async function setMetadata(key: string, value: unknown): Promise<void> {
  const db = await getDB();
  await db.put("metadata", { key, value });
}

// ============================================
// Clear Database (for logout/reset)
// ============================================
export async function clearAllData(): Promise<void> {
  const db = await getDB();
  const tx = db.transaction(
    ["jobs", "tasks", "columns", "comments", "files", "users", "syncQueue", "metadata"],
    "readwrite"
  );

  await Promise.all([
    tx.objectStore("jobs").clear(),
    tx.objectStore("tasks").clear(),
    tx.objectStore("columns").clear(),
    tx.objectStore("comments").clear(),
    tx.objectStore("files").clear(),
    tx.objectStore("users").clear(),
    tx.objectStore("syncQueue").clear(),
    tx.objectStore("metadata").clear(),
  ]);

  await tx.done;
}
