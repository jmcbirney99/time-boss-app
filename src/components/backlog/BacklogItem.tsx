'use client';

import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import type { BacklogItem as BacklogItemType, Subtask } from '@/types';
import { formatDuration } from '@/lib/dateUtils';

interface BacklogItemProps {
  item: BacklogItemType;
  subtaskCount: number;
  onDecomposeClick: () => void;
}

export function BacklogItem({ item, subtaskCount, onDecomposeClick }: BacklogItemProps) {
  const isDecomposed = item.status === 'decomposed';

  return (
    <div className="backlog-card">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-gray-900 truncate">{item.title}</h3>
          {item.description && (
            <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{item.description}</p>
          )}
        </div>
        <Badge variant={item.status}>{item.status}</Badge>
      </div>

      <div className="mt-2 flex items-center justify-between">
        {isDecomposed ? (
          <span className="text-xs text-gray-500">
            {subtaskCount} subtask{subtaskCount !== 1 ? 's' : ''}
          </span>
        ) : (
          <Button variant="ghost" size="sm" onClick={onDecomposeClick}>
            Break Down
          </Button>
        )}
      </div>
    </div>
  );
}

// Draggable subtask card for scheduling
interface DraggableSubtaskProps {
  subtask: Subtask;
  parentTitle: string;
  isDragging?: boolean;
}

export function DraggableSubtask({ subtask, parentTitle, isDragging: externalDragging }: DraggableSubtaskProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: subtask.id,
    data: {
      type: 'subtask',
      subtask,
    },
  });

  const style = transform
    ? {
        transform: CSS.Translate.toString(transform),
      }
    : undefined;

  const isCurrentlyDragging = isDragging || externalDragging;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`backlog-card ${isCurrentlyDragging ? 'dragging opacity-50' : ''}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-gray-900 truncate">{subtask.title}</h4>
          <p className="text-xs text-gray-500 mt-0.5 truncate">{parentTitle}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="count">{formatDuration(subtask.estimatedMinutes)}</Badge>
          <StatusIndicator status={subtask.status} />
        </div>
      </div>
    </div>
  );
}

// Small status indicator dot
function StatusIndicator({ status }: { status: Subtask['status'] }) {
  const colors: Record<Subtask['status'], string> = {
    estimated: 'bg-yellow-400',
    scheduled: 'bg-blue-400',
    completed: 'bg-green-400',
    overflow: 'bg-red-400',
  };

  return (
    <span
      className={`w-2 h-2 rounded-full ${colors[status]}`}
      title={status}
    />
  );
}
