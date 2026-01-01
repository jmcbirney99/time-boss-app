'use client';

import { useState, useMemo } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import type { Subtask, TimeBlock, DailyReviewAction } from '@/types';
import { formatDuration, formatTime, formatFullDate, timeToMinutes } from '@/lib/dateUtils';

interface IncompleteItemData {
  subtask: Subtask;
  parentTitle: string;
  block?: TimeBlock;
}

interface TodayBlockData {
  block: TimeBlock;
  subtask: Subtask;
  parentTitle: string;
}

interface DailyReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  yesterdayDate: Date;
  todayDate: Date;
  incompleteSubtasks: IncompleteItemData[];
  todayBlocks: TodayBlockData[];
  onStartDay: (
    resolutions: Map<string, { action: DailyReviewAction; newDate?: string }>,
    notes?: string
  ) => void;
}

export function DailyReviewModal({
  isOpen,
  onClose,
  yesterdayDate,
  todayDate,
  incompleteSubtasks,
  todayBlocks,
  onStartDay,
}: DailyReviewModalProps) {
  const [resolutions, setResolutions] = useState<
    Map<string, { action: DailyReviewAction; newDate?: string }>
  >(new Map());
  const [notes, setNotes] = useState('');

  // Sort today's blocks by start time
  const sortedTodayBlocks = useMemo(() => {
    return [...todayBlocks].sort(
      (a, b) => timeToMinutes(a.block.startTime) - timeToMinutes(b.block.startTime)
    );
  }, [todayBlocks]);

  const handleResolutionChange = (subtaskId: string, action: DailyReviewAction) => {
    setResolutions((prev) => {
      const next = new Map(prev);
      const todayDateStr = todayDate.toISOString().split('T')[0];
      next.set(subtaskId, {
        action,
        newDate: action === 'reschedule' ? todayDateStr : undefined,
      });
      return next;
    });
  };

  const handleStartDay = () => {
    onStartDay(resolutions, notes.trim() || undefined);
    onClose();
    // Reset state
    setResolutions(new Map());
    setNotes('');
  };

  // Check if all incomplete items are resolved
  const allResolved = incompleteSubtasks.every((item) =>
    resolutions.has(item.subtask.id)
  );

  // Can start day if no incomplete items or all are resolved
  const canStartDay = incompleteSubtasks.length === 0 || allResolved;

  // Calculate total time for today
  const totalTodayMinutes = sortedTodayBlocks.reduce((sum, item) => {
    return sum + item.subtask.estimatedMinutes;
  }, 0);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Morning Review"
      size="xl"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleStartDay} disabled={!canStartDay}>
            Start Day
          </Button>
        </>
      }
    >
      {/* Header with today's date */}
      <div className="mb-6 p-4 bg-sage-50 border border-sage-200 rounded-lg">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            <svg
              className="w-6 h-6 text-sage-600"
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
          </div>
          <div>
            <h3 className="font-semibold text-sage-800">
              Good morning! Today is {formatFullDate(todayDate)}
            </h3>
            <p className="text-sm text-sage-700 mt-1">
              {sortedTodayBlocks.length > 0
                ? `You have ${sortedTodayBlocks.length} task${sortedTodayBlocks.length > 1 ? 's' : ''} scheduled (${formatDuration(totalTodayMinutes)})`
                : 'No tasks scheduled for today yet'}
            </p>
          </div>
        </div>
      </div>

      {/* Yesterday's Incomplete Section */}
      {incompleteSubtasks.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <svg
              className="w-4 h-4 text-yellow-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Yesterday&apos;s Incomplete ({incompleteSubtasks.length})
          </h4>
          <p className="text-sm text-gray-500 mb-4">
            Choose how to handle each incomplete task from {formatFullDate(yesterdayDate)}
          </p>

          <div className="space-y-4">
            {incompleteSubtasks.map((item) => (
              <IncompleteItemRow
                key={item.subtask.id}
                item={item}
                selectedAction={resolutions.get(item.subtask.id)?.action}
                onActionChange={(action) =>
                  handleResolutionChange(item.subtask.id, action)
                }
              />
            ))}
          </div>

          {/* Progress indicator */}
          <div className="mt-4 pt-3 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">
                {resolutions.size} of {incompleteSubtasks.length} resolved
              </span>
              {!allResolved && (
                <span className="text-yellow-600">
                  Resolve all items to start your day
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Today's Preview Section */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <svg
            className="w-4 h-4 text-blue-500"
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
          Today&apos;s Schedule
        </h4>

        {sortedTodayBlocks.length > 0 ? (
          <div className="space-y-2">
            {sortedTodayBlocks.map((item) => (
              <TodayBlockRow key={item.block.id} item={item} />
            ))}
          </div>
        ) : (
          <div className="p-4 bg-gray-50 rounded-lg text-center">
            <p className="text-gray-500 text-sm">
              No tasks scheduled for today. Head to the Week view to plan your day.
            </p>
          </div>
        )}
      </div>

      {/* Notes Section */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
          <svg
            className="w-4 h-4 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
          Notes (optional)
        </h4>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Any thoughts for the day, intentions, or context..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-sage-400 focus:border-transparent"
          rows={3}
        />
      </div>
    </Modal>
  );
}

// Incomplete item row with resolution options
interface IncompleteItemRowProps {
  item: IncompleteItemData;
  selectedAction?: DailyReviewAction;
  onActionChange: (action: DailyReviewAction) => void;
}

function IncompleteItemRow({
  item,
  selectedAction,
  onActionChange,
}: IncompleteItemRowProps) {
  const resolutionOptions: { value: DailyReviewAction; label: string }[] = [
    { value: 'reschedule', label: 'Reschedule to today' },
    { value: 'defer', label: 'Defer to backlog' },
    { value: 'delete', label: 'Delete' },
  ];

  return (
    <div className="p-4 bg-gray-50 rounded-lg">
      {/* Task info */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <h5 className="font-medium text-gray-900">{item.subtask.title}</h5>
          <p className="text-sm text-gray-500">{item.parentTitle}</p>
        </div>
        <Badge variant="count">{formatDuration(item.subtask.estimatedMinutes)}</Badge>
      </div>

      {/* Resolution options */}
      <div className="flex gap-2 flex-wrap">
        {resolutionOptions.map((option) => (
          <label
            key={option.value}
            className={`
              flex items-center gap-2 px-3 py-1.5 rounded-lg cursor-pointer border transition-colors text-sm
              ${
                selectedAction === option.value
                  ? option.value === 'delete'
                    ? 'border-red-400 bg-red-50 text-red-700'
                    : option.value === 'defer'
                    ? 'border-yellow-400 bg-yellow-50 text-yellow-700'
                    : 'border-sage-400 bg-sage-50 text-sage-700'
                  : 'border-gray-200 hover:border-gray-300 text-gray-700'
              }
            `}
          >
            <input
              type="radio"
              name={`resolution-${item.subtask.id}`}
              value={option.value}
              checked={selectedAction === option.value}
              onChange={() => onActionChange(option.value)}
              className="sr-only"
            />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

// Today block row showing scheduled task
interface TodayBlockRowProps {
  item: TodayBlockData;
}

function TodayBlockRow({ item }: TodayBlockRowProps) {
  return (
    <div className="flex items-center gap-4 p-3 bg-white border border-gray-200 rounded-lg">
      {/* Time */}
      <div className="flex-shrink-0 text-sm text-gray-500 w-24">
        {formatTime(item.block.startTime)}
      </div>

      {/* Task info */}
      <div className="flex-1 min-w-0">
        <h5 className="font-medium text-gray-900 truncate">{item.subtask.title}</h5>
        <p className="text-sm text-gray-500 truncate">{item.parentTitle}</p>
      </div>

      {/* Duration */}
      <Badge variant="count">{formatDuration(item.subtask.estimatedMinutes)}</Badge>
    </div>
  );
}
