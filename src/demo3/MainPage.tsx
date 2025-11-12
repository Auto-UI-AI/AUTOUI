// Tasks.tsx
import React, { useEffect, useState } from 'react';
import { Plus, Sparkles } from 'lucide-react';
import { Button } from 'src/demo/base';

import TaskForm from './components/tasks/TaskForm';
import TaskFilters, { type TaskFiltersState } from './components/tasks/TaskFilters';
import TaskItem from './components/tasks/TaskItem';
import TaskStats from './components/tasks/TaskStats';

const STORAGE_KEY = 'task_management_tasks';

type Status = 'todo' | 'in_progress' | 'done';
type Priority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: Status;
  priority: Priority;
  due_date?: string;     // yyyy-MM-dd
  created_at: string;    // ISO
}

export default function Tasks(): JSX.Element {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [filters, setFilters] = useState<TaskFiltersState>({ status: 'all', priority: 'all' });

  // Load tasks from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as Task[];
        if (Array.isArray(parsed)) setTasks(parsed);
      } catch (err) {
        console.error('Failed to parse tasks from localStorage:', err);
      }
    }
  }, []);

  // Save tasks to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  const handleCreateTask = (taskData: Omit<Task, 'id' | 'created_at'>) => {
    const newTask: Task = {
      ...taskData,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
    };
    setTasks((prev) => [newTask, ...prev]);
    setShowForm(false);
  };

  const handleUpdateTask = (taskData: Omit<Task, 'id' | 'created_at'>) => {
    if (!editingTask) return;
    setTasks((prev) =>
      prev.map((t) =>
        t.id === editingTask.id ? { ...t, ...taskData, id: t.id, created_at: t.created_at } : t
      )
    );
    setShowForm(false);
    setEditingTask(null);
  };

  const handleDeleteTask = (task: Task) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      setTasks((prev) => prev.filter((t) => t.id !== task.id));
    }
  };

  const handleStatusChange = (task: Task, newStatus: Status) => {
    setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, status: newStatus } : t)));
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setShowForm(true);
  };

  const filteredTasks = tasks.filter((task) => {
    const statusMatch = filters.status === 'all' || task.status === filters.status;
    const priorityMatch = filters.priority === 'all' || task.priority === filters.priority;
    return statusMatch && priorityMatch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
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
            onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
            onCancel={() => {
              setShowForm(false);
              setEditingTask(null);
            }}
          />
        )}
      </div>
    </div>
  );
}
