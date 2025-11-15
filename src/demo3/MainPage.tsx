// Tasks.tsx
import React, { useEffect, useState, useCallback, type JSX, useRef } from 'react';
import { Plus, Sparkles } from 'lucide-react';
import { Button } from '../demo/base';

import TaskForm from './components/tasks/TaskForm';
import TaskFilters, { type TaskFiltersState } from './components/tasks/TaskFilters';
import TaskItem from './components/tasks/TaskItem';
import TaskStats from './components/tasks/TaskStats';
import type { Task } from './types/tasks';
import './tasks.css'
import { useTasksContext } from './hooks/useAppFunctions';
const STORAGE_KEY = 'task_management_tasks';

export default function Tasks(): JSX.Element {
  const {tasks, setTasks, editingTask, setEditingTask, showForm, setShowForm} = useTasksContext();
  
  const [filters, setFilters] = useState<TaskFiltersState>({ status: 'all', priority: 'all' });
  // useComponentsLocationBy()
  // Load tasks
 const hydratedRef = useRef(false);

  // 1) Гидрация из localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      hydratedRef.current = true;
      return;
    }

    try {
      const parsed = JSON.parse(stored) as Task[];
      if (Array.isArray(parsed)) {
        setTasks(parsed);
      }
    } catch (err) {
      console.error('Failed to parse tasks from localStorage:', err);
    } finally {
      hydratedRef.current = true;
    }
  }, [setTasks]);

  // 2) Сохранение задач в localStorage, но только ПОСЛЕ гидрации
  useEffect(() => {
    if (!hydratedRef.current) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);
  
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
              data-guide-id="TaskFormButton"
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
          />
        )}
      </div>
    </div>
  );
}
