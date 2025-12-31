'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { TodayView } from '@/components/today/TodayView';
import { useBacklog, useSubtasks, useTimeBlocks } from '@/hooks/useData';
import { formatDateKey } from '@/lib/dateUtils';
import * as api from '@/lib/api';
import type { Subtask, TimeBlock, BacklogItem } from '@/types';

export default function TodayPage() {
  // Use actual today's date
  const today = useMemo(() => new Date(), []);
  const todayDateKey = formatDateKey(today);

  // Fetch data from API
  const { backlog: backlogItems, loading: backlogLoading } = useBacklog();
  const { subtasks: apiSubtasks, loading: subtasksLoading } = useSubtasks();
  const { timeBlocks: apiTimeBlocks, loading: timeBlocksLoading } = useTimeBlocks(todayDateKey, todayDateKey);

  // Local state for optimistic updates
  const [localSubtasks, setLocalSubtasks] = useState<Subtask[]>([]);
  const [localTimeBlocks, setLocalTimeBlocks] = useState<TimeBlock[]>([]);
  const [completedSubtaskIds, setCompletedSubtaskIds] = useState<Set<string>>(new Set());

  // Sync API data to local state
  useEffect(() => {
    if (apiSubtasks.length > 0) {
      setLocalSubtasks(apiSubtasks);
      // Pre-populate completed subtask IDs
      const completedIds = new Set(
        apiSubtasks.filter(s => s.status === 'completed').map(s => s.id)
      );
      setCompletedSubtaskIds(completedIds);
    }
  }, [apiSubtasks]);

  useEffect(() => {
    if (apiTimeBlocks.length > 0) {
      setLocalTimeBlocks(apiTimeBlocks);
    }
  }, [apiTimeBlocks]);

  // Filter to today's blocks
  const todayBlocks = useMemo(() => {
    return localTimeBlocks.filter((block) => block.date === todayDateKey);
  }, [localTimeBlocks, todayDateKey]);

  const handleMarkComplete = useCallback(async (subtaskId: string) => {
    // Optimistic update
    setLocalSubtasks((prev) =>
      prev.map((s) =>
        s.id === subtaskId
          ? { ...s, status: 'completed' as const, completedAt: new Date().toISOString() }
          : s
      )
    );

    setCompletedSubtaskIds((prev) => {
      const next = new Set(Array.from(prev));
      next.add(subtaskId);
      return next;
    });

    // Persist to API
    try {
      await api.updateSubtask(subtaskId, {
        status: 'completed',
        completedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Failed to mark subtask complete:', error);
      // Rollback optimistic update
      setLocalSubtasks((prev) =>
        prev.map((s) =>
          s.id === subtaskId
            ? { ...s, status: 'scheduled' as const, completedAt: undefined }
            : s
        )
      );
      setCompletedSubtaskIds((prev) => {
        const next = new Set(Array.from(prev));
        next.delete(subtaskId);
        return next;
      });
    }
  }, []);

  const handleReschedule = useCallback((subtaskId: string) => {
    // In a real app, this would open a reschedule modal
    console.log(`Reschedule subtask ${subtaskId}`);
    alert('Reschedule functionality would open a modal here in the full app.');
  }, []);

  const loading = backlogLoading || subtasksLoading || timeBlocksLoading;

  if (loading && localSubtasks.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sage-600 mx-auto mb-4"></div>
          <p className="text-stone-500">Loading today&apos;s tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <TodayView
        date={today}
        blocks={todayBlocks}
        subtasks={localSubtasks}
        backlogItems={backlogItems as BacklogItem[]}
        completedSubtaskIds={completedSubtaskIds}
        onMarkComplete={handleMarkComplete}
        onReschedule={handleReschedule}
      />
    </div>
  );
}
