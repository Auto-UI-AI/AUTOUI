import React, { useCallback, useState } from 'react';
import { Button } from '../../../demo/base';
import {
  Calendar,
  MoreVertical,
  Pencil,
  Trash2,
  CheckCircle2,
  Circle,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import { format } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../../demo/base/dropdown-menu';
import { Badge } from '../../../demo/base/badge';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '../../../demo/base/alert-dialog';
import type { Task } from '../../types/tasks';
import { useTasksContext } from '../../hooks/useAppFunctions';

type Status = 'todo' | 'in_progress' | 'done';
type Priority = 'low' | 'medium' | 'high';

interface TaskItemProps {
  task: Task; // can be from context OR from external source (e.g. chat history)
}

export default function TaskItem({ task }: TaskItemProps) {
  const { tasks, setTasks, setEditingTask, setShowForm } = useTasksContext();
  const [showConfirm, setShowConfirm] = useState(false);

  // 👇 Always try to use the "live" version from context
  const taskFromContext = tasks.find(t => t.id === task.id);
  const currentTask = taskFromContext ?? task;
  const isDeleted = !taskFromContext;

  const onStatusChange = useCallback(
    (taskId: string, nextStatus: Status) => {
      setTasks(prev =>
        prev.map(t => (t.id === taskId ? { ...t, status: nextStatus } : t)),
      );
    },
    [setTasks],
  );

  const actuallyDelete = useCallback(() => {
    setTasks(prev => prev.filter(t => t.id !== currentTask.id));
    setShowConfirm(false);
  }, [setTasks, currentTask.id]);

  const onDeleteClick = useCallback(() => {
    // если задача уже удалена – просто закрываем диалог
    if (isDeleted) {
      setShowConfirm(false);
      return;
    }
    setShowConfirm(true);
  }, [isDeleted]);

  const onEdit = useCallback(() => {
    if (isDeleted) return; // редактировать нечего
    setEditingTask(currentTask);
    setShowForm(true);
  }, [currentTask, isDeleted, setEditingTask, setShowForm]);

  const priorityConfig: Record<
    Priority,
    { bg: string; text: string; border: string; dot: string }
  > = {
    low: {
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      border: 'border-blue-200',
      dot: 'bg-blue-500',
    },
    medium: {
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      border: 'border-amber-200',
      dot: 'bg-amber-500',
    },
    high: {
      bg: 'bg-rose-50',
      text: 'text-rose-700',
      border: 'border-rose-200',
      dot: 'bg-rose-500',
    },
  };

  const statusConfig: Record<
    Status,
    {
      icon: React.ComponentType<{ className?: string }>;
      color: string;
      bg: string;
      label: string;
    }
  > = {
    todo: {
      icon: Circle,
      color: 'text-slate-400',
      bg: 'bg-slate-50',
      label: 'To Do',
    },
    in_progress: {
      icon: Clock,
      color: 'text-amber-500',
      bg: 'bg-amber-50',
      label: 'In Progress',
    },
    done: {
      icon: CheckCircle2,
      color: 'text-emerald-500',
      bg: 'bg-emerald-50',
      label: 'Done',
    },
  };

  // Если задача уже удалена из контекста — показываем отдельную "deleted" карточку
  if (isDeleted) {
    return (
      <div className="relative group">
        <div className="absolute inset-0 transition-opacity duration-300 opacity-0 bg-slate-200 rounded-2xl blur-xl group-hover:opacity-40" />
        <div className="relative flex flex-col gap-2 p-5 border shadow-sm bg-slate-50 border-slate-200 rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center h-9 w-9 rounded-xl bg-rose-50">
              <AlertTriangle className="w-5 h-5 text-rose-500" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-slate-800">
                Task deleted
              </span>
              <span className="text-xs text-slate-500">
                This task (<span className="font-medium">{currentTask.title}</span>) no longer
                exists in your task list.
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ---------- обычный рендер, но уже на основе currentTask ----------
  const config = priorityConfig[currentTask.priority];
  const statusInfo = statusConfig[currentTask.status];
  const StatusIcon = statusInfo.icon;

  const isOverdue =
    currentTask.due_date &&
    new Date(currentTask.due_date) < new Date() &&
    currentTask.status !== 'done';

  const nextStatus: Record<Status, Status> = {
    todo: 'in_progress',
    in_progress: 'done',
    done: 'todo',
  };

  return (
    <>
      <div className="relative group">
        <div
          className={`absolute inset-0 ${config.bg} rounded-2xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-300`}
        />
        <div
          className={`relative bg-white border ${config.border} rounded-2xl p-5 hover:shadow-xl transition-all duration-300 ${
            currentTask.status === 'done' ? 'opacity-75' : ''
          }`}
        >
          <div className="flex items-start gap-4">
            <button
              onClick={() => onStatusChange(currentTask.id, nextStatus[currentTask.status])}
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
                    currentTask.status === 'done' ? 'line-through text-slate-500' : ''
                  }`}
                >
                  {currentTask.title}
                </h3>

                <DropdownMenu>
                  <DropdownMenuTrigger
                    className="bg-indigo-600 hover:bg-indigo-700"
                    asChild
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      className="flex-shrink-0 w-8 h-8 transition-opacity rounded-lg opacity-0 group-hover:opacity-100"
                    >
                      <MoreVertical className="w-4 h-4 text-white" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-40 bg-indigo-600 hover:bg-indigo-700 z-[10000] rounded-xl"
                  >
                    <DropdownMenuItem
                      onClick={onEdit}
                      className="text-white cursor-pointer hover:bg-indigo-400"
                    >
                      <Pencil className="w-4 h-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={onDeleteClick}
                      className="text-white cursor-pointer hover:bg-indigo-400"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {currentTask.description && (
                <p className="mb-3 text-sm text-slate-600 line-clamp-2">
                  {currentTask.description}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  className={`${config.bg} ${config.text} border ${config.border} px-3 py-1`}
                >
                  <span className={`w-2 h-2 rounded-full ${config.dot} mr-2`} />
                  {currentTask.priority} priority
                </Badge>

                {currentTask.due_date && (
                  <Badge
                    variant="outline"
                    className={`px-3 py-1 ${
                      isOverdue
                        ? 'border-rose-300 bg-rose-50 text-rose-700'
                        : 'border-slate-200 bg-slate-50 text-slate-700'
                    }`}
                  >
                    <Calendar className="w-3 h-3 mr-1.5" />
                    {format(new Date(currentTask.due_date), 'MMM d, yyyy')}
                    {isOverdue && ' (Overdue)'}
                  </Badge>
                )}

                <Badge
                  className={`${statusInfo.bg} ${statusInfo.color} border-transparent px-3 py-1`}
                >
                  {statusInfo.label}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation dialog */}
      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent className="max-w-md bg-white border shadow-2xl rounded-2xl border-slate-200">
          <AlertDialogHeader className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-rose-50">
                <AlertTriangle className="w-5 h-5 text-rose-500" />
              </div>
              <AlertDialogTitle className="text-lg font-semibold text-slate-900">
                Delete this task?
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-sm text-slate-600">
              You are about to permanently delete{' '}
              <span className="font-medium text-slate-800">"{currentTask.title}"</span>. This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter className="flex justify-end gap-2 mt-4">
            <AlertDialogCancel className="tm-btn-outline">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={actuallyDelete}
              className="px-4 py-2 font-medium text-white rounded-lg shadow-sm bg-rose-600 hover:bg-rose-700"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
