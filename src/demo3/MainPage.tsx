// Tasks.tsx
import React, { useEffect, useState, useCallback, type JSX } from 'react';
import { Plus, Sparkles } from 'lucide-react';
import { Button } from '../demo/base';

import TaskForm from './components/tasks/TaskForm';
import TaskFilters, { type TaskFiltersState } from './components/tasks/TaskFilters';
import TaskItem from './components/tasks/TaskItem';
import TaskStats from './components/tasks/TaskStats';
import type { Task, TaskDraft, Status } from './types/tasks';
import './tasks.css'
const STORAGE_KEY = 'task_management_tasks';

export default function Tasks(): JSX.Element {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [filters, setFilters] = useState<TaskFiltersState>({ status: 'all', priority: 'all' });

  // Load tasks
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return;
    try {
      const parsed = JSON.parse(stored) as Task[];
      if (Array.isArray(parsed)) setTasks(parsed);
    } catch (err) {
      console.error('Failed to parse tasks from localStorage:', err);
    }
  }, []);

  // Persist tasks
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  const handleCreateTask = useCallback((data: TaskDraft) => {
    const newTask: Task = {
      ...data,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
    };
    setTasks((prev) => [newTask, ...prev]);
  }, []);

  const handleUpdateTask = useCallback((data: TaskDraft, id: string) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...data } : t)));
  }, []);

  const handleDeleteTask = useCallback((task: Task) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      setTasks((prev) => prev.filter((t) => t.id !== task.id));
    }
  }, []);

  const handleStatusChange = useCallback((task: Task, nextStatus: Status) => {
    setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, status: nextStatus } : t)));
  }, []);

  const handleEdit = useCallback((task: Task) => {
    setEditingTask(task);
    setShowForm(true);
  }, []);

  // ✅ Proper onSubmit: create or update, then close and clear edit state
  const handleFormSubmit = useCallback(
    (draft: TaskDraft) => {
      if (editingTask) {
        handleUpdateTask(draft, editingTask.id);
      } else {
        handleCreateTask(draft);
      }
      setShowForm(false);
      setEditingTask(null);
    },
    [editingTask, handleCreateTask, handleUpdateTask]
  );

  // ✅ Proper onCancel: close modal and clear edit state
  const handleFormCancel = useCallback(() => {
    setShowForm(false);
    setEditingTask(null);
  }, []);

  const filteredTasks = tasks.filter((task) => {
    const statusMatch = filters.status === 'all' || task.status === filters.status;
    const priorityMatch = filters.priority === 'all' || task.priority === filters.priority;
    return statusMatch && priorityMatch;
    });

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-indigo-400/90 to-white">
      <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 transition-all">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 shadow-lg bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl shadow-indigo-500/30">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-4xl font-bold text-transparent bg-gradient-to-r from-slate-900 via-indigo-800 to-purple-800 bg-clip-text">
                  Task Manager
                </h1>
              </div>
              <p className="ml-16 text-slate-600">Organize your work with elegance</p>
            </div>
            <Button
              onClick={() => {
                setEditingTask(null);
                setShowForm(true);
              }}
              className="h-12 px-6 text-white transition-all shadow-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-xl shadow-indigo-500/30 hover:shadow-xl"
            >
              <Plus className="w-5 h-5 mr-2" />
              New Task
            </Button>
          </div>
        </div>

        {/* Stats */}
        <TaskStats tasks={tasks} />

        {/* Filters */}
        <TaskFilters filters={filters} onFilterChange={setFilters} />

        {/* Tasks List */}
        <div className="space-y-4">
          {filteredTasks.length > 0 ? (
            filteredTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onEdit={handleEdit}
                onDelete={handleDeleteTask}
                onStatusChange={handleStatusChange}
              />
            ))
          ) : (
            <div className="py-16 text-center">
              <div className="inline-block p-6 mb-4 rounded-full bg-slate-100">
                <Sparkles className="w-12 h-12 text-slate-400" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-slate-700">No tasks found</h3>
              <p className="text-slate-500">
                {filters.status === 'all' && filters.priority === 'all'
                  ? 'Create your first task to get started'
                  : 'Try adjusting your filters'}
              </p>
            </div>
          )}
        </div>

        {/* Form Modal */}
        {showForm && (
          <TaskForm
            task={editingTask ?? undefined}
            onSubmit={handleFormSubmit}   // <- proper handler
            onCancel={handleFormCancel}   // <- proper handler
          />
        )}
      </div>
    </div>
  );
}
