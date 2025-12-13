'use client';

import { useDroppable } from '@dnd-kit/core';
import { BacklogItem, DraggableSubtask } from './BacklogItem';
import type { BacklogItem as BacklogItemType, Subtask } from '@/types';

interface BacklogListProps {
  backlogItems: BacklogItemType[];
  subtasks: Subtask[];
  onDecomposeClick: (backlogItemId: string) => void;
}

export function BacklogList({ backlogItems, subtasks, onDecomposeClick }: BacklogListProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: 'backlog-drop-zone',
    data: { type: 'backlog' },
  });

  // Get subtasks by parent backlog item
  const getSubtasksForItem = (itemId: string) => {
    return subtasks.filter((s) => s.backlogItemId === itemId);
  };

  // Get unscheduled subtasks (estimated status, not scheduled)
  const getUnscheduledSubtasks = (itemId: string) => {
    return subtasks.filter(
      (s) => s.backlogItemId === itemId && (s.status === 'estimated' || s.status === 'overflow')
    );
  };

  // Separate decomposed vs raw items
  const decomposedItems = backlogItems.filter((item) => item.status === 'decomposed');
  const rawItems = backlogItems.filter((item) => item.status === 'backlog');

  return (
    <div
      ref={setNodeRef}
      className={`p-4 h-full ${isOver ? 'bg-blue-50' : ''}`}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Backlog</h2>
        <span className="text-sm text-gray-500">
          {backlogItems.length} item{backlogItems.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Unscheduled subtasks ready to be scheduled */}
      {decomposedItems.length > 0 && (
        <div className="mb-6">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Ready to Schedule
          </h3>
          <div className="space-y-2">
            {decomposedItems.map((item) => {
              const unscheduledSubtasks = getUnscheduledSubtasks(item.id);
              return unscheduledSubtasks.map((subtask) => (
                <DraggableSubtask
                  key={subtask.id}
                  subtask={subtask}
                  parentTitle={item.title}
                />
              ));
            })}
          </div>
        </div>
      )}

      {/* Decomposed parent items */}
      {decomposedItems.length > 0 && (
        <div className="mb-6">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            In Progress
          </h3>
          <div className="space-y-2">
            {decomposedItems.map((item) => (
              <BacklogItem
                key={item.id}
                item={item}
                subtaskCount={getSubtasksForItem(item.id).length}
                onDecomposeClick={() => onDecomposeClick(item.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Raw backlog items */}
      {rawItems.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Needs Breakdown
          </h3>
          <div className="space-y-2">
            {rawItems.map((item) => (
              <BacklogItem
                key={item.id}
                item={item}
                subtaskCount={0}
                onDecomposeClick={() => onDecomposeClick(item.id)}
              />
            ))}
          </div>
        </div>
      )}

      {backlogItems.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p className="text-sm">No items in backlog</p>
        </div>
      )}
    </div>
  );
}
