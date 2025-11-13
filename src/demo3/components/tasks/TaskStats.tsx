import React from 'react';
import { CheckCircle2, Clock, TrendingUp, AlertCircle } from 'lucide-react';
import type { Task } from '../../types/tasks';

type Status = 'todo' | 'in_progress' | 'done';
type Priority = 'low' | 'medium' | 'high';


interface TaskStatsProps {
  tasks: Task[];
}

export default function TaskStats({ tasks }: TaskStatsProps) {
  const stats = {
    total: tasks.length,
    completed: tasks.filter((t) => t.status === 'done').length,
    inProgress: tasks.filter((t) => t.status === 'in_progress').length,
    todo: tasks.filter((t) => t.status === 'todo').length,
    highPriority: tasks.filter((t) => t.priority === 'high' && t.status !== 'done').length,
  };

  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  const statCards: Array<{
    label: string;
    value: number;
    icon: React.ComponentType<{ className?: string }>;
    gradient: string; // e.g. 'from-indigo-500 to-purple-600'
    bgGlow: string; // e.g. 'bg-indigo-500/10'
  }> = [
    {
      label: 'Total Tasks',
      value: stats.total,
      icon: TrendingUp,
      gradient: 'from-indigo-500 to-purple-600',
      bgGlow: 'bg-indigo-500/10',
    },
    {
      label: 'Completed',
      value: stats.completed,
      icon: CheckCircle2,
      gradient: 'from-emerald-500 to-teal-600',
      bgGlow: 'bg-emerald-500/10',
    },
    {
      label: 'In Progress',
      value: stats.inProgress,
      icon: Clock,
      gradient: 'from-amber-500 to-orange-600',
      bgGlow: 'bg-amber-500/10',
    },
    {
      label: 'High Priority',
      value: stats.highPriority,
      icon: AlertCircle,
      gradient: 'from-rose-500 to-pink-600',
      bgGlow: 'bg-rose-500/10',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 mb-8 sm:grid-cols-2 lg:grid-cols-4">
      {statCards.map((stat, index) => (
        <div key={stat.label} className="relative group">
          <div
            className={`absolute inset-0 ${stat.bgGlow} rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
          />
          <div className="relative p-6 transition-all duration-300 bg-white border border-slate-200 rounded-2xl hover:border-slate-300 hover:shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <p className="mb-1 text-sm font-medium text-slate-600">{stat.label}</p>
                <p className={`text-3xl font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}>
                  {stat.value}
                </p>
              </div>
              <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.gradient}`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
            </div>
            {stat.label === 'Completed' && stats.total > 0 && (
              <div className="pt-4 mt-4 border-t border-slate-100">
                <div className="flex items-center justify-between mb-2 text-xs text-slate-600">
                  <span>Completion Rate</span>
                  <span className="font-semibold">{completionRate}%</span>
                </div>
                <div className="w-full h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full bg-gradient-to-r ${stat.gradient} rounded-full transition-all duration-700`}
                    style={{ width: `${completionRate}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
