'use client';

import { useMemo } from 'react';
import type { TimeBlock as TimeBlockType, ExternalEvent, Subtask, DayColumn } from '@/types';
import { TimelineBlock, ExternalTimelineBlock } from './TimelineBlock';
import { WORK_HOURS } from '@/lib/constants';
import { formatTime } from '@/lib/dateUtils';

interface TimelinePanelProps {
  day: DayColumn | null;
  blocks: TimeBlockType[];
  events: ExternalEvent[];
  subtasks: Subtask[];
  onBlockClick?: (blockId: string) => void;
}

export function TimelinePanel({
  day,
  blocks,
  events,
  subtasks,
  onBlockClick,
}: TimelinePanelProps) {
  // Generate hour slots (8am to 5pm)
  const hours = useMemo(() =>
    Array.from({ length: WORK_HOURS.totalHours }, (_, i) => WORK_HOURS.start + i),
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
  const currentTimeOffset = isWorkingHours && day?.isToday
    ? (currentHour - WORK_HOURS.start) * 60 + currentMinute
    : null;

  if (!day) {
    return (
      <div className="flex items-center justify-center h-full text-stone-400">
        <div className="text-center">
          <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-sm">Select a day to view timeline</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-paper-border overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-paper-border bg-paper">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-stone-900">{day.dayName}</h2>
            <p className="text-sm text-stone-500">{day.shortDate}</p>
          </div>
          {day.isToday && (
            <span className="px-3 py-1 text-xs font-medium text-sage-700 bg-sage-100 rounded-full">
              Today
            </span>
          )}
        </div>
      </div>

      {/* Timeline */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="flex">
          {/* Time labels */}
          <div className="flex-shrink-0 w-16 border-r border-paper-border bg-paper-dark">
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
              <div
                key={hour}
                className="h-[60px] border-b border-paper-border"
              />
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
      <div className="px-6 py-3 border-t border-paper-border bg-paper text-sm text-stone-500">
        {blocks.length} task{blocks.length !== 1 ? 's' : ''} &middot; {events.length} meeting{events.length !== 1 ? 's' : ''}
      </div>
    </div>
  );
}
