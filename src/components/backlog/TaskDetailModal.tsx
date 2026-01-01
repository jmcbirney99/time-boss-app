'use client';

import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import type { BacklogItem, Category, Subtask } from '@/types';

interface TaskDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: BacklogItem | null;
  categories: Category[];
  subtasks: Subtask[];
  onDelete?: (taskId: string) => Promise<void>;
  onDecompose?: (taskId: string) => void;
}

const priorityColors: Record<string, string> = {
  high: 'bg-red-100 text-red-700',
  medium: 'bg-amber-100 text-amber-700',
  low: 'bg-blue-100 text-blue-700',
  none: 'bg-gray-100 text-gray-600',
};

const statusLabels: Record<string, string> = {
  backlog: 'Needs Breakdown',
  decomposed: 'Decomposed',
  completed: 'Completed',
};

export function TaskDetailModal({
  isOpen,
  onClose,
  task,
  categories,
  subtasks,
  onDelete,
  onDecompose,
}: TaskDetailModalProps) {
  if (!task) return null;

  const category = categories.find((c) => c.id === task.categoryId);
  const taskSubtasks = subtasks.filter((s) => s.backlogItemId === task.id);

  const handleDelete = async () => {
    if (!onDelete) return;
    if (window.confirm('Are you sure you want to delete this task?')) {
      await onDelete(task.id);
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={task.title}
      size="lg"
      footer={
        <div className="flex items-center gap-3 w-full">
          {onDelete && (
            <Button variant="ghost" size="sm" onClick={handleDelete} className="text-red-600 hover:text-red-700 hover:bg-red-50">
              Delete
            </Button>
          )}
          <div className="flex-1" />
          {task.status === 'backlog' && onDecompose && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                onDecompose(task.id);
                onClose();
              }}
            >
              Break Down
            </Button>
          )}
          <Button size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Status and Priority badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-stone-100 text-stone-700">
            {statusLabels[task.status] || task.status}
          </span>
          {task.priorityLevel && task.priorityLevel !== 'none' && (
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${priorityColors[task.priorityLevel]}`}>
              {task.priorityLevel.charAt(0).toUpperCase() + task.priorityLevel.slice(1)} Priority
            </span>
          )}
        </div>

        {/* Description */}
        {task.description && (
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
              Description
            </h4>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{task.description}</p>
          </div>
        )}

        {/* Due Date */}
        {task.dueDate && (
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
              Due Date
            </h4>
            <p className="text-sm text-gray-700">
              {new Date(task.dueDate).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
              {task.dueTime && ` at ${task.dueTime}`}
              {task.dueDateEnd && ` - ${new Date(task.dueDateEnd).toLocaleDateString()}`}
            </p>
          </div>
        )}

        {/* Category */}
        {category && (
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
              Category
            </h4>
            <div className="flex items-center gap-2">
              {category.color && (
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: category.color }}
                />
              )}
              <span className="text-sm text-gray-700">{category.name}</span>
            </div>
          </div>
        )}

        {/* Tags */}
        {task.tags && task.tags.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
              Tags
            </h4>
            <div className="flex flex-wrap gap-1">
              {task.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-2 py-0.5 rounded-md text-xs bg-sage-100 text-sage-700"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Recurring */}
        {task.recurringFrequency && (
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
              Recurring
            </h4>
            <p className="text-sm text-gray-700">
              {task.recurringRule || `${task.recurringFrequency}${task.recurringInterval ? ` (every ${task.recurringInterval})` : ''}`}
            </p>
          </div>
        )}

        {/* Subtasks */}
        {taskSubtasks.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Subtasks ({taskSubtasks.length})
            </h4>
            <div className="space-y-2">
              {taskSubtasks.map((subtask) => (
                <div
                  key={subtask.id}
                  className="flex items-center gap-3 p-2 rounded-lg bg-gray-50"
                >
                  <div className={`w-2 h-2 rounded-full ${
                    subtask.status === 'completed' ? 'bg-green-500' :
                    subtask.status === 'in_progress' ? 'bg-blue-500' :
                    subtask.status === 'scheduled' ? 'bg-amber-500' :
                    'bg-gray-300'
                  }`} />
                  <span className={`text-sm flex-1 ${subtask.status === 'completed' ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                    {subtask.title}
                  </span>
                  <span className="text-xs text-gray-500">
                    {subtask.estimatedMinutes}m
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
