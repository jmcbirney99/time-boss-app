import { useMemo } from 'react';
import type { User, ExternalEvent, TimeBlock, CapacityResult } from '@/types';
import { WORK_HOURS } from '@/lib/constants';
import { calculateDuration, formatDateKey } from '@/lib/dateUtils';

export function useCapacityCalculation(
  user: User,
  externalEvents: ExternalEvent[],
  timeBlocks: TimeBlock[],
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _weekStart: Date
): CapacityResult {
  return useMemo(() => {
    // Calculate total work minutes for the week (9 hours/day * 5 days)
    const totalWorkMinutes = user.workHours.days.length * WORK_HOURS.totalHours * 60;

    // Sum external event durations
    const externalMinutes = externalEvents.reduce((sum, event) => {
      const duration = calculateDuration(event.startTime, event.endTime);
      return sum + duration;
    }, 0);

    // Calculate available time after externals
    const afterExternals = totalWorkMinutes - externalMinutes;

    // Whirlwind buffer (40% of remaining time after externals)
    const whirlwindMinutes = Math.round(afterExternals * user.whirlwindPercentage);

    // Available for scheduling (plannable capacity)
    const availableMinutes = afterExternals - whirlwindMinutes;

    // Currently scheduled task time
    const scheduledMinutes = timeBlocks.reduce((sum, block) => {
      const duration = calculateDuration(block.startTime, block.endTime);
      return sum + duration;
    }, 0);

    // Calculate remaining
    const remainingMinutes = availableMinutes - scheduledMinutes;
    const isOverCapacity = remainingMinutes < 0;
    const overflowMinutes = isOverCapacity ? Math.abs(remainingMinutes) : 0;

    return {
      totalWorkMinutes,
      externalMinutes,
      whirlwindMinutes,
      availableMinutes,
      scheduledMinutes,
      remainingMinutes: Math.abs(remainingMinutes),
      isOverCapacity,
      overflowMinutes,
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, externalEvents, timeBlocks]);
}

// Calculate capacity for a single day
export function useDailyCapacity(
  user: User,
  externalEvents: ExternalEvent[],
  timeBlocks: TimeBlock[],
  date: Date
) {
  return useMemo(() => {
    const dateKey = formatDateKey(date);

    // Filter events and blocks for this day
    const dayEvents = externalEvents.filter((e) => e.date === dateKey);
    const dayBlocks = timeBlocks.filter((b) => b.date === dateKey);

    // Daily work minutes (9 hours)
    const totalWorkMinutes = WORK_HOURS.totalHours * 60;

    // External minutes for this day
    const externalMinutes = dayEvents.reduce((sum, event) => {
      return sum + calculateDuration(event.startTime, event.endTime);
    }, 0);

    // Whirlwind for this day
    const afterExternals = totalWorkMinutes - externalMinutes;
    const whirlwindMinutes = Math.round(afterExternals * user.whirlwindPercentage);

    // Available
    const availableMinutes = afterExternals - whirlwindMinutes;

    // Scheduled
    const scheduledMinutes = dayBlocks.reduce((sum, block) => {
      return sum + calculateDuration(block.startTime, block.endTime);
    }, 0);

    return {
      totalWorkMinutes,
      externalMinutes,
      whirlwindMinutes,
      availableMinutes,
      scheduledMinutes,
      remainingMinutes: Math.max(0, availableMinutes - scheduledMinutes),
    };
  }, [user, externalEvents, timeBlocks, date]);
}
