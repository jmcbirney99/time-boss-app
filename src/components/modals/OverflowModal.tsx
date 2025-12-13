'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import type { Subtask, OverflowResolution } from '@/types';
import { formatDuration } from '@/lib/dateUtils';

interface OverflowItemData {
  subtask: Subtask;
  parentTitle: string;
}

interface OverflowModalProps {
  isOpen: boolean;
  onClose: () => void;
  overflowMinutes: number;
  overflowItems: OverflowItemData[];
  onResolve: (resolutions: Map<string, OverflowResolution>) => void;
}

export function OverflowModal({
  isOpen,
  onClose,
  overflowMinutes,
  overflowItems,
  onResolve,
}: OverflowModalProps) {
  const [resolutions, setResolutions] = useState<Map<string, OverflowResolution>>(new Map());

  const handleResolutionChange = (subtaskId: string, resolution: OverflowResolution) => {
    setResolutions((prev) => {
      const next = new Map(prev);
      next.set(subtaskId, resolution);
      return next;
    });
  };

  const handleResolve = () => {
    onResolve(resolutions);
    onClose();
    setResolutions(new Map());
  };

  const allResolved = overflowItems.every((item) => resolutions.has(item.subtask.id));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Resolve Overflow"
      size="xl"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleResolve} disabled={!allResolved}>
            Resolve & Commit Plan
          </Button>
        </>
      }
    >
      {/* Warning header */}
      <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            <svg
              className="w-6 h-6 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-red-800">
              You&apos;re over capacity by {formatDuration(overflowMinutes)}
            </h3>
            <p className="text-sm text-red-700 mt-1">
              Choose how to handle each overflow item to commit your plan.
            </p>
          </div>
        </div>
      </div>

      {/* Overflow items */}
      <div className="space-y-4">
        {overflowItems.map((item) => (
          <OverflowItemRow
            key={item.subtask.id}
            item={item}
            selectedResolution={resolutions.get(item.subtask.id)}
            onResolutionChange={(resolution) =>
              handleResolutionChange(item.subtask.id, resolution)
            }
          />
        ))}
      </div>

      {/* Progress indicator */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">
            {resolutions.size} of {overflowItems.length} resolved
          </span>
          {!allResolved && (
            <span className="text-yellow-600">
              Resolve all items to commit your plan
            </span>
          )}
        </div>
      </div>
    </Modal>
  );
}

interface OverflowItemRowProps {
  item: OverflowItemData;
  selectedResolution?: OverflowResolution;
  onResolutionChange: (resolution: OverflowResolution) => void;
}

function OverflowItemRow({
  item,
  selectedResolution,
  onResolutionChange,
}: OverflowItemRowProps) {
  const resolutionOptions: { value: OverflowResolution; label: string; description: string }[] = [
    {
      value: 'reschedule',
      label: 'Reschedule to next week',
      description: 'Move to next week&apos;s plan',
    },
    {
      value: 'backlog',
      label: 'Move back to backlog',
      description: 'Return to backlog for later',
    },
    {
      value: 'reduce',
      label: 'Reduce estimate',
      description: 'Make it fit by reducing scope',
    },
    {
      value: 'delete',
      label: 'Delete',
      description: 'Remove this subtask entirely',
    },
  ];

  return (
    <div className="p-4 bg-gray-50 rounded-lg">
      {/* Task info */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-medium text-gray-900">{item.subtask.title}</h4>
          <p className="text-sm text-gray-500">{item.parentTitle}</p>
        </div>
        <Badge variant="count">{formatDuration(item.subtask.estimatedMinutes)}</Badge>
      </div>

      {/* Resolution options */}
      <div className="grid grid-cols-2 gap-2">
        {resolutionOptions.map((option) => (
          <label
            key={option.value}
            className={`
              flex items-center gap-2 p-2 rounded-lg cursor-pointer border transition-colors
              ${
                selectedResolution === option.value
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }
            `}
          >
            <input
              type="radio"
              name={`resolution-${item.subtask.id}`}
              value={option.value}
              checked={selectedResolution === option.value}
              onChange={() => onResolutionChange(option.value)}
              className="text-blue-500 focus:ring-blue-500"
            />
            <div>
              <div className="text-sm font-medium text-gray-900">{option.label}</div>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}
