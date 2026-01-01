'use client';

import { useRef, useState, useEffect } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { BacklogItem, DraggableSubtask } from './BacklogItem';
import { QuickAddInput } from './QuickAddInput';
import type { BacklogItem as BacklogItemType, Subtask } from '@/types';

interface BacklogListProps {
  backlogItems: BacklogItemType[];
  subtasks: Subtask[];
  onDecomposeClick: (backlogItemId: string) => void;
  onAddItem: (title: string) => Promise<void>;
  onItemClick?: (item: BacklogItemType) => void;
}

export function BacklogList({ backlogItems, subtasks, onDecomposeClick, onAddItem, onItemClick }: BacklogListProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: 'backlog-drop-zone',
    data: { type: 'backlog' },
  });

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showBottomShadow, setShowBottomShadow] = useState(false);
  const [showTopShadow, setShowTopShadow] = useState(false);

  // Check scroll position to show/hide shadows
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      setShowTopShadow(scrollTop > 0);
      setShowBottomShadow(scrollTop + clientHeight < scrollHeight - 1);
    };

    // Initial check
    handleScroll();

    container.addEventListener('scroll', handleScroll);
    // Also check on resize
    const observer = new ResizeObserver(handleScroll);
    observer.observe(container);

    return () => {
      container.removeEventListener('scroll', handleScroll);
      observer.disconnect();
    };
  }, [backlogItems, subtasks]);

  // Get subtasks by parent backlog item
  const getSubtasksForItem = (itemId: string) => {
    return subtasks.filter((s) => s.backlogItemId === itemId);
  };

  // Get unscheduled subtasks (estimated status, not scheduled)
  const getUnscheduledSubtasks = (itemId: string) => {
    return subtasks.filter(
      (s) => s.backlogItemId === itemId && (s.status === 'estimated' || s.status === 'overflow')
    );
  };

  // Separate decomposed vs raw items
  const decomposedItems = backlogItems.filter((item) => item.status === 'decomposed');
  const rawItems = backlogItems.filter((item) => item.status === 'backlog');

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col h-full ${isOver ? 'bg-blue-50' : ''}`}
    >
      {/* Fixed header */}
      <div className="flex items-center justify-between p-4 pb-2 flex-shrink-0">
        <h2 className="text-lg font-semibold text-gray-900">Backlog</h2>
        <span className="text-sm text-gray-500">
          {backlogItems.length} item{backlogItems.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Scrollable content area with visible scrollbar */}
      <div className="relative flex-1 min-h-0">
        {/* Top shadow gradient */}
        {showTopShadow && (
          <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-gray-100 to-transparent z-10 pointer-events-none" />
        )}

        <div
          ref={scrollContainerRef}
          className="h-full overflow-y-auto px-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400"
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: '#d1d5db transparent',
          }}
        >
          {/* Unscheduled subtasks ready to be scheduled */}
          {decomposedItems.length > 0 && (
            <div className="mb-6">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Ready to Schedule
              </h3>
              <div className="space-y-2">
                {decomposedItems.map((item) => {
                  const unscheduledSubtasks = getUnscheduledSubtasks(item.id);
                  return unscheduledSubtasks.map((subtask) => (
                    <DraggableSubtask
                      key={subtask.id}
                      subtask={subtask}
                      parentTitle={item.title}
                    />
                  ));
                })}
              </div>
            </div>
          )}

          {/* Decomposed parent items */}
          {decomposedItems.length > 0 && (
            <div className="mb-6">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                In Progress
              </h3>
              <div className="space-y-2">
                {decomposedItems.map((item) => (
                  <BacklogItem
                    key={item.id}
                    item={item}
                    subtaskCount={getSubtasksForItem(item.id).length}
                    onDecomposeClick={() => onDecomposeClick(item.id)}
                    onClick={() => onItemClick?.(item)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Raw backlog items */}
          {rawItems.length > 0 && (
            <div className="pb-2">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Needs Breakdown
              </h3>
              <div className="space-y-2">
                {rawItems.map((item) => (
                  <BacklogItem
                    key={item.id}
                    item={item}
                    subtaskCount={0}
                    onDecomposeClick={() => onDecomposeClick(item.id)}
                    onClick={() => onItemClick?.(item)}
                  />
                ))}
              </div>
            </div>
          )}

          {backlogItems.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p className="text-sm">No items in backlog</p>
            </div>
          )}
        </div>

        {/* Bottom shadow gradient */}
        {showBottomShadow && (
          <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-white to-transparent z-10 pointer-events-none" />
        )}
      </div>

      {/* Fixed QuickAddInput at bottom */}
      <div className="flex-shrink-0 p-4 pt-2 border-t border-gray-100">
        <QuickAddInput onAdd={onAddItem} />
      </div>
    </div>
  );
}
