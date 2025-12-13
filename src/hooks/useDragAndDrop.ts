import { useState, useCallback } from 'react';
import type { DragEndEvent, DragStartEvent, DragOverEvent } from '@dnd-kit/core';

interface DragState {
  activeId: string | null;
  activeType: 'subtask' | null;
  overId: string | null;
}

interface UseDragAndDropReturn {
  dragState: DragState;
  handleDragStart: (event: DragStartEvent) => void;
  handleDragOver: (event: DragOverEvent) => void;
  handleDragEnd: (event: DragEndEvent) => void;
  handleDragCancel: () => void;
}

interface UseDragAndDropProps {
  onScheduleSubtask: (subtaskId: string, dayIndex: number, hour: number) => void;
  onUnscheduleSubtask?: (subtaskId: string) => void;
}

export function useDragAndDrop({
  onScheduleSubtask,
  onUnscheduleSubtask,
}: UseDragAndDropProps): UseDragAndDropReturn {
  const [dragState, setDragState] = useState<DragState>({
    activeId: null,
    activeType: null,
    overId: null,
  });

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    const type = active.data.current?.type as 'subtask' | undefined;

    setDragState({
      activeId: String(active.id),
      activeType: type || null,
      overId: null,
    });
  }, []);

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { over } = event;
    setDragState((prev) => ({
      ...prev,
      overId: over ? String(over.id) : null,
    }));
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      // Reset drag state first
      setDragState({ activeId: null, activeType: null, overId: null });

      if (!over) return;

      const activeType = active.data.current?.type;
      const overType = over.data.current?.type;

      // Subtask dropped on time slot
      if (activeType === 'subtask' && overType === 'timeslot') {
        const { dayIndex, hour } = over.data.current as { dayIndex: number; hour: number };
        onScheduleSubtask(String(active.id), dayIndex, hour);
      }

      // Block dropped back to backlog (unschedule)
      if (activeType === 'subtask' && overType === 'backlog' && onUnscheduleSubtask) {
        onUnscheduleSubtask(String(active.id));
      }
    },
    [onScheduleSubtask, onUnscheduleSubtask]
  );

  const handleDragCancel = useCallback(() => {
    setDragState({ activeId: null, activeType: null, overId: null });
  }, []);

  return {
    dragState,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDragCancel,
  };
}
