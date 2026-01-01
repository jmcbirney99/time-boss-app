'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';

import { TopBar } from '@/components/layout/TopBar';
import { BacklogList } from '@/components/backlog/BacklogList';
import { TaskDetailModal } from '@/components/backlog/TaskDetailModal';
import { DraggableSubtask } from '@/components/backlog/BacklogItem';
import { WeekOverview } from '@/components/week/WeekOverview';
import { TimelineOverlay } from '@/components/timeline/TimelineOverlay';
import { DecompositionModal } from '@/components/modals/DecompositionModal';
import { OverflowModal } from '@/components/modals/OverflowModal';
import { CommitConfirmationModal } from '@/components/modals/CommitConfirmationModal';
import { ReplanConfirmationModal } from '@/components/modals/ReplanConfirmationModal';

import { useCapacityCalculation } from '@/hooks/useCapacityCalculation';
import { useModalState } from '@/hooks/useModalState';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useAppData } from '@/hooks/useData';

import { formatDuration, formatWeekRange, getWeekStart, calculateDuration } from '@/lib/dateUtils';
import * as api from '@/lib/api';
import type { BacklogItem, Subtask, TimeBlock, OverflowResolution, TimeEstimate, DayColumn, User, ExternalEvent } from '@/types';

// Default user for capacity calculation when loading
const defaultUser: User = {
  id: 'default',
  name: 'User',
  workHours: { start: '08:00', end: '17:00', days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'] },
  whirlwindPercentage: 0.4,
  estimationMultiplier: 1.0,
};

export default function WeeklyPlanningPage() {
  // Current week
  const weekStart = useMemo(() => {
    const now = new Date();
    return getWeekStart(now);
  }, []);
  const weekStartStr = weekStart.toISOString().split('T')[0];
  const weekEndStr = useMemo(() => {
    const end = new Date(weekStart);
    end.setDate(end.getDate() + 4); // Friday
    return end.toISOString().split('T')[0];
  }, [weekStart]);

  // Fetch all data from API
  const appData = useAppData(weekStartStr, weekEndStr);

  // Local state for optimistic updates
  const [localBacklogItems, setLocalBacklogItems] = useState<BacklogItem[]>([]);
  const [localSubtasks, setLocalSubtasks] = useState<Subtask[]>([]);
  const [localTimeBlocks, setLocalTimeBlocks] = useState<TimeBlock[]>([]);

  // Sync API data to local state
  useEffect(() => {
    if (appData.backlog.backlog.length > 0) {
      setLocalBacklogItems(appData.backlog.backlog);
    }
  }, [appData.backlog.backlog]);

  useEffect(() => {
    if (appData.subtasks.subtasks.length > 0) {
      setLocalSubtasks(appData.subtasks.subtasks);
    }
  }, [appData.subtasks.subtasks]);

  useEffect(() => {
    if (appData.timeBlocks.timeBlocks.length > 0) {
      setLocalTimeBlocks(appData.timeBlocks.timeBlocks);
    }
  }, [appData.timeBlocks.timeBlocks]);

  // Use fetched data or defaults
  const user = appData.user.user || defaultUser;
  const externalEvents = appData.externalEvents.events;
  const backlogItems = localBacklogItems;
  const subtasks = localSubtasks;
  const timeBlocks = localTimeBlocks;

  // Expanded day for timeline view (toggle behavior)
  const [expandedDayId, setExpandedDayId] = useState<string | null>(null);

  // Selected task for detail modal
  const [selectedTask, setSelectedTask] = useState<BacklogItem | null>(null);

  // Mobile detection
  const isMobile = useMediaQuery('(max-width: 767px)');

  // Toggle day expansion
  const handleDayClick = useCallback((dayId: string) => {
    setExpandedDayId((prev) => (prev === dayId ? null : dayId));
  }, []);

  // Dragging state
  const [activeId, setActiveId] = useState<string | null>(null);

  // Get day columns for week overview
  const dayColumns = useMemo(() => getDayColumnsFromData(weekStartStr, externalEvents, timeBlocks, user), [weekStartStr, externalEvents, timeBlocks, user]);

  // Get expanded day data (for mobile overlay)
  const expandedDay = useMemo(() => {
    return dayColumns.find((d) => d.id === expandedDayId) || null;
  }, [dayColumns, expandedDayId]);

  // Get events and blocks for expanded day (for mobile overlay)
  const expandedDayEvents = useMemo(() => {
    if (!expandedDay) return [];
    return externalEvents.filter((e) => e.date === expandedDay.date);
  }, [expandedDay, externalEvents]);

  const expandedDayBlocks = useMemo(() => {
    if (!expandedDay) return [];
    return timeBlocks.filter((b) => b.date === expandedDay.date);
  }, [expandedDay, timeBlocks]);

  // Capacity calculation
  const capacity = useCapacityCalculation(user, externalEvents, timeBlocks, weekStart);

  // Modal state
  const {
    isDecompositionOpen,
    isOverflowOpen,
    isCommitOpen,
    isReplanOpen,
    decompositionData,
    openDecompositionModal,
    openOverflowModal,
    openCommitModal,
    openReplanModal,
    closeModal,
  } = useModalState();

  // Commit/replan loading state
  const [isCommitting, setIsCommitting] = useState(false);

  // Get overflow items for the modal
  const overflowItems = useMemo(() => {
    const overflowSubtasks = subtasks.filter((s) => s.status === 'overflow');
    return overflowSubtasks.map((subtask) => {
      const parent = backlogItems.find((b) => b.id === subtask.backlogItemId);
      return {
        subtask,
        parentTitle: parent?.title || 'Unknown',
      };
    });
  }, [subtasks, backlogItems]);

  // Calculate commit modal data
  const commitModalData = useMemo(() => {
    const scheduledSubtasks = subtasks.filter((s) => s.status === 'scheduled');
    const scheduledMinutes = scheduledSubtasks.reduce((sum, s) => sum + s.estimatedMinutes, 0);
    const scheduledBacklogIds = new Set(scheduledSubtasks.map((s) => s.backlogItemId));
    const unscheduledItems = backlogItems.filter(
      (b) => b.status === 'backlog' || (b.status === 'decomposed' && !scheduledBacklogIds.has(b.id))
    );
    const topUnscheduledItems = [...unscheduledItems]
      .sort((a, b) => a.priorityRank - b.priorityRank)
      .slice(0, 5);

    return {
      scheduledMinutes,
      scheduledTaskCount: scheduledBacklogIds.size,
      unscheduledBacklogCount: unscheduledItems.length,
      topUnscheduledItems,
    };
  }, [subtasks, backlogItems]);

  // Handle commit
  const handleCommit = useCallback(async () => {
    setIsCommitting(true);
    try {
      await appData.weeklyPlan.upsert({
        weekStartDate: weekStartStr,
        status: 'committed',
        committedAt: new Date().toISOString(),
      });
      closeModal();
    } catch (error) {
      console.error('Commit failed:', error);
    } finally {
      setIsCommitting(false);
    }
  }, [appData.weeklyPlan, closeModal, weekStartStr]);

  // Handle replan
  const handleReplan = useCallback(async () => {
    setIsCommitting(true);
    try {
      await appData.weeklyPlan.upsert({
        weekStartDate: weekStartStr,
        status: 'planning',
        committedAt: undefined,
      });
      closeModal();
    } catch (error) {
      console.error('Replan failed:', error);
    } finally {
      setIsCommitting(false);
    }
  }, [appData.weeklyPlan, closeModal, weekStartStr]);

  // Handle scheduling a subtask to a day (system auto-assigns time)
  const handleScheduleToDay = useCallback(
    async (subtaskId: string, dayId: string) => {
      const subtask = subtasks.find((s) => s.id === subtaskId);
      const day = dayColumns.find((d) => d.id === dayId);
      if (!subtask || !day) return;

      // Find a free time slot (simple algorithm: stack tasks from 8am)
      const existingBlocks = timeBlocks.filter((b) => b.date === day.date);
      const dayEvents = externalEvents.filter((e) => e.date === day.date);

      // Find the end time of the last scheduled item
      let startHour = 8;

      // Check existing blocks
      existingBlocks.forEach((block) => {
        const [h, m] = block.endTime.split(':').map(Number);
        const endHour = h + m / 60;
        if (endHour > startHour) {
          startHour = Math.ceil(endHour);
        }
      });

      // Check events
      dayEvents.forEach((event) => {
        const [h, m] = event.endTime.split(':').map(Number);
        const endHour = h + m / 60;
        if (endHour > startHour) {
          startHour = Math.ceil(endHour);
        }
      });

      // Calculate end time based on estimate
      const durationHours = subtask.estimatedMinutes / 60;
      const endHour = startHour + durationHours;

      const formatHour = (h: number) => {
        const hours = Math.floor(h);
        const mins = Math.round((h - hours) * 60);
        return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
      };

      // Optimistic update
      const tempBlockId = `temp-${Date.now()}`;
      const newBlock: TimeBlock = {
        id: tempBlockId,
        subtaskId,
        date: day.date,
        startTime: formatHour(startHour),
        endTime: formatHour(endHour),
        status: 'scheduled',
      };

      setLocalTimeBlocks((prev) => [...prev, newBlock]);
      setLocalSubtasks((prev) =>
        prev.map((s) =>
          s.id === subtaskId
            ? { ...s, status: 'scheduled' as const, scheduledBlockId: tempBlockId }
            : s
        )
      );

      // Auto-expand the day to show the timeline
      setExpandedDayId(dayId);

      // Persist to API
      try {
        const createdBlock = await api.createTimeBlock({
          subtaskId,
          date: day.date,
          startTime: formatHour(startHour),
          endTime: formatHour(endHour),
        });

        // Update with real ID
        setLocalTimeBlocks((prev) =>
          prev.map((b) => (b.id === tempBlockId ? createdBlock : b))
        );
        setLocalSubtasks((prev) =>
          prev.map((s) =>
            s.id === subtaskId
              ? { ...s, scheduledBlockId: createdBlock.id }
              : s
          )
        );
      } catch (error) {
        console.error('Failed to create time block:', error);
        // Rollback optimistic update
        setLocalTimeBlocks((prev) => prev.filter((b) => b.id !== tempBlockId));
        setLocalSubtasks((prev) =>
          prev.map((s) =>
            s.id === subtaskId
              ? { ...s, status: 'estimated' as const, scheduledBlockId: null }
              : s
          )
        );
      }
    },
    [subtasks, dayColumns, timeBlocks, externalEvents]
  );

  // DnD Sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Drag handlers
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    // Block modifications when committed
    if (appData.weeklyPlan.weeklyPlan?.status === 'committed') {
      console.log('Plan is committed. Re-plan to make changes.');
      return;
    }

    const subtaskId = active.id as string;
    const targetId = over.id as string;

    // If dropped on a day card, schedule to that day
    if (['mon', 'tue', 'wed', 'thu', 'fri'].includes(targetId)) {
      handleScheduleToDay(subtaskId, targetId);
    }
  };

  // Handle decomposition save
  const handleDecompositionSave = useCallback(
    async (
      newSubtasks: Array<{
        id: string;
        title: string;
        estimatedMinutes: TimeEstimate;
        definitionOfDone: string;
        rationale?: string;
        llmGenerated?: boolean;
      }>
    ) => {
      if (!decompositionData) return;

      const backlogItemId = decompositionData.backlogItemId;

      // Create new subtasks via API
      const createdSubtasks: Subtask[] = [];
      for (const s of newSubtasks) {
        try {
          const created = await api.createSubtask({
            backlogItemId,
            title: s.title,
            estimatedMinutes: s.estimatedMinutes,
            definitionOfDone: s.definitionOfDone,
            llmGenerated: s.llmGenerated ?? false,
            llmRationale: s.rationale,
          });
          createdSubtasks.push(created);
        } catch (error) {
          console.error('Failed to create subtask:', error);
        }
      }

      // Update local state
      setLocalSubtasks((prev) => [
        ...prev.filter((s) => s.backlogItemId !== backlogItemId),
        ...createdSubtasks,
      ]);

      // Update backlog item status
      try {
        await api.updateBacklogItem(backlogItemId, { status: 'decomposed' });
        setLocalBacklogItems((prev) =>
          prev.map((item) =>
            item.id === backlogItemId
              ? {
                  ...item,
                  status: 'decomposed' as const,
                  subtaskIds: createdSubtasks.map((s) => s.id),
                }
              : item
          )
        );
      } catch (error) {
        console.error('Failed to update backlog item:', error);
      }
    },
    [decompositionData]
  );

  // Handle overflow resolution
  const handleOverflowResolve = useCallback(
    async (resolutions: Map<string, OverflowResolution>) => {
      for (const [subtaskId, resolution] of Array.from(resolutions.entries())) {
        try {
          switch (resolution) {
            case 'backlog':
              await api.updateSubtask(subtaskId, { status: 'estimated' });
              setLocalSubtasks((prev) =>
                prev.map((s) => (s.id === subtaskId ? { ...s, status: 'estimated' as const } : s))
              );
              break;
            case 'delete':
              await api.deleteSubtask(subtaskId);
              setLocalSubtasks((prev) => prev.filter((s) => s.id !== subtaskId));
              break;
            case 'reschedule':
            case 'reduce':
              await api.updateSubtask(subtaskId, { status: 'estimated' });
              setLocalSubtasks((prev) =>
                prev.map((s) => (s.id === subtaskId ? { ...s, status: 'estimated' as const } : s))
              );
              break;
          }
        } catch (error) {
          console.error('Failed to resolve overflow:', error);
        }
      }
    },
    []
  );

  // Get the active subtask for drag overlay
  const activeSubtask = activeId ? subtasks.find((s) => s.id === activeId) : null;
  const activeParent = activeSubtask
    ? backlogItems.find((b) => b.id === activeSubtask.backlogItemId)
    : null;

  // Get backlog item for decomposition modal
  const decompositionBacklogItem = decompositionData
    ? backlogItems.find((b) => b.id === decompositionData.backlogItemId) || null
    : null;
  const decompositionSubtasks = decompositionData
    ? subtasks.filter((s) => s.backlogItemId === decompositionData.backlogItemId)
    : [];

  // Update day columns with current scheduled minutes
  const updatedDayColumns: DayColumn[] = useMemo(() => {
    return dayColumns.map((day) => {
      const dayBlocks = timeBlocks.filter((b) => b.date === day.date);
      const scheduledMinutes = dayBlocks.reduce((sum, block) => {
        const [startH, startM] = block.startTime.split(':').map(Number);
        const [endH, endM] = block.endTime.split(':').map(Number);
        return sum + (endH * 60 + endM) - (startH * 60 + startM);
      }, 0);
      return {
        ...day,
        scheduledMinutes,
        taskCount: dayBlocks.length,
      };
    });
  }, [dayColumns, timeBlocks]);

  // Get updated expanded day for overlay
  const updatedExpandedDay = useMemo(() => {
    return updatedDayColumns.find((d) => d.id === expandedDayId) || null;
  }, [updatedDayColumns, expandedDayId]);

  // Loading state
  if (appData.loading && backlogItems.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sage-600 mx-auto mb-4"></div>
          <p className="text-stone-500">Loading your week...</p>
        </div>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="min-h-screen flex flex-col bg-paper">
        <TopBar
          weekDateRange={formatWeekRange(weekStart)}
          totalCapacity={formatDuration(capacity.availableMinutes)}
          scheduled={formatDuration(capacity.scheduledMinutes)}
          remaining={formatDuration(capacity.remainingMinutes)}
          isOverCapacity={capacity.isOverCapacity}
          overflowMinutes={capacity.overflowMinutes}
          onReviewOverflow={
            overflowItems.length > 0
              ? () => openOverflowModal(overflowItems.map((o) => o.subtask.id))
              : undefined
          }
          planStatus={appData.weeklyPlan.weeklyPlan?.status ?? 'planning'}
          onCommitClick={openCommitModal}
          onReplanClick={openReplanModal}
          isMobile={isMobile}
        />

        {/* Responsive layout - stacked on mobile, 2-column on desktop */}
        <div className="flex-1 p-4 md:p-6 overflow-hidden">
          <div className={`h-[calc(100vh-140px)] ${
            isMobile
              ? 'flex flex-col gap-4'
              : 'grid grid-cols-[300px_1fr] gap-6'
          }`}>
            {/* Column 1: Backlog - collapsible on mobile */}
            <div className={`flex flex-col min-h-0 ${isMobile ? 'max-h-[40vh]' : ''}`}>
              <BacklogList
                backlogItems={backlogItems}
                subtasks={subtasks}
                onDecomposeClick={openDecompositionModal}
                onAddItem={async (title) => {
                  await appData.backlog.create({ title });
                }}
                onItemClick={(item) => setSelectedTask(item)}
              />
            </div>

            {/* Column 2: Week Overview with inline drawers */}
            <div className={`overflow-hidden ${isMobile ? 'flex-1 min-h-0' : ''}`}>
              <WeekOverview
                days={updatedDayColumns}
                expandedDayId={expandedDayId}
                onDayClick={handleDayClick}
                timelineBlocks={timeBlocks}
                timelineEvents={externalEvents}
                subtasks={subtasks}
                isMobile={isMobile}
              />
            </div>
          </div>
        </div>

        {/* Mobile: Timeline Overlay */}
        <TimelineOverlay
          isOpen={isMobile && expandedDayId !== null}
          day={updatedExpandedDay}
          blocks={expandedDayBlocks}
          events={expandedDayEvents}
          subtasks={subtasks}
          onClose={() => setExpandedDayId(null)}
        />

        {/* Drag Overlay */}
        <DragOverlay dropAnimation={null}>
          {activeSubtask && activeParent ? (
            <div className="opacity-90 rotate-2 scale-105">
              <DraggableSubtask
                subtask={activeSubtask}
                parentTitle={activeParent.title}
                isDragging
              />
            </div>
          ) : null}
        </DragOverlay>

        {/* Modals */}
        <DecompositionModal
          isOpen={isDecompositionOpen}
          onClose={closeModal}
          backlogItem={decompositionBacklogItem}
          existingSubtasks={decompositionSubtasks}
          onSave={handleDecompositionSave}
        />

        <OverflowModal
          isOpen={isOverflowOpen}
          onClose={closeModal}
          overflowMinutes={capacity.overflowMinutes}
          overflowItems={overflowItems}
          onResolve={handleOverflowResolve}
        />

        <CommitConfirmationModal
          isOpen={isCommitOpen}
          onClose={closeModal}
          onConfirm={handleCommit}
          scheduledMinutes={commitModalData.scheduledMinutes}
          scheduledTaskCount={commitModalData.scheduledTaskCount}
          unscheduledBacklogCount={commitModalData.unscheduledBacklogCount}
          topUnscheduledItems={commitModalData.topUnscheduledItems}
          isLoading={isCommitting}
        />

        <ReplanConfirmationModal
          isOpen={isReplanOpen}
          onClose={closeModal}
          onConfirm={handleReplan}
          isLoading={isCommitting}
        />

        <TaskDetailModal
          isOpen={selectedTask !== null}
          onClose={() => setSelectedTask(null)}
          task={selectedTask}
          categories={appData.categories.categories || []}
          subtasks={subtasks}
          onDelete={async (taskId) => {
            await appData.backlog.remove(taskId);
          }}
          onDecompose={(taskId) => {
            openDecompositionModal(taskId);
          }}
        />
      </div>
    </DndContext>
  );
}

// Helper function to generate day columns from data
function getDayColumnsFromData(
  weekStartDate: string,
  externalEvents: ExternalEvent[],
  timeBlocks: TimeBlock[],
  user: User
): DayColumn[] {
  const weekStart = new Date(weekStartDate);
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  const dayIds = ['mon', 'tue', 'wed', 'thu', 'fri'];
  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  return dayIds.map((id, index) => {
    const date = new Date(weekStart);
    date.setDate(date.getDate() + index);
    const dateStr = date.toISOString().split('T')[0];

    const dayEvents = externalEvents.filter(e => e.date === dateStr);
    const dayBlocks = timeBlocks.filter(b => b.date === dateStr);

    const externalMinutes = dayEvents.reduce((sum, event) => {
      return sum + calculateDuration(event.startTime, event.endTime);
    }, 0);

    const scheduledMinutes = dayBlocks.reduce((sum, block) => {
      return sum + calculateDuration(block.startTime, block.endTime);
    }, 0);

    const totalWorkMinutes = 9 * 60;
    const afterExternals = totalWorkMinutes - externalMinutes;
    const whirlwindMinutes = Math.round(afterExternals * user.whirlwindPercentage);
    const capacity = afterExternals - whirlwindMinutes;

    const shortDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    return {
      id,
      dayName: dayNames[index],
      date: dateStr,
      shortDate,
      capacity,
      scheduledMinutes,
      taskCount: dayBlocks.length,
      isToday: dateStr === todayStr,
    };
  });
}
