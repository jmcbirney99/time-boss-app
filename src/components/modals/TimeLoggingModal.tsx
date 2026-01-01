'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import type { Subtask, TimeBlock } from '@/types';
import { formatDuration } from '@/lib/dateUtils';

interface TimeLoggingModalProps {
  subtask: Subtask | null;
  timeBlock: TimeBlock | null;
  isOpen: boolean;
  onClose: () => void;
  onLogTime: (actualMinutes: number) => void;
}

export function TimeLoggingModal({
  subtask,
  timeBlock,
  isOpen,
  onClose,
  onLogTime,
}: TimeLoggingModalProps) {
  const [customMinutes, setCustomMinutes] = useState<string>('');
  const [selectedOption, setSelectedOption] = useState<'estimated' | 'more' | 'less' | 'custom' | null>(null);

  if (!subtask) return null;

  const estimatedMinutes = subtask.estimatedMinutes;
  const moreMinutes = Math.round(estimatedMinutes * 1.25);
  const lessMinutes = Math.round(estimatedMinutes * 0.75);

  const handleQuickSelect = (option: 'estimated' | 'more' | 'less') => {
    setSelectedOption(option);
    setCustomMinutes('');
  };

  const handleCustomChange = (value: string) => {
    // Only allow numeric input
    if (value === '' || /^\d+$/.test(value)) {
      setCustomMinutes(value);
      setSelectedOption('custom');
    }
  };

  const getSelectedMinutes = (): number => {
    switch (selectedOption) {
      case 'estimated':
        return estimatedMinutes;
      case 'more':
        return moreMinutes;
      case 'less':
        return lessMinutes;
      case 'custom':
        return parseInt(customMinutes, 10) || 0;
      default:
        return 0;
    }
  };

  const handleSubmit = () => {
    const minutes = getSelectedMinutes();
    if (minutes > 0) {
      onLogTime(minutes);
      // Reset state for next use
      setCustomMinutes('');
      setSelectedOption(null);
    }
  };

  const handleClose = () => {
    setCustomMinutes('');
    setSelectedOption(null);
    onClose();
  };

  const isValid = selectedOption && getSelectedMinutes() > 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="How long did this take?"
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!isValid}>
            Log Time
          </Button>
        </>
      }
    >
      {/* Task info */}
      <div className="mb-6">
        <p className="text-sm text-gray-500 mb-1">Completing:</p>
        <p className="font-medium text-gray-900">{subtask.title}</p>
        {timeBlock && (
          <p className="text-xs text-gray-400 mt-1">
            Scheduled: {timeBlock.startTime} - {timeBlock.endTime}
          </p>
        )}
      </div>

      {/* Quick options */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <button
          type="button"
          onClick={() => handleQuickSelect('less')}
          className={`p-3 rounded-lg border-2 text-center transition-colors ${
            selectedOption === 'less'
              ? 'border-sage bg-sage-50 text-sage-700'
              : 'border-gray-200 hover:border-gray-300 text-gray-700'
          }`}
        >
          <span className="block text-sm font-medium">-25%</span>
          <span className="block text-xs text-gray-500">{formatDuration(lessMinutes)}</span>
        </button>

        <button
          type="button"
          onClick={() => handleQuickSelect('estimated')}
          className={`p-3 rounded-lg border-2 text-center transition-colors ${
            selectedOption === 'estimated'
              ? 'border-sage bg-sage-50 text-sage-700'
              : 'border-gray-200 hover:border-gray-300 text-gray-700'
          }`}
        >
          <span className="block text-sm font-medium">As Estimated</span>
          <span className="block text-xs text-gray-500">{formatDuration(estimatedMinutes)}</span>
        </button>

        <button
          type="button"
          onClick={() => handleQuickSelect('more')}
          className={`p-3 rounded-lg border-2 text-center transition-colors ${
            selectedOption === 'more'
              ? 'border-sage bg-sage-50 text-sage-700'
              : 'border-gray-200 hover:border-gray-300 text-gray-700'
          }`}
        >
          <span className="block text-sm font-medium">+25%</span>
          <span className="block text-xs text-gray-500">{formatDuration(moreMinutes)}</span>
        </button>
      </div>

      {/* Custom input */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-600">Or enter exact time:</span>
        <div className="flex items-center gap-2">
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={customMinutes}
            onChange={(e) => handleCustomChange(e.target.value)}
            placeholder="..."
            className={`w-20 px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-sage-500 ${
              selectedOption === 'custom'
                ? 'border-sage bg-sage-50'
                : 'border-gray-300'
            }`}
          />
          <span className="text-sm text-gray-500">minutes</span>
        </div>
      </div>

      {/* Selected summary */}
      {isValid && (
        <div className="mt-6 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            Logging <span className="font-medium text-gray-900">{formatDuration(getSelectedMinutes())}</span>
            {selectedOption !== 'estimated' && (
              <>
                {' '}
                <span className={getSelectedMinutes() > estimatedMinutes ? 'text-coral' : 'text-green-600'}>
                  ({getSelectedMinutes() > estimatedMinutes ? '+' : ''}
                  {Math.round(((getSelectedMinutes() - estimatedMinutes) / estimatedMinutes) * 100)}% vs estimate)
                </span>
              </>
            )}
          </p>
        </div>
      )}
    </Modal>
  );
}
