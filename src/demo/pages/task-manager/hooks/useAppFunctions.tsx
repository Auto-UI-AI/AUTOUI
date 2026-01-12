import React, { createContext, useCallback, useContext, useState } from 'react';
import type { Task, TaskDraft } from '../types/tasks';
const STORAGE_KEY = 'task_management_tasks';

interface TasksContextType {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  addTask: (task: Task) => void;
  editingTask: Task | null;
  setEditingTask: React.Dispatch<React.SetStateAction<Task | null>>;
  showForm: boolean;
  setShowForm: React.Dispatch<React.SetStateAction<boolean>>;
  handleCreateTask: (data: TaskDraft) => void;
  handleUpdateTask: (data: TaskDraft, id: string) => void;
}

const TasksContext = createContext<TasksContextType | undefined>(undefined);

export const TasksProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return [];
      const parsed = JSON.parse(stored) as Task[];
      if (!Array.isArray(parsed)) return [];
      return parsed.filter((t): t is Task => t != null && typeof t === 'object' && typeof t.id === 'string');
    } catch {
      return [];
    }
  });
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showForm, setShowForm] = useState(false);
  const addTask = (task: Task) => setTasks((prev) => [...prev, task]);
  const handleCreateTask = useCallback(
    (data: TaskDraft) => {
      const newTask: Task = {
        ...data,
        id: Date.now().toString(),
        created_at: new Date().toISOString(),
      };
      setTasks((prev) => [newTask, ...prev]);
    },
    [setTasks],
  );

  const handleUpdateTask = useCallback(
    (data: TaskDraft, id: string) => {
      setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...data } : t)));
    },
    [setTasks],
  );

  return (
    <TasksContext.Provider
      value={{
        tasks,
        setTasks,
        addTask,
        editingTask,
        setEditingTask,
        showForm,
        setShowForm,
        handleCreateTask,
        handleUpdateTask,
      }}
    >
      {children}
    </TasksContext.Provider>
  );
};

export const useTasksContext = () => {
  const ctx = useContext(TasksContext);
  if (!ctx) throw new Error('useTasksContext must be used within TasksProvider');
  return ctx;
};
