'use client';

import { useState, useCallback } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { VoiceInput } from '@/components/VoiceInput';
import type { TimeBlock, Subtask, BacklogItem } from '@/types';
import { formatDuration, formatTimeRange } from '@/lib/dateUtils';
import { TIME_ESTIMATES } from '@/lib/constants';

type ModalStep = 'initial' | 'done' | 'need-more-time';

interface TaskBoundaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  block: TimeBlock;
  subtask: Subtask;
  parentItem: BacklogItem | undefined;
  onMarkComplete: (actualMinutes?: number) => void;
  onCreateFollowUp: (progressNote: string, remainingWork: string) => void;
}

export function TaskBoundaryModal({
  isOpen,
  onClose,
  block,
  subtask,
  parentItem,
  onMarkComplete,
  onCreateFollowUp,
}: TaskBoundaryModalProps) {
  const [step, setStep] = useState<ModalStep>('initial');
  const [actualMinutes, setActualMinutes] = useState<number | undefined>(undefined);
  const [progressNote, setProgressNote] = useState('');
  const [remainingWork, setRemainingWork] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleReset = useCallback(() => {
    setStep('initial');
    setActualMinutes(undefined);
    setProgressNote('');
    setRemainingWork('');
    setIsSubmitting(false);
  }, []);

  const handleClose = useCallback(() => {
    handleReset();
    onClose();
  }, [handleReset, onClose]);

  const handleDone = useCallback(() => {
    setStep('done');
  }, []);

  const handleNeedMoreTime = useCallback(() => {
    setStep('need-more-time');
  }, []);

  const handleSubmitDone = useCallback(async () => {
    setIsSubmitting(true);
    try {
      await onMarkComplete(actualMinutes);
      handleClose();
    } catch (error) {
      console.error('Failed to mark complete:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [actualMinutes, onMarkComplete, handleClose]);

  const handleSubmitFollowUp = useCallback(async () => {
    if (!progressNote.trim() || !remainingWork.trim()) return;

    setIsSubmitting(true);
    try {
      await onCreateFollowUp(progressNote.trim(), remainingWork.trim());
      handleClose();
    } catch (error) {
      console.error('Failed to create follow-up:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [progressNote, remainingWork, onCreateFollowUp, handleClose]);

  const handleBack = useCallback(() => {
    setStep('initial');
  }, []);

  // Calculate block duration
  const blockDuration = subtask.estimatedMinutes;
  const timeRange = formatTimeRange(block.startTime, block.endTime);

  const renderInitialStep = () => (
    <div className="space-y-6">
      <div className="text-center py-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 mb-4">
          <ClockIcon className="w-8 h-8 text-amber-600" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Time&apos;s up!
        </h3>
        <p className="text-sm text-gray-600">
          Your time block for <span className="font-medium">&quot;{subtask.title}&quot;</span> has ended.
        </p>
        <p className="text-xs text-gray-400 mt-1">
          {timeRange} ({formatDuration(blockDuration)})
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <Button
          onClick={handleDone}
          className="w-full justify-center"
        >
          <CheckIcon className="w-5 h-5 mr-2" />
          Done - Task Complete
        </Button>
        <Button
          variant="secondary"
          onClick={handleNeedMoreTime}
          className="w-full justify-center"
        >
          <ClockPlusIcon className="w-5 h-5 mr-2" />
          Need More Time
        </Button>
      </div>
    </div>
  );

  const renderDoneStep = () => (
    <div className="space-y-6">
      <div className="pb-4 border-b border-gray-200">
        <button
          onClick={handleBack}
          className="flex items-center text-sm text-gray-500 hover:text-gray-700 mb-3"
        >
          <ChevronLeftIcon className="w-4 h-4 mr-1" />
          Back
        </button>
        <h3 className="font-medium text-gray-900">{subtask.title}</h3>
        {parentItem && (
          <p className="text-sm text-gray-500 mt-1">{parentItem.title}</p>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            How long did it actually take?
          </label>
          <p className="text-xs text-gray-500 mb-3">
            Estimated: {formatDuration(subtask.estimatedMinutes)}
          </p>
          <div className="grid grid-cols-3 gap-2">
            {TIME_ESTIMATES.map((option) => (
              <button
                key={option.value}
                onClick={() => setActualMinutes(option.value)}
                className={`
                  py-2 px-3 rounded-lg text-sm font-medium border transition-colors
                  ${
                    actualMinutes === option.value
                      ? 'border-sage-500 bg-sage-50 text-sage-700'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="pt-4">
          <Button
            onClick={handleSubmitDone}
            disabled={isSubmitting}
            className="w-full justify-center"
          >
            {isSubmitting ? 'Saving...' : 'Mark as Complete'}
          </Button>
          <button
            onClick={handleSubmitDone}
            disabled={isSubmitting}
            className="w-full mt-2 text-sm text-gray-500 hover:text-gray-700"
          >
            Skip time tracking
          </button>
        </div>
      </div>
    </div>
  );

  const renderNeedMoreTimeStep = () => (
    <div className="space-y-6">
      <div className="pb-4 border-b border-gray-200">
        <button
          onClick={handleBack}
          className="flex items-center text-sm text-gray-500 hover:text-gray-700 mb-3"
        >
          <ChevronLeftIcon className="w-4 h-4 mr-1" />
          Back
        </button>
        <h3 className="font-medium text-gray-900">{subtask.title}</h3>
        {parentItem && (
          <p className="text-sm text-gray-500 mt-1">{parentItem.title}</p>
        )}
      </div>

      <div className="space-y-4">
        <VoiceInput
          label="What did you accomplish?"
          placeholder="Describe the progress you made..."
          value={progressNote}
          onTranscript={setProgressNote}
        />

        <VoiceInput
          label="What still needs to be done?"
          placeholder="Describe the remaining work..."
          value={remainingWork}
          onTranscript={setRemainingWork}
        />

        <div className="pt-4">
          <Button
            onClick={handleSubmitFollowUp}
            disabled={isSubmitting || !progressNote.trim() || !remainingWork.trim()}
            className="w-full justify-center"
          >
            {isSubmitting ? 'Creating...' : 'Create Follow-up Task'}
          </Button>
          <p className="text-xs text-gray-500 text-center mt-2">
            This will mark the current task as partial and create a new subtask for the remaining work.
          </p>
        </div>
      </div>
    </div>
  );

  const getTitle = () => {
    switch (step) {
      case 'done':
        return 'Task Complete';
      case 'need-more-time':
        return 'Create Follow-up';
      default:
        return 'Time Block Ended';
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={getTitle()}
      size="md"
    >
      {step === 'initial' && renderInitialStep()}
      {step === 'done' && renderDoneStep()}
      {step === 'need-more-time' && renderNeedMoreTimeStep()}
    </Modal>
  );
}

// Icon components
function ClockIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

function CheckIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5 13l4 4L19 7"
      />
    </svg>
  );
}

function ClockPlusIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 12h3m-1.5-1.5v3"
      />
    </svg>
  );
}

function ChevronLeftIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 19l-7-7 7-7"
      />
    </svg>
  );
}
