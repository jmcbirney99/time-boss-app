'use client';

import { useState, useMemo, useCallback } from 'react';
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
import { DraggableSubtask } from '@/components/backlog/BacklogItem';
import { WeekOverview } from '@/components/week/WeekOverview';
import { TimelineOverlay } from '@/components/timeline/TimelineOverlay';
import { DecompositionModal } from '@/components/modals/DecompositionModal';
import { OverflowModal } from '@/components/modals/OverflowModal';

import { useCapacityCalculation } from '@/hooks/useCapacityCalculation';
import { useModalState } from '@/hooks/useModalState';
import { useMediaQuery } from '@/hooks/useMediaQuery';

import {
  getUser,
  getBacklogItems,
  getSubtasks,
  getTimeBlocks,
  getExternalEvents,
  getDayColumns,
} from '@/data/mockData';

import { formatDuration, formatWeekRange } from '@/lib/dateUtils';
import type { BacklogItem, Subtask, TimeBlock, OverflowResolution, TimeEstimate, DayColumn } from '@/types';

export default function WeeklyPlanningPage() {
  // Load initial mock data
  const user = getUser();
  const [backlogItems, setBacklogItems] = useState<BacklogItem[]>(getBacklogItems());
  const [subtasks, setSubtasks] = useState<Subtask[]>(getSubtasks());
  const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>(getTimeBlocks());
  const externalEvents = getExternalEvents();

  // Current week (fixed for prototype to match mock data)
  const weekStart = useMemo(() => new Date('2025-12-09'), []);
  const weekStartStr = '2025-12-09';

  // Expanded day for timeline view (toggle behavior)
  const [expandedDayId, setExpandedDayId] = useState<string | null>(null);

  // Mobile detection
  const isMobile = useMediaQuery('(max-width: 767px)');

  // Toggle day expansion
  const handleDayClick = useCallback((dayId: string) => {
    setExpandedDayId((prev) => (prev === dayId ? null : dayId));
  }, []);

  // Dragging state
  const [activeId, setActiveId] = useState<string | null>(null);

  // Get day columns for week overview
  const dayColumns = useMemo(() => getDayColumns(weekStartStr), []);

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
    decompositionData,
    openDecompositionModal,
    openOverflowModal,
    closeModal,
  } = useModalState();

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

  // Handle scheduling a subtask to a day (system auto-assigns time)
  const handleScheduleToDay = useCallback(
    (subtaskId: string, dayId: string) => {
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

      // Create new time block
      const newBlock: TimeBlock = {
        id: `block-${Date.now()}`,
        subtaskId,
        date: day.date,
        startTime: formatHour(startHour),
        endTime: formatHour(endHour),
        status: 'scheduled',
      };

      // Update time blocks
      setTimeBlocks((prev) => [...prev, newBlock]);

      // Update subtask status
      setSubtasks((prev) =>
        prev.map((s) =>
          s.id === subtaskId
            ? { ...s, status: 'scheduled' as const, scheduledBlockId: newBlock.id }
            : s
        )
      );

      // Auto-expand the day to show the timeline
      setExpandedDayId(dayId);

      console.log(`Scheduled subtask ${subtaskId} to ${day.dayName}`);
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

    const subtaskId = active.id as string;
    const targetId = over.id as string;

    // If dropped on a day card, schedule to that day
    if (['mon', 'tue', 'wed', 'thu', 'fri'].includes(targetId)) {
      handleScheduleToDay(subtaskId, targetId);
    }
  };

  // Handle decomposition save
  const handleDecompositionSave = useCallback(
    (
      newSubtasks: Array<{
        id: string;
        title: string;
        estimatedMinutes: TimeEstimate;
        definitionOfDone: string;
      }>
    ) => {
      if (!decompositionData) return;

      const backlogItemId = decompositionData.backlogItemId;

      // Create new subtasks
      const createdSubtasks: Subtask[] = newSubtasks.map((s, index) => ({
        id: s.id.startsWith('new-') ? `subtask-${Date.now()}-${index}` : s.id,
        backlogItemId,
        title: s.title,
        definitionOfDone: s.definitionOfDone,
        estimatedMinutes: s.estimatedMinutes,
        status: 'estimated' as const,
        scheduledBlockId: null,
      }));

      // Remove old subtasks for this item and add new ones
      setSubtasks((prev) => [
        ...prev.filter((s) => s.backlogItemId !== backlogItemId),
        ...createdSubtasks,
      ]);

      // Update backlog item status
      setBacklogItems((prev) =>
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
    },
    [decompositionData]
  );

  // Handle overflow resolution
  const handleOverflowResolve = useCallback(
    (resolutions: Map<string, OverflowResolution>) => {
      resolutions.forEach((resolution, subtaskId) => {
        switch (resolution) {
          case 'backlog':
            setSubtasks((prev) =>
              prev.map((s) => (s.id === subtaskId ? { ...s, status: 'estimated' as const } : s))
            );
            break;
          case 'delete':
            setSubtasks((prev) => prev.filter((s) => s.id !== subtaskId));
            break;
          case 'reschedule':
          case 'reduce':
            setSubtasks((prev) =>
              prev.map((s) => (s.id === subtaskId ? { ...s, status: 'estimated' as const } : s))
            );
            break;
        }
      });
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
        />

        {/* 2-column responsive layout */}
        <div className="flex-1 p-4 md:p-6">
          <div className="grid grid-cols-[minmax(100px,25%)_1fr] md:grid-cols-[300px_1fr] gap-4 md:gap-6 h-[calc(100vh-140px)]">
            {/* Column 1: Backlog */}
            <div className="overflow-hidden">
              <BacklogList
                backlogItems={backlogItems}
                subtasks={subtasks}
                onDecomposeClick={openDecompositionModal}
              />
            </div>

            {/* Column 2: Week Overview with inline drawers */}
            <div className="overflow-hidden">
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
      </div>
    </DndContext>
  );
}
