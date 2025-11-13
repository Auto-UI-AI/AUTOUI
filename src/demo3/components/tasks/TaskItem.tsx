import React, { useCallback } from 'react';
import {
  Button,
} from '../../../demo/base';
import { Calendar, MoreVertical, Pencil, Trash2, CheckCircle2, Circle, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../../demo/base/dropdown-menu';
import { Badge } from '../../../demo/base/badge';
import type { Task } from '../../types/tasks';
import { useTasksContext } from '../../hooks/useAppFunctions';

type Status = 'todo' | 'in_progress' | 'done';
type Priority = 'low' | 'medium' | 'high';
interface TaskItemProps {
  task: Task;
}

export default function TaskItem({ task }: TaskItemProps) {
  const {setTasks, setEditingTask, setShowForm} = useTasksContext()
  const onStatusChange = useCallback((task: Task, nextStatus: Status) => {
    setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, status: nextStatus } : t)));
  }, [setTasks]);
  const onDelete = useCallback((task: Task) => {
      if (window.confirm('Are you sure you want to delete this task?')) {
        setTasks((prev) => prev.filter((t) => t.id !== task.id));
      }
    }, [setTasks]);
  const onEdit = useCallback((task: Task) => {
      setEditingTask(task);
      setShowForm(true);
    }, []);
  
  const priorityConfig: Record<
    Priority,
    { bg: string; text: string; border: string; dot: string }
  > = {
    low: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', dot: 'bg-blue-500' },
    medium: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500' },
    high: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', dot: 'bg-rose-500' },
  };

  const statusConfig: Record<
    Status,
    { icon: React.ComponentType<{ className?: string }>; color: string; bg: string; label: string }
  > = {
    todo: { icon: Circle, color: 'text-slate-400', bg: 'bg-slate-50', label: 'To Do' },
    in_progress: { icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50', label: 'In Progress' },
    done: { icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50', label: 'Done' },
  };

  const config = priorityConfig[task.priority];
  const statusInfo = statusConfig[task.status];
  const StatusIcon = statusInfo.icon;

  const isOverdue =
    task.due_date && new Date(task.due_date) < new Date() && task.status !== 'done';

  const nextStatus: Record<Status, Status> = {
    todo: 'in_progress',
    in_progress: 'done',
    done: 'todo',
  };

  return (
    <div className="relative group">
      <div
        className={`absolute inset-0 ${config.bg} rounded-2xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-300`}
      />
      <div
        className={`relative bg-white border ${config.border} rounded-2xl p-5 hover:shadow-xl transition-all duration-300 ${
          task.status === 'done' ? 'opacity-75' : ''
        }`}
      >
        <div className="flex items-start gap-4">
          <button
            onClick={() => onStatusChange(task, nextStatus[task.status])}
            className={`flex-shrink-0 mt-1 p-2 rounded-xl ${statusInfo.bg} hover:scale-110 transition-transform`}
            aria-label="Toggle status"
            title="Toggle status"
          >
            <StatusIcon className={`w-5 h-5 ${statusInfo.color}`} />
          </button>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3 mb-2">
              <h3
                className={`text-lg font-semibold text-slate-800 ${
                  task.status === 'done' ? 'line-through text-slate-500' : ''
                }`}
              >
                {task.title}
              </h3>

              <DropdownMenu>
                <DropdownMenuTrigger className='bg-indigo-600 hover:bg-indigo-700' asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="flex-shrink-0 w-8 h-8 transition-opacity rounded-lg opacity-0 group-hover:opacity-100"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40 bg-indigo-600 hover:bg-indigo-700">
                  <DropdownMenuItem onClick={() => onEdit(task)} className='hover:bg-indigo-400'>
                    <Pencil className="w-4 h-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => onDelete(task)}
                    className=" hover:bg-indigo-400"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {task.description && (
              <p className="mb-3 text-sm text-slate-600 line-clamp-2">{task.description}</p>
            )}

            <div className="flex flex-wrap items-center gap-2">
              <Badge className={`${config.bg} ${config.text} border ${config.border} px-3 py-1`}>
                <span className={`w-2 h-2 rounded-full ${config.dot} mr-2`} />
                {task.priority} priority
              </Badge>

              {task.due_date && (
                <Badge
                  variant="outline"
                  className={`px-3 py-1 ${
                    isOverdue
                      ? 'border-rose-300 bg-rose-50 text-rose-700'
                      : 'border-slate-200 bg-slate-50 text-slate-700'
                  }`}
                >
                  <Calendar className="w-3 h-3 mr-1.5" />
                  {format(new Date(task.due_date), 'MMM d, yyyy')}
                  {isOverdue && ' (Overdue)'}
                </Badge>
              )}

              <Badge className={`${statusInfo.bg} ${statusInfo.color} border-transparent px-3 py-1`}>
                {statusInfo.label}
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
