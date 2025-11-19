// src/demo3/types/tasks.ts
export type Status = 'todo' | 'in_progress' | 'done';
export type Priority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: Status;
  priority: Priority;
  due_date?: string;   // yyyy-MM-dd
  created_at: string;  // ISO
}

// For forms / creating or editing a task (no id/created_at yet)
export type TaskDraft = Omit<Task, 'id' | 'created_at'>;
