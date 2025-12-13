'use client';

import { Button, LinkButton } from '@/components/ui/Button';
import type { TimeBlock, Subtask, BacklogItem } from '@/types';
import { formatTimeRange } from '@/lib/dateUtils';

interface TaskCardProps {
  block: TimeBlock;
  subtask: Subtask;
  parentItem?: BacklogItem;
  isCompleted: boolean;
  onMarkComplete: () => void;
  onReschedule: () => void;
}

export function TaskCard({
  block,
  subtask,
  parentItem,
  isCompleted,
  onMarkComplete,
  onReschedule,
}: TaskCardProps) {
  return (
    <div
      className={`
        bg-white rounded-lg border p-4 transition-all
        ${isCompleted ? 'border-green-200 bg-green-50' : 'border-gray-200 hover:shadow-md'}
      `}
    >
      <div className="flex items-start gap-4">
        {/* Time range */}
        <div className="flex-shrink-0 w-32">
          <div className={`text-sm font-medium ${isCompleted ? 'text-green-700' : 'text-gray-900'}`}>
            {formatTimeRange(block.startTime, block.endTime)}
          </div>
        </div>

        {/* Task details */}
        <div className="flex-1 min-w-0">
          <h3
            className={`
              font-medium
              ${isCompleted ? 'text-green-700 line-through' : 'text-gray-900'}
            `}
          >
            {subtask.title}
          </h3>
          {parentItem && (
            <p className="text-sm text-gray-500 mt-0.5">{parentItem.title}</p>
          )}
          {subtask.definitionOfDone && (
            <p className="text-xs text-gray-400 mt-1 italic">
              Done when: {subtask.definitionOfDone}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {isCompleted ? (
            <div className="flex items-center gap-2 text-green-600">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span className="text-sm font-medium">Complete</span>
            </div>
          ) : (
            <>
              <Button size="sm" onClick={onMarkComplete}>
                Mark Complete
              </Button>
              <LinkButton onClick={onReschedule}>Reschedule</LinkButton>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Empty state for when there are no tasks today
export function EmptyTodayState() {
  return (
    <div className="text-center py-12">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
        <svg
          className="w-8 h-8 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-1">No tasks scheduled</h3>
      <p className="text-gray-500">You have a clear day! Add some tasks from your backlog.</p>
    </div>
  );
}
