import { create } from "zustand";
import type { User, Job, Task, Column } from "@/types";

// ============================================
// App Store State
// ============================================
interface AppState {
  // User
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;

  // Current job context
  currentJobId: string | null;
  setCurrentJobId: (jobId: string | null) => void;

  // Jobs cache
  jobs: Job[];
  setJobs: (jobs: Job[]) => void;
  updateJob: (job: Job) => void;

  // Tasks cache (for current job)
  tasks: Task[];
  setTasks: (tasks: Task[]) => void;
  updateTask: (task: Task) => void;
  addTask: (task: Task) => void;
  removeTask: (taskId: string) => void;

  // Columns cache (for current job)
  columns: Column[];
  setColumns: (columns: Column[]) => void;
  updateColumn: (column: Column) => void;

  // UI State
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;

  selectedTaskId: string | null;
  setSelectedTaskId: (taskId: string | null) => void;

  // Reset all state (for logout)
  reset: () => void;
}

const initialState = {
  currentUser: null,
  currentJobId: null,
  jobs: [],
  tasks: [],
  columns: [],
  isLoading: false,
  selectedTaskId: null,
};

// ============================================
// Zustand Store
// ============================================
export const useAppStore = create<AppState>((set) => ({
  ...initialState,

  // User
  setCurrentUser: (user) => set({ currentUser: user }),

  // Current job
  setCurrentJobId: (jobId) => set({ currentJobId: jobId }),

  // Jobs
  setJobs: (jobs) => set({ jobs }),
  updateJob: (job) =>
    set((state) => ({
      jobs: state.jobs.map((j) => (j.id === job.id ? job : j)),
    })),

  // Tasks
  setTasks: (tasks) => set({ tasks }),
  updateTask: (task) =>
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === task.id ? task : t)),
    })),
  addTask: (task) =>
    set((state) => ({
      tasks: [...state.tasks, task],
    })),
  removeTask: (taskId) =>
    set((state) => ({
      tasks: state.tasks.filter((t) => t.id !== taskId),
    })),

  // Columns
  setColumns: (columns) => set({ columns }),
  updateColumn: (column) =>
    set((state) => ({
      columns: state.columns.map((c) => (c.id === column.id ? column : c)),
    })),

  // UI State
  setIsLoading: (isLoading) => set({ isLoading }),
  setSelectedTaskId: (selectedTaskId) => set({ selectedTaskId }),

  // Reset
  reset: () => set(initialState),
}));
