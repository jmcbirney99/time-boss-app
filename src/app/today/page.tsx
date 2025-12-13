'use client';

import { useState, useMemo } from 'react';
import { TodayView } from '@/components/today/TodayView';
import {
  getBacklogItems,
  getSubtasks,
  getTimeBlocks,
} from '@/data/mockData';
import { formatDateKey } from '@/lib/dateUtils';
import type { Subtask, TimeBlock } from '@/types';

export default function TodayPage() {
  // Use a fixed date that matches our mock data (Monday of the sample week)
  const today = useMemo(() => new Date('2025-12-09'), []);

  const backlogItems = getBacklogItems();
  const [subtasks, setSubtasks] = useState<Subtask[]>(getSubtasks());
  const [timeBlocks] = useState<TimeBlock[]>(getTimeBlocks());
  const [completedSubtaskIds, setCompletedSubtaskIds] = useState<Set<string>>(new Set());

  // Filter to today's blocks
  const todayDateKey = formatDateKey(today);
  const todayBlocks = useMemo(() => {
    return timeBlocks.filter((block) => block.date === todayDateKey);
  }, [timeBlocks, todayDateKey]);

  const handleMarkComplete = (subtaskId: string) => {
    // Update subtask status
    setSubtasks((prev) =>
      prev.map((s) =>
        s.id === subtaskId ? { ...s, status: 'completed' as const } : s
      )
    );

    // Track completed IDs
    setCompletedSubtaskIds((prev) => {
      const next = new Set(Array.from(prev));
      next.add(subtaskId);
      return next;
    });

    console.log(`Marked subtask ${subtaskId} as complete`);
  };

  const handleReschedule = (subtaskId: string) => {
    // In a real app, this would open a reschedule modal
    console.log(`Reschedule subtask ${subtaskId}`);
    alert('Reschedule functionality would open a modal here in the full app.');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <TodayView
        date={today}
        blocks={todayBlocks}
        subtasks={subtasks}
        backlogItems={backlogItems}
        completedSubtaskIds={completedSubtaskIds}
        onMarkComplete={handleMarkComplete}
        onReschedule={handleReschedule}
      />
    </div>
  );
}
