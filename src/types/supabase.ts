export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      columns: {
        Row: {
          color: string | null
          created_at: string
          id: string
          job_id: string
          name: string
          order: number
        }
        Insert: {
          color?: string | null
          created_at?: string
          id?: string
          job_id: string
          name: string
          order?: number
        }
        Update: {
          color?: string | null
          created_at?: string
          id?: string
          job_id?: string
          name?: string
          order?: number
        }
        Relationships: [
          {
            foreignKeyName: "columns_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          content: string
          created_at: string
          id: string
          task_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          task_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          task_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      file_attachments: {
        Row: {
          id: string
          mime_type: string
          name: string
          size: number
          storage_path: string
          sync_status: Database["public"]["Enums"]["sync_status"]
          task_id: string
          type: Database["public"]["Enums"]["file_type"]
          uploaded_at: string
          uploaded_by: string
        }
        Insert: {
          id?: string
          mime_type: string
          name: string
          size: number
          storage_path: string
          sync_status?: Database["public"]["Enums"]["sync_status"]
          task_id: string
          type: Database["public"]["Enums"]["file_type"]
          uploaded_at?: string
          uploaded_by: string
        }
        Update: {
          id?: string
          mime_type?: string
          name?: string
          size?: number
          storage_path?: string
          sync_status?: Database["public"]["Enums"]["sync_status"]
          task_id?: string
          type?: Database["public"]["Enums"]["file_type"]
          uploaded_at?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "file_attachments_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "file_attachments_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      job_assignments: {
        Row: {
          assigned_at: string
          assigned_by: string
          id: string
          job_id: string
          user_id: string
        }
        Insert: {
          assigned_at?: string
          assigned_by: string
          id?: string
          job_id: string
          user_id: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string
          id?: string
          job_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_assignments_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_assignments_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_assignments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          address: string | null
          client_name: string | null
          created_at: string
          created_by: string
          description: string | null
          id: string
          status: Database["public"]["Enums"]["job_status"]
          title: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          client_name?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          status?: Database["public"]["Enums"]["job_status"]
          title: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          client_name?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          status?: Database["public"]["Enums"]["job_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "jobs_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          id: string
          name: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          id: string
          name: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          id?: string
          name?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string
          endpoint: string
          id: string
          p256dh: string
          user_id: string
        }
        Insert: {
          auth: string
          created_at?: string
          endpoint: string
          id?: string
          p256dh: string
          user_id: string
        }
        Update: {
          auth?: string
          created_at?: string
          endpoint?: string
          id?: string
          p256dh?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "push_subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      task_assignments: {
        Row: {
          assigned_at: string
          id: string
          task_id: string
          user_id: string
        }
        Insert: {
          assigned_at?: string
          id?: string
          task_id: string
          user_id: string
        }
        Update: {
          assigned_at?: string
          id?: string
          task_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_assignments_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_assignments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          column_id: string
          created_at: string
          created_by: string
          description: string | null
          due_date: string | null
          duration: number | null
          id: string
          job_id: string
          location: string | null
          order: number
          priority: Database["public"]["Enums"]["task_priority"] | null
          spec_reference: string | null
          title: string
          updated_at: string
          version: number
        }
        Insert: {
          column_id: string
          created_at?: string
          created_by: string
          description?: string | null
          due_date?: string | null
          duration?: number | null
          id?: string
          job_id: string
          location?: string | null
          order?: number
          priority?: Database["public"]["Enums"]["task_priority"] | null
          spec_reference?: string | null
          title: string
          updated_at?: string
          version?: number
        }
        Update: {
          column_id?: string
          created_at?: string
          created_by?: string
          description?: string | null
          due_date?: string | null
          duration?: number | null
          id?: string
          job_id?: string
          location?: string | null
          order?: number
          priority?: Database["public"]["Enums"]["task_priority"] | null
          spec_reference?: string | null
          title?: string
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "tasks_column_id_fkey"
            columns: ["column_id"]
            isOneToOne: false
            referencedRelation: "columns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_access_task: { Args: { task_uuid: string }; Returns: boolean }
      is_admin: { Args: Record<PropertyKey, never>; Returns: boolean }
      is_assigned_to_job: { Args: { job_uuid: string }; Returns: boolean }
      is_assigned_to_task: { Args: { task_uuid: string }; Returns: boolean }
    }
    Enums: {
      file_type: "image" | "document"
      job_status: "active" | "completed" | "archived"
      sync_status: "synced" | "pending" | "error"
      task_priority: "low" | "medium" | "high" | "urgent"
      user_role: "admin" | "field"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Helper types for easier usage
export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"]
export type Enums<T extends keyof Database["public"]["Enums"]> =
  Database["public"]["Enums"][T]
