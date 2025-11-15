import React from 'react';

type Status = 'all' | 'todo' | 'in_progress' | 'done';
type Priority = 'all' | 'low' | 'medium' | 'high';

export interface TaskFiltersState {
  status: Status;
  priority: Priority;
}

interface TaskFiltersProps {
  filters: TaskFiltersState;
  onFilterChange: (next: TaskFiltersState) => void;
}

export default function TaskFilters({ filters, onFilterChange }: TaskFiltersProps) {
  const statusOptions: Array<{ value: Status; label: string; emoji: string }> = [
    { value: 'all', label: 'All Tasks', emoji: '📁' },
    { value: 'todo', label: 'To Do', emoji: '📋' },
    { value: 'in_progress', label: 'In Progress', emoji: '🚀' },
    { value: 'done', label: 'Done', emoji: '✅' },
  ];

  const priorityOptions: Array<{ value: Priority; label: string; classSet: { active: string; inactive: string } }> = [
    {
      value: 'all',
      label: 'All',
      classSet: {
        active: 'bg-slate-500 text-white shadow-lg',
        inactive: 'bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100',
      },
    },
    {
      value: 'low',
      label: 'Low',
      classSet: {
        active: 'bg-blue-500 text-white shadow-lg',
        inactive: 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100',
      },
    },
    {
      value: 'medium',
      label: 'Medium',
      classSet: {
        active: 'bg-amber-500 text-white shadow-lg',
        inactive: 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100',
      },
    },
    {
      value: 'high',
      label: 'High',
      classSet: {
        active: 'bg-rose-500 text-white shadow-lg',
        inactive: 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100',
      },
    },
  ];

  return (
    <div className="mb-8 space-y-4" data-guide-id="TaskFilters">
      <div className="flex flex-wrap gap-2">
        {statusOptions.map((option) => {
          const active = filters.status === option.value;
          return (
            <button
              key={option.value}
              onClick={() => onFilterChange({ ...filters, status: option.value })}
              className={`px-4 py-2 rounded-xl font-medium transition-all ${
                active
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30'
                  : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-300 hover:shadow-md'
              }`}
            >
              <span className="mr-2">{option.emoji}</span>
              {option.label}
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-slate-600">Priority:</span>
        <div className="flex flex-wrap gap-2">
          {priorityOptions.map((option) => {
            const active = filters.priority === option.value;
            return (
              <button
                key={option.value}
                onClick={() => onFilterChange({ ...filters, priority: option.value })}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  active ? option.classSet.active : option.classSet.inactive
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
