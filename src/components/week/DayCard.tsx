'use client';

import { useDroppable } from '@dnd-kit/core';
import type { DayColumn } from '@/types';
import { CapacityBar } from './CapacityBar';
import { Badge } from '@/components/ui/Badge';

interface DayCardProps {
  day: DayColumn;
  isExpanded: boolean;
  onClick: () => void;
}

export function DayCard({ day, isExpanded, onClick }: DayCardProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: day.id,
    data: { type: 'day', dayId: day.id, date: day.date },
  });

  const isOverCapacity = day.scheduledMinutes > day.capacity;

  return (
    <div
      ref={setNodeRef}
      onClick={onClick}
      className={`
        day-card
        ${isExpanded ? 'expanded' : ''}
        ${isOver ? 'drop-over' : ''}
      `}
    >
      {/* Header: Day name + date + chevron */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div>
            <div className="font-semibold text-stone-900">
              {day.dayName}
              {day.isToday && (
                <span className="ml-2 text-xs font-normal text-sage-600">Today</span>
              )}
            </div>
            <div className="text-sm text-stone-500">{day.shortDate}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {day.taskCount > 0 && (
            <Badge variant="count">{day.taskCount} task{day.taskCount !== 1 ? 's' : ''}</Badge>
          )}
          {/* Chevron indicator */}
          <div className={`chevron-icon ${isExpanded ? 'expanded' : ''}`}>
            <svg className="w-5 h-5 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Capacity bar */}
      <CapacityBar
        used={day.scheduledMinutes}
        total={day.capacity}
        showLabel={true}
      />

      {/* Overflow warning */}
      {isOverCapacity && (
        <div className="mt-2 text-xs text-coral-500 font-medium">
          Over capacity by {Math.round((day.scheduledMinutes - day.capacity) / 60)}h
        </div>
      )}
    </div>
  );
}
