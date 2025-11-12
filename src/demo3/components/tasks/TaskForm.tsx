import React, { useState } from 'react';
import { Calendar as CalendarIcon, X, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import { Button, Input } from 'src/demo/base';
import { Textarea } from 'src/demo/base/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from 'src/demo/base/select';

type Status = 'todo' | 'in_progress' | 'done';
type Priority = 'low' | 'medium' | 'high';

export interface Task {
  id?: string;
  title: string;
  description?: string;
  status: Status;
  priority: Priority;
  due_date?: string; // yyyy-MM-dd
}

interface TaskFormProps {
  task?: Task;
  onSubmit: (task: Task) => void;
  onCancel: () => void;
}

export default function TaskForm({ task, onSubmit, onCancel }: TaskFormProps) {
  const [formData, setFormData] = useState<Task>(
    task || { title: '', description: '', status: 'todo', priority: 'medium', due_date: '' }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
    onSubmit(formData);
  };

  const priorityGradients: Record<Priority, string> = {
    low: 'from-blue-500 to-cyan-500',
    medium: 'from-amber-500 to-orange-500',
    high: 'from-rose-500 to-pink-500',
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
      onClick={onCancel}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 p-6 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-t-3xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white">{task ? 'Edit Task' : 'Create New Task'}</h2>
            </div>
            <Button variant="ghost" size="icon" onClick={onCancel} className="text-white hover:bg-white/20 rounded-xl">
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">
              Task Title <span className="text-rose-500">*</span>
            </label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="What needs to be done?"
              className="h-12 text-lg border-slate-200 focus:border-indigo-500 rounded-xl"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Description</label>
            <Textarea
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Add more details..."
              className="min-h-[120px] border-slate-200 focus:border-indigo-500 rounded-xl resize-none"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Status</label>
              <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v as Status })}>
                <SelectTrigger className="rounded-xl border-slate-200 h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">📋 To Do</SelectItem>
                  <SelectItem value="in_progress">🚀 In Progress</SelectItem>
                  <SelectItem value="done">✅ Done</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Priority</label>
              <Select
                value={formData.priority}
                onValueChange={(v) => setFormData({ ...formData, priority: v as Priority })}
              >
                <SelectTrigger className="rounded-xl border-slate-200 h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">🟢 Low</SelectItem>
                  <SelectItem value="medium">🟡 Medium</SelectItem>
                  <SelectItem value="high">🔴 High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Due Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="justify-start w-full font-normal text-left rounded-xl border-slate-200 h-11">
                    <CalendarIcon className="w-4 h-4 mr-2 text-slate-500" />
                    {formData.due_date ? (
                      <span>{format(new Date(formData.due_date), 'MMM d, yyyy')}</span>
                    ) : (
                      <span className="text-slate-500">Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.due_date ? new Date(formData.due_date) : undefined}
                    onSelect={(date?: Date) =>
                      setFormData({ ...formData, due_date: date ? format(date, 'yyyy-MM-dd') : '' })
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="flex-1 h-12 rounded-xl border-slate-300 hover:bg-slate-50"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className={`flex-1 h-12 rounded-xl bg-gradient-to-r ${priorityGradients[formData.priority]} text-white font-semibold hover:shadow-lg transition-all`}
            >
              {task ? 'Update Task' : 'Create Task'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
