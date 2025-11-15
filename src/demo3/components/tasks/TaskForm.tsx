import React, { useCallback, useState } from 'react';
import { Calendar as CalendarIcon, X, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import { Button, Input } from '../../../demo/base';
import { Textarea } from '../../../demo/base/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../demo/base/select';
import { Popover, PopoverContent, PopoverTrigger } from '../../../demo/base/popover';
import { Calendar } from '../../../demo/base/calendar';
import type { Task, TaskDraft } from '../../types/tasks';
import { useTasksContext } from '../../hooks/useAppFunctions';

type Status = 'todo' | 'in_progress' | 'done';
type Priority = 'low' | 'medium' | 'high';

interface TaskFormProps {
  task?: Partial<Task>;
}

export default function TaskForm({ task  }: TaskFormProps) {
  const {showForm, setShowForm, setEditingTask, editingTask, handleUpdateTask, handleCreateTask} = useTasksContext()
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
  }, []);
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
    [editingTask, handleCreateTask, handleUpdateTask]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
    onSubmit(formData);
  };

  return (
    <div className="tm-overlay" onClick={onCancel} role="dialog" aria-modal="true">
      <div className="tm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="tm-modal-header">
          <div className="tm-header-row">
            <div className="tm-header-left">
              <div className="tm-header-icon">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <h2 className="tm-header-title">{task ? 'Edit Task' : 'Create New Task'}</h2>
            </div>
            <Button variant="ghost" size="icon" onClick={onCancel} className="tm-header-close">
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">

          <div className="tm-field">
            <label className="tm-label">
              Task Title <span className="tm-label-asterisk">*</span>
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
          <div className="tm-field">
            <label className="tm-label">Description</label>
            <Textarea
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Add more details..."
              className="tm-textarea"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="tm-field">
              <label className="tm-label">Status</label>
              <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v as Status })}>
                <SelectTrigger className="tm-select-trigger">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="tm-select-content">
                  <SelectItem value="todo" className="tm-select-item">📋 To Do</SelectItem>
                  <SelectItem value="in_progress" className="tm-select-item">🚀 In Progress</SelectItem>
                  <SelectItem value="done" className="tm-select-item">✅ Done</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="tm-field">
              <label className="tm-label">Priority</label>
              <Select
                value={formData.priority}
                onValueChange={(v) => setFormData({ ...formData, priority: v as Priority })}
              >
                <SelectTrigger className="tm-select-trigger">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="tm-select-content">
                  <SelectItem value="low" className="tm-select-item">🟢 Low</SelectItem>
                  <SelectItem value="medium" className="tm-select-item">🟡 Medium</SelectItem>
                  <SelectItem value="high" className="tm-select-item">🔴 High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="tm-field">
              <label className="tm-label">Due Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="tm-calendar-trigger">
                    <CalendarIcon className="tm-calendar-icon" />
                    {formData.due_date ? (
                      <span>{format(new Date(formData.due_date), 'MMM d, yyyy')}</span>
                    ) : (
                      <span className="tm-calendar-placeholder">Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="relative w-[300px] py-2 bg-purple-600" align="start">
                  <Calendar
                    mode="single"
                    className='w-full p-5 bg-purple-600 checked:bg-red'
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

          {/* Footer */}
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onCancel} className="tm-btn-outline">
              Cancel
            </Button>
            <Button
              type="submit"
              className={[
                'tm-btn-primary',
                formData.priority === 'low' ? 'tm-btn-low' : '',
                formData.priority === 'medium' ? 'tm-btn-medium' : '',
                formData.priority === 'high' ? 'tm-btn-high' : '',
              ].join(' ')}
            >
              {task ? 'Update Task' : 'Create Task'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
