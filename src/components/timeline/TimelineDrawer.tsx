'use client';

import { useMemo } from 'react';
import type { TimeBlock as TimeBlockType, ExternalEvent, Subtask, DayColumn } from '@/types';
import { TimelineBlock, ExternalTimelineBlock } from './TimelineBlock';
import { WORK_HOURS } from '@/lib/constants';
import { formatTime } from '@/lib/dateUtils';

interface TimelineDrawerProps {
  day: DayColumn;
  blocks: TimeBlockType[];
  events: ExternalEvent[];
  subtasks: Subtask[];
  onClose: () => void;
  onBlockClick?: (blockId: string) => void;
}

export function TimelineDrawer({
  day,
  blocks,
  events,
  subtasks,
  onClose,
  onBlockClick,
}: TimelineDrawerProps) {
  // Generate hour slots (8am to 5pm)
  const hours = useMemo(
    () => Array.from({ length: WORK_HOURS.totalHours }, (_, i) => WORK_HOURS.start + i),
    []
  );

  // Get subtask for a block
  const getSubtask = (subtaskId: string) => {
    return subtasks.find((s) => s.id === subtaskId);
  };

  // Calculate current time position
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const isWorkingHours = currentHour >= WORK_HOURS.start && currentHour < WORK_HOURS.end;
  const currentTimeOffset =
    isWorkingHours && day.isToday ? (currentHour - WORK_HOURS.start) * 60 + currentMinute : null;

  return (
    <div className="timeline-drawer">
      {/* Header with close button */}
      <div className="px-4 py-3 border-b border-paper-border bg-paper flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-stone-700">
            {day.dayName} Timeline
          </span>
          {day.isToday && (
            <span className="px-2 py-0.5 text-xs font-medium text-sage-700 bg-sage-100 rounded-full">
              Today
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          className="p-1 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded transition-colors"
          aria-label="Close timeline"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Timeline - max height with scroll */}
      <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
        <div className="flex">
          {/* Time labels */}
          <div className="flex-shrink-0 w-14 border-r border-paper-border bg-paper-dark">
            {hours.map((hour) => (
              <div
                key={hour}
                className="h-[60px] px-2 py-1 text-right text-xs text-stone-400 border-b border-paper-border"
              >
                {formatTime(`${hour.toString().padStart(2, '0')}:00`)}
              </div>
            ))}
          </div>

          {/* Timeline content */}
          <div className="flex-1 relative">
            {/* Hour grid lines */}
            {hours.map((hour) => (
              <div key={hour} className="h-[60px] border-b border-paper-border" />
            ))}

            {/* Current time indicator */}
            {currentTimeOffset !== null && (
              <div
                className="absolute left-0 right-0 z-30 pointer-events-none"
                style={{ top: `${currentTimeOffset}px` }}
              >
                <div className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-coral" />
                  <div className="flex-1 h-0.5 bg-coral" />
                </div>
              </div>
            )}

            {/* External events */}
            {events.map((event) => (
              <ExternalTimelineBlock key={event.id} event={event} />
            ))}

            {/* Task blocks */}
            {blocks.map((block) => (
              <TimelineBlock
                key={block.id}
                block={block}
                subtask={getSubtask(block.subtaskId)}
                onClick={() => onBlockClick?.(block.id)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Footer summary */}
      <div className="px-4 py-2 border-t border-paper-border bg-paper text-xs text-stone-500">
        {blocks.length} task{blocks.length !== 1 ? 's' : ''} &middot; {events.length} meeting
        {events.length !== 1 ? 's' : ''}
      </div>
    </div>
  );
}
