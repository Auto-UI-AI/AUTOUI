import { useCallback } from 'react';
import { useTasksContext } from './useAppFunctions';
import type { Task, TaskDraft } from '../types/tasks';

export function useTaskFunctions() {
  const { tasks, setShowForm, setTasks } = useTasksContext();

  const createTask = useCallback(({ draft }: { draft: TaskDraft }): Task => {
    const newTask: Task = {
      ...draft,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
    };
    setTasks(prev => [newTask, ...prev]);
    return newTask;
  }, [setTasks]);

  const updateTask = useCallback(({ task, patch }: { task: Task; patch: TaskDraft }): Task => {
    const updatedTask: Task = {
      ...task,
      ...patch,
    };
    setTasks(prev => prev.filter(Boolean).map(t => t.id === task.id ? updatedTask : t));
    return updatedTask;
  }, [setTasks]);

  const summarizeTasks = useCallback(({ tasks: tasksParam }: { tasks: Task[] }): {
    total: number;
    byStatus: Record<string, number>;
    byPriority: Record<string, number>;
  } => {
    const total = tasksParam.length;
    const byStatus: Record<string, number> = {};
    const byPriority: Record<string, number> = {};

    for (const t of tasksParam) {
      byStatus[t.status] = (byStatus[t.status] ?? 0) + 1;
      byPriority[t.priority] = (byPriority[t.priority] ?? 0) + 1;
    }

    return { total, byStatus, byPriority };
  }, []);

  const deleteTask = useCallback(({ taskId }: { taskId: string }): {
    success: boolean;
    deletedId: string;
  } => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
    return { success: true, deletedId: taskId };
  }, [setTasks]);

  const fetchCurrentTasksState = useCallback((): Task[] => {
    return tasks;
  }, [tasks]);

  const openTaskForm = useCallback((): void => {
    setShowForm(true);
  }, [setShowForm]);

  const showHowManyTasks = useCallback((): number => {
    return tasks.length;
  }, [tasks]);

  const createTaskFromDraft = useCallback((draft: TaskDraft): Task => {
    const newTask: Task = {
      ...draft,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
    };
    setTasks(prev => [newTask, ...prev]);
    return newTask;
  }, [setTasks]);

  const updateTaskWithDraft = useCallback((task: Task, patch: TaskDraft): Task => {
    const updatedTask: Task = {
      ...task,
      ...patch,
    };
    setTasks(prev => prev.filter(Boolean).map(t => t.id === task.id ? updatedTask : t));
    return updatedTask;
  }, [setTasks]);

  const clearCompletedTasks = useCallback((): {
    success: boolean;
    clearedCount: number;
  } => {
    const completedTasks = tasks.filter(t => t.status === 'done');
    setTasks(prev => prev.filter(t => t.status !== 'done'));
    return { success: true, clearedCount: completedTasks.length };
  }, [tasks, setTasks]);

  return {
    createTask,
    updateTask,
    summarizeTasks,
    deleteTask,
    fetchCurrentTasksState,
    openTaskForm,
    showHowManyTasks,
    createTaskFromDraft,
    updateTaskWithDraft,
    clearCompletedTasks,
  };
}

