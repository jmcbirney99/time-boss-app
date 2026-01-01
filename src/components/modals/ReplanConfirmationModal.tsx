'use client';

import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

interface ReplanConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isLoading: boolean;
}

export function ReplanConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
}: ReplanConfirmationModalProps) {
  const handleConfirm = async () => {
    await onConfirm();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Re-plan Week?"
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={isLoading}>
            {isLoading ? 'Re-planning...' : 'Yes, Re-plan'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <p className="text-stone-600">
          This will unlock your weekly plan for modifications.
        </p>
        <p className="text-stone-600">
          You&apos;ll need to commit again when you&apos;re done.
        </p>
      </div>
    </Modal>
  );
}
