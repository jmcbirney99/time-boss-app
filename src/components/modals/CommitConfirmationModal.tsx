'use client';

import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import type { BacklogItem } from '@/types';
import { formatDuration } from '@/lib/dateUtils';

interface CommitConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  scheduledMinutes: number;
  scheduledTaskCount: number;
  unscheduledBacklogCount: number;
  topUnscheduledItems: BacklogItem[];
  isLoading: boolean;
}

export function CommitConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  scheduledMinutes,
  scheduledTaskCount,
  unscheduledBacklogCount,
  topUnscheduledItems,
  isLoading,
}: CommitConfirmationModalProps) {
  const remainingCount = unscheduledBacklogCount - topUnscheduledItems.length;

  const handleConfirm = async () => {
    await onConfirm();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Commit Weekly Plan"
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={isLoading}>
            {isLoading ? 'Committing...' : 'Yes, Commit Plan'}
          </Button>
        </>
      }
    >
      <div className="space-y-6">
        {/* What you're committing to */}
        <div className="p-4 bg-sage-50 rounded-lg border border-sage-200">
          <h3 className="text-sm font-medium text-sage-800 mb-1">
            What you&apos;re committing to:
          </h3>
          <p className="text-lg font-semibold text-sage-900">
            {scheduledTaskCount} {scheduledTaskCount === 1 ? 'task' : 'tasks'} &bull; {formatDuration(scheduledMinutes)} scheduled
          </p>
        </div>

        {/* What won't get attention */}
        {unscheduledBacklogCount > 0 && (
          <div className="p-4 bg-stone-50 rounded-lg border border-stone-200">
            <h3 className="text-sm font-medium text-stone-700 mb-2">
              What won&apos;t get attention this week:
            </h3>
            <p className="text-sm text-stone-600 mb-3">
              {unscheduledBacklogCount} backlog {unscheduledBacklogCount === 1 ? 'item' : 'items'}, including:
            </p>
            <ul className="space-y-1.5">
              {topUnscheduledItems.map((item) => (
                <li key={item.id} className="flex items-start gap-2 text-sm text-stone-600">
                  <span className="text-stone-400 mt-0.5">&bull;</span>
                  <span className="line-clamp-1">{item.title}</span>
                </li>
              ))}
            </ul>
            {remainingCount > 0 && (
              <p className="mt-2 text-sm text-stone-500">
                + {remainingCount} more...
              </p>
            )}
          </div>
        )}

        {/* Confirmation question */}
        <div className="text-center pt-2">
          <p className="text-base font-medium text-stone-900">
            Is that okay with you?
          </p>
          <p className="text-sm text-stone-500 mt-1">
            Once committed, you&apos;ll need to &quot;Re-plan&quot; to make changes.
          </p>
        </div>
      </div>
    </Modal>
  );
}
