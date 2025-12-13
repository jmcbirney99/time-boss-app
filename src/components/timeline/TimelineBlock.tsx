'use client';

import type { TimeBlock as TimeBlockType, ExternalEvent, Subtask } from '@/types';
import { timeToMinutes } from '@/lib/dateUtils';
import { WORK_HOURS } from '@/lib/constants';

interface TimelineBlockProps {
  block: TimeBlockType;
  subtask?: Subtask;
  onClick?: () => void;
}

export function TimelineBlock({ block, subtask, onClick }: TimelineBlockProps) {
  const startMinutes = timeToMinutes(block.startTime);
  const endMinutes = timeToMinutes(block.endTime);
  const duration = endMinutes - startMinutes;

  // Calculate position and height (1px per minute)
  const topOffset = startMinutes - WORK_HOURS.start * 60;
  const height = duration;

  const style = {
    top: `${topOffset}px`,
    height: `${height}px`,
  };

  const isCompleted = subtask?.status === 'completed';

  return (
    <div
      className={`time-block time-block-task ${isCompleted ? 'opacity-60' : ''}`}
      style={style}
      onClick={onClick}
      title={subtask?.title || block.subtaskId}
    >
      <div className="flex items-center gap-2">
        {isCompleted && (
          <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        )}
        <span className="truncate">{subtask?.title || 'Task'}</span>
      </div>
      {duration >= 60 && (
        <div className="text-xs opacity-75 truncate mt-1">
          {block.startTime} - {block.endTime}
        </div>
      )}
    </div>
  );
}

interface ExternalBlockProps {
  event: ExternalEvent;
}

export function ExternalTimelineBlock({ event }: ExternalBlockProps) {
  const startMinutes = timeToMinutes(event.startTime);
  const endMinutes = timeToMinutes(event.endTime);
  const duration = endMinutes - startMinutes;

  // Calculate position and height
  const topOffset = startMinutes - WORK_HOURS.start * 60;
  const height = duration;

  const style = {
    top: `${topOffset}px`,
    height: `${height}px`,
  };

  return (
    <div
      className="time-block time-block-external"
      style={style}
      title={event.title}
    >
      <div className="truncate">{event.title}</div>
      {duration >= 60 && (
        <div className="text-xs opacity-75 truncate mt-1">
          {event.startTime} - {event.endTime}
        </div>
      )}
    </div>
  );
}
