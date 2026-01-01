'use client';

import { TaskCard, EmptyTodayState } from './TaskCard';
import { Button } from '@/components/ui/Button';
import type { TimeBlock, Subtask, BacklogItem } from '@/types';
import { formatFullDate, timeToMinutes } from '@/lib/dateUtils';
import { getCalibrationStats } from '@/lib/calibration';
import Link from 'next/link';

interface TodayViewProps {
  date: Date;
  blocks: TimeBlock[];
  subtasks: Subtask[];
  backlogItems: BacklogItem[];
  completedSubtaskIds: Set<string>;
  onMarkComplete: (subtaskId: string) => void;
  onReschedule: (subtaskId: string) => void;
  onOpenMorningReview?: () => void;
}

export function TodayView({
  date,
  blocks,
  subtasks,
  backlogItems,
  completedSubtaskIds,
  onMarkComplete,
  onReschedule,
  onOpenMorningReview,
}: TodayViewProps) {
  // Sort blocks by start time
  const sortedBlocks = [...blocks].sort(
    (a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime)
  );

  // Get subtask for a block
  const getSubtask = (subtaskId: string) => {
    return subtasks.find((s) => s.id === subtaskId);
  };

  // Get parent item for a subtask
  const getParentItem = (backlogItemId: string) => {
    return backlogItems.find((b) => b.id === backlogItemId);
  };

  // Count completed vs total
  const totalTasks = blocks.length;
  const completedTasks = blocks.filter((b) => {
    const subtask = getSubtask(b.subtaskId);
    return subtask && completedSubtaskIds.has(subtask.id);
  }).length;

  // Calculate calibration stats from all subtasks
  const calibrationStats = getCalibrationStats(subtasks);

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <Link
            href="/"
            className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Week
          </Link>
          {onOpenMorningReview && (
            <Button
              variant="secondary"
              size="sm"
              onClick={onOpenMorningReview}
            >
              <svg
                className="w-4 h-4 mr-1.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
              Morning Review
            </Button>
          )}
        </div>

        <h1 className="text-2xl font-bold text-gray-900">{formatFullDate(date)}</h1>

        {totalTasks > 0 && (
          <div className="mt-2 flex items-center gap-2">
            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 transition-all duration-300"
                style={{ width: `${(completedTasks / totalTasks) * 100}%` }}
              />
            </div>
            <span className="text-sm text-gray-600">
              {completedTasks} of {totalTasks} completed
            </span>
          </div>
        )}

        {/* Calibration insight - shown after 3+ completed tasks with time data */}
        {calibrationStats.hasEnoughData && (
          <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
            <svg
              className="w-4 h-4 text-sage-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            <span>{calibrationStats.insight}</span>
            <span className="text-gray-400">
              (based on {calibrationStats.completedCount} tasks)
            </span>
          </div>
        )}
      </header>

      {/* Task list */}
      {sortedBlocks.length > 0 ? (
        <div className="space-y-3">
          {sortedBlocks.map((block) => {
            const subtask = getSubtask(block.subtaskId);
            if (!subtask) return null;

            const parentItem = getParentItem(subtask.backlogItemId);
            const isCompleted = completedSubtaskIds.has(subtask.id);

            return (
              <TaskCard
                key={block.id}
                block={block}
                subtask={subtask}
                parentItem={parentItem}
                isCompleted={isCompleted}
                onMarkComplete={() => onMarkComplete(subtask.id)}
                onReschedule={() => onReschedule(subtask.id)}
              />
            );
          })}
        </div>
      ) : (
        <EmptyTodayState />
      )}
    </div>
  );
}
