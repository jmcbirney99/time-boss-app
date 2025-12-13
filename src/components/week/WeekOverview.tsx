'use client';

import type { DayColumn, TimeBlock, ExternalEvent, Subtask } from '@/types';
import { DayCard } from './DayCard';
import { TimelineDrawer } from '@/components/timeline/TimelineDrawer';

interface WeekOverviewProps {
  days: DayColumn[];
  expandedDayId: string | null;
  onDayClick: (dayId: string) => void;
  timelineBlocks: TimeBlock[];
  timelineEvents: ExternalEvent[];
  subtasks: Subtask[];
  isMobile: boolean;
}

export function WeekOverview({
  days,
  expandedDayId,
  onDayClick,
  timelineBlocks,
  timelineEvents,
  subtasks,
  isMobile,
}: WeekOverviewProps) {
  // Calculate week totals
  const totalCapacity = days.reduce((sum, day) => sum + day.capacity, 0);
  const totalScheduled = days.reduce((sum, day) => sum + day.scheduledMinutes, 0);
  const totalTasks = days.reduce((sum, day) => sum + day.taskCount, 0);

  // Get blocks and events for a specific day
  const getBlocksForDay = (date: string) => timelineBlocks.filter((b) => b.date === date);
  const getEventsForDay = (date: string) => timelineEvents.filter((e) => e.date === date);

  return (
    <div className="flex flex-col h-full">
      {/* Week summary header */}
      <div className="mb-4 p-4 bg-sage-50 rounded-2xl">
        <div className="text-sm font-medium text-sage-700 mb-1">Week Overview</div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-semibold text-stone-900">
            {Math.round(totalScheduled / 60)}h
          </span>
          <span className="text-stone-500">of {Math.round(totalCapacity / 60)}h planned</span>
        </div>
        <div className="text-sm text-stone-500 mt-1">
          {totalTasks} task{totalTasks !== 1 ? 's' : ''} scheduled
        </div>
      </div>

      {/* Day cards with inline drawers */}
      <div className="flex-1 space-y-3 overflow-y-auto custom-scrollbar">
        {days.map((day) => (
          <div key={day.id}>
            <DayCard
              day={day}
              isExpanded={expandedDayId === day.id}
              onClick={() => onDayClick(day.id)}
            />
            {/* Desktop: Inline drawer below expanded day card */}
            {!isMobile && expandedDayId === day.id && (
              <TimelineDrawer
                day={day}
                blocks={getBlocksForDay(day.date)}
                events={getEventsForDay(day.date)}
                subtasks={subtasks}
                onClose={() => onDayClick(day.id)}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
