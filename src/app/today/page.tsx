'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { TodayView } from '@/components/today/TodayView';
import { TaskBoundaryModal } from '@/components/modals/TaskBoundaryModal';
import { useBacklog, useSubtasks, useTimeBlocks } from '@/hooks/useData';
import { useTimeBlockBoundary } from '@/hooks/useTimeBlockBoundary';
import { formatDateKey } from '@/lib/dateUtils';
import * as api from '@/lib/api';
import type { Subtask, TimeBlock, BacklogItem } from '@/types';

export default function TodayPage() {
  // Use actual today's date
  const today = useMemo(() => new Date(), []);
  const todayDateKey = formatDateKey(today);

  // Fetch data from API
  const { backlog: backlogItems, loading: backlogLoading, refresh: refreshBacklog } = useBacklog();
  const { subtasks: apiSubtasks, loading: subtasksLoading, refresh: refreshSubtasks } = useSubtasks();
  const { timeBlocks: apiTimeBlocks, loading: timeBlocksLoading, refresh: refreshTimeBlocks } = useTimeBlocks(todayDateKey, todayDateKey);

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

  // Time block boundary detection
  const { endedBlock, clearEndedBlock } = useTimeBlockBoundary(todayBlocks);

  // Find the subtask and parent item for the ended block
  const endedBlockSubtask = useMemo(() => {
    if (!endedBlock) return null;
    return localSubtasks.find((s) => s.id === endedBlock.subtaskId) || null;
  }, [endedBlock, localSubtasks]);

  const endedBlockParentItem = useMemo(() => {
    if (!endedBlockSubtask) return undefined;
    return backlogItems.find((item) => item.id === endedBlockSubtask.backlogItemId);
  }, [endedBlockSubtask, backlogItems]);

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

  // Handler for marking complete from the boundary modal (with optional actual time)
  const handleBoundaryMarkComplete = useCallback(async (actualMinutes?: number) => {
    if (!endedBlockSubtask || !endedBlock) return;

    const subtaskId = endedBlockSubtask.id;

    // Optimistic update
    setLocalSubtasks((prev) =>
      prev.map((s) =>
        s.id === subtaskId
          ? {
              ...s,
              status: 'completed' as const,
              completedAt: new Date().toISOString(),
              actualMinutes: actualMinutes,
            }
          : s
      )
    );

    // Update time block status
    setLocalTimeBlocks((prev) =>
      prev.map((b) =>
        b.id === endedBlock.id
          ? { ...b, status: 'completed' as const }
          : b
      )
    );

    setCompletedSubtaskIds((prev) => {
      const next = new Set(Array.from(prev));
      next.add(subtaskId);
      return next;
    });

    // Persist to API
    try {
      await Promise.all([
        api.updateSubtask(subtaskId, {
          status: 'completed',
          completedAt: new Date().toISOString(),
          actualMinutes: actualMinutes,
        }),
        api.updateTimeBlock(endedBlock.id, {
          status: 'completed',
        }),
      ]);
    } catch (error) {
      console.error('Failed to mark subtask complete:', error);
      // Rollback optimistic updates
      setLocalSubtasks((prev) =>
        prev.map((s) =>
          s.id === subtaskId
            ? { ...s, status: 'scheduled' as const, completedAt: undefined, actualMinutes: undefined }
            : s
        )
      );
      setLocalTimeBlocks((prev) =>
        prev.map((b) =>
          b.id === endedBlock.id
            ? { ...b, status: 'scheduled' as const }
            : b
        )
      );
      setCompletedSubtaskIds((prev) => {
        const next = new Set(Array.from(prev));
        next.delete(subtaskId);
        return next;
      });
    }
  }, [endedBlockSubtask, endedBlock]);

  // Handler for creating a follow-up task from the boundary modal
  const handleCreateFollowUp = useCallback(async (progressNote: string, remainingWork: string) => {
    if (!endedBlockSubtask || !endedBlock) return;

    const originalSubtaskId = endedBlockSubtask.id;

    // Update the original subtask to partial status with progress note
    const originalUpdate = {
      status: 'completed' as const, // Mark as completed but with progress note
      completedAt: new Date().toISOString(),
      progressNote: progressNote,
    };

    // Optimistic update for original subtask
    setLocalSubtasks((prev) =>
      prev.map((s) =>
        s.id === originalSubtaskId
          ? { ...s, ...originalUpdate }
          : s
      )
    );

    // Update time block to partial
    setLocalTimeBlocks((prev) =>
      prev.map((b) =>
        b.id === endedBlock.id
          ? { ...b, status: 'partial' as const }
          : b
      )
    );

    // Persist original subtask and time block updates, then create follow-up
    try {
      await Promise.all([
        api.updateSubtask(originalSubtaskId, originalUpdate),
        api.updateTimeBlock(endedBlock.id, { status: 'partial' }),
      ]);

      // Create the follow-up subtask
      const followUpSubtask = await api.createSubtask({
        backlogItemId: endedBlockSubtask.backlogItemId,
        title: `[Follow-up] ${remainingWork}`,
        definitionOfDone: `Complete remaining work: ${remainingWork}`,
        estimatedMinutes: endedBlockSubtask.estimatedMinutes, // Same estimate as original
        status: 'estimated',
        parentSubtaskId: originalSubtaskId,
      });

      // Add the follow-up to local state
      setLocalSubtasks((prev) => [...prev, followUpSubtask]);

      // Refresh data to ensure everything is in sync
      await Promise.all([
        refreshSubtasks(),
        refreshTimeBlocks(),
        refreshBacklog(),
      ]);
    } catch (error) {
      console.error('Failed to create follow-up:', error);
      // Rollback optimistic updates
      setLocalSubtasks((prev) =>
        prev.map((s) =>
          s.id === originalSubtaskId
            ? { ...s, status: 'scheduled' as const, completedAt: undefined, progressNote: undefined }
            : s
        )
      );
      setLocalTimeBlocks((prev) =>
        prev.map((b) =>
          b.id === endedBlock.id
            ? { ...b, status: 'scheduled' as const }
            : b
        )
      );
    }
  }, [endedBlockSubtask, endedBlock, refreshSubtasks, refreshTimeBlocks, refreshBacklog]);

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

      {/* Time Block Boundary Modal */}
      {endedBlock && endedBlockSubtask && (
        <TaskBoundaryModal
          isOpen={!!endedBlock}
          onClose={clearEndedBlock}
          block={endedBlock}
          subtask={endedBlockSubtask}
          parentItem={endedBlockParentItem}
          onMarkComplete={handleBoundaryMarkComplete}
          onCreateFollowUp={handleCreateFollowUp}
        />
      )}
    </div>
  );
}
