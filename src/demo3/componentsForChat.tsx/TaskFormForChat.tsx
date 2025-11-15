// TaskFormForChat.tsx
import React, { useCallback, useState } from 'react';
import { createPortal } from 'react-dom';
import { Calendar as CalendarIcon, X, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import { Button, Input } from '../../demo/base';
import { Textarea } from '../../demo/base/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../demo/base/select';
import { Popover, PopoverContent, PopoverTrigger } from '../../demo/base/popover';
import { Calendar } from '../../demo/base/calendar';
import type { Task, TaskDraft } from '../types/tasks';
import { useTasksContext } from '../hooks/useAppFunctions';

type Status = 'todo' | 'in_progress' | 'done';
type Priority = 'low' | 'medium' | 'high';

interface TaskFormForChatProps {
  task?: Partial<Task>;
}

export default function TaskFormForChat({ task }: TaskFormForChatProps) {
  const {
    setShowForm,
    setEditingTask,
    editingTask,
    handleUpdateTask,
    handleCreateTask,
  } = useTasksContext();

  const [formData, setFormData] = useState<TaskDraft>({
    title: task?.title ?? '',
    description: task?.description ?? '',
    status: (task?.status as Status) ?? 'todo',
    priority: (task?.priority as Priority) ?? 'medium',
    due_date: task?.due_date ?? '',
  });

  const onCancel = useCallback(() => {
    setShowForm(false);
    setEditingTask(null);
  }, [setShowForm, setEditingTask]);

  const onSubmit = useCallback(
    (draft: TaskDraft) => {
      if (editingTask) {
        handleUpdateTask(draft, editingTask.id);
      } else {
        handleCreateTask(draft);
      }
      setShowForm(false);
      setEditingTask(null);
    },
    [editingTask, handleCreateTask, handleUpdateTask, setShowForm, setEditingTask]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
    onSubmit(formData);
  };

  const content = (
    <div
      className="tm-overlay fixed inset-0 z-[1200] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm"
      onClick={onCancel}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative w-full max-w-xl bg-white border shadow-2xl tm-modal rounded-2xl border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b tm-modal-header border-slate-100">
          <div className="flex items-center justify-between gap-3 tm-header-row">
            <div className="flex items-center gap-3 tm-header-left">
              <div className="flex items-center justify-center shadow-md tm-header-icon h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-lg font-semibold tm-header-title text-slate-900">
                {task ? 'Edit Task' : 'Create New Task'}
              </h2>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onCancel}
              className="w-8 h-8 rounded-full tm-header-close hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title */}
          <div className="space-y-1 tm-field">
            <label className="text-sm font-medium tm-label text-slate-700">
              Task Title <span className="text-red-500 tm-label-asterisk">*</span>
            </label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="What needs to be done?"
              className="tm-input"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-1 tm-field">
            <label className="text-sm font-medium tm-label text-slate-700">Description</label>
            <Textarea
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Add more details..."
              className="tm-textarea min-h-[90px]"
            />
          </div>

          {/* Status / Priority / Due Date */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {/* Status */}
            <div className="space-y-1 tm-field">
              <label className="text-sm font-medium tm-label text-slate-700">Status</label>
              <Select
                value={formData.status}
                onValueChange={(v) => setFormData({ ...formData, status: v as Status })}
              >
                <SelectTrigger className="tm-select-trigger">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent className="tm-select-content">
                  <SelectItem value="todo" className="tm-select-item">
                    📋 To Do
                  </SelectItem>
                  <SelectItem value="in_progress" className="tm-select-item">
                    🚀 In Progress
                  </SelectItem>
                  <SelectItem value="done" className="tm-select-item">
                    ✅ Done
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Priority */}
            <div className="space-y-1 tm-field">
              <label className="text-sm font-medium tm-label text-slate-700">Priority</label>
              <Select
                value={formData.priority}
                onValueChange={(v) => setFormData({ ...formData, priority: v as Priority })}
              >
                <SelectTrigger className="tm-select-trigger">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent className="tm-select-content">
                  <SelectItem value="low" className="tm-select-item">
                    🟢 Low
                  </SelectItem>
                  <SelectItem value="medium" className="tm-select-item">
                    🟡 Medium
                  </SelectItem>
                  <SelectItem value="high" className="tm-select-item">
                    🔴 High
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Due Date */}
            <div className="space-y-1 tm-field">
              <label className="text-sm font-medium tm-label text-slate-700">Due Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="justify-start w-full tm-calendar-trigger">
                    <CalendarIcon className="w-4 h-4 mr-2 tm-calendar-icon" />
                    {formData.due_date ? (
                      <span>{format(new Date(formData.due_date), 'MMM d, yyyy')}</span>
                    ) : (
                      <span className="tm-calendar-placeholder text-slate-400">
                        Pick a date
                      </span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="relative w-[300px] py-2 bg-white shadow-lg border border-slate-200 rounded-xl"
                  align="start"
                >
                  <Calendar
                    mode="single"
                    className="w-full p-3"
                    selected={formData.due_date ? new Date(formData.due_date) : undefined}
                    onSelect={(date?: Date) =>
                      setFormData({
                        ...formData,
                        due_date: date ? format(date, 'yyyy-MM-dd') : '',
                      })
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="tm-btn-outline"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className={[
                'tm-btn-primary',
                formData.priority === 'low' ? 'tm-btn-low' : '',
                formData.priority === 'medium' ? 'tm-btn-medium' : '',
                formData.priority === 'high' ? 'tm-btn-high' : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {task ? 'Update Task' : 'Create Task'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );

  if (typeof document === 'undefined') return null;
  return createPortal(content, document.body);
}
