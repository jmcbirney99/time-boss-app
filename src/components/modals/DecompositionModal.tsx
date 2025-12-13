'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import type { BacklogItem, Subtask, TimeEstimate } from '@/types';
import { TIME_ESTIMATES } from '@/lib/constants';
import { formatDuration } from '@/lib/dateUtils';
import { getDecompositionSuggestions } from '@/data/mockData';

interface SubtaskDraft {
  id: string;
  title: string;
  estimatedMinutes: TimeEstimate;
  definitionOfDone: string;
}

interface DecompositionModalProps {
  isOpen: boolean;
  onClose: () => void;
  backlogItem: BacklogItem | null;
  existingSubtasks: Subtask[];
  onSave: (subtasks: SubtaskDraft[]) => void;
}

export function DecompositionModal({
  isOpen,
  onClose,
  backlogItem,
  existingSubtasks,
  onSave,
}: DecompositionModalProps) {
  const [subtasks, setSubtasks] = useState<SubtaskDraft[]>([]);

  // Load existing subtasks or suggestions when modal opens
  useEffect(() => {
    if (isOpen && backlogItem) {
      if (existingSubtasks.length > 0) {
        // Load existing subtasks
        setSubtasks(
          existingSubtasks.map((s) => ({
            id: s.id,
            title: s.title,
            estimatedMinutes: s.estimatedMinutes as TimeEstimate,
            definitionOfDone: s.definitionOfDone,
          }))
        );
      } else {
        // Load LLM suggestions (mock)
        const suggestions = getDecompositionSuggestions(backlogItem.id);
        if (suggestions.length > 0) {
          setSubtasks(
            suggestions.map((s, index) => ({
              id: `new-${Date.now()}-${index}`,
              title: s.title || '',
              estimatedMinutes: (s.estimatedMinutes as TimeEstimate) || 60,
              definitionOfDone: s.definitionOfDone || '',
            }))
          );
        } else {
          // Default empty subtask
          setSubtasks([
            {
              id: `new-${Date.now()}`,
              title: '',
              estimatedMinutes: 60,
              definitionOfDone: '',
            },
          ]);
        }
      }
    }
  }, [isOpen, backlogItem, existingSubtasks]);

  const handleAddSubtask = () => {
    setSubtasks([
      ...subtasks,
      {
        id: `new-${Date.now()}`,
        title: '',
        estimatedMinutes: 60,
        definitionOfDone: '',
      },
    ]);
  };

  const handleRemoveSubtask = (id: string) => {
    setSubtasks(subtasks.filter((s) => s.id !== id));
  };

  const handleUpdateSubtask = (id: string, updates: Partial<SubtaskDraft>) => {
    setSubtasks(
      subtasks.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );
  };

  const handleSave = () => {
    // Filter out empty subtasks
    const validSubtasks = subtasks.filter((s) => s.title.trim() !== '');
    onSave(validSubtasks);
    onClose();
  };

  const totalEstimate = subtasks.reduce((sum, s) => sum + s.estimatedMinutes, 0);

  if (!backlogItem) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Break Down Task"
      size="xl"
      footer={
        <>
          <div className="flex-1 text-sm text-gray-500">
            Total: <span className="font-medium text-gray-900">{formatDuration(totalEstimate)}</span>
          </div>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Subtasks</Button>
        </>
      }
    >
      {/* Parent task info */}
      <div className="mb-6 pb-4 border-b border-gray-200">
        <h3 className="font-medium text-gray-900">{backlogItem.title}</h3>
        {backlogItem.description && (
          <p className="text-sm text-gray-500 mt-1">{backlogItem.description}</p>
        )}
      </div>

      {/* Subtask list */}
      <div className="space-y-4">
        {subtasks.map((subtask, index) => (
          <SubtaskRow
            key={subtask.id}
            subtask={subtask}
            index={index}
            onUpdate={(updates) => handleUpdateSubtask(subtask.id, updates)}
            onRemove={() => handleRemoveSubtask(subtask.id)}
            canRemove={subtasks.length > 1}
          />
        ))}
      </div>

      {/* Add button */}
      <button
        onClick={handleAddSubtask}
        className="mt-4 w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors"
      >
        + Add subtask
      </button>
    </Modal>
  );
}

interface SubtaskRowProps {
  subtask: SubtaskDraft;
  index: number;
  onUpdate: (updates: Partial<SubtaskDraft>) => void;
  onRemove: () => void;
  canRemove: boolean;
}

function SubtaskRow({ subtask, index, onUpdate, onRemove, canRemove }: SubtaskRowProps) {
  return (
    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
      <span className="text-sm font-medium text-gray-400 mt-2">{index + 1}</span>

      <div className="flex-1 space-y-2">
        <input
          type="text"
          value={subtask.title}
          onChange={(e) => onUpdate({ title: e.target.value })}
          placeholder="Subtask title"
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <input
          type="text"
          value={subtask.definitionOfDone}
          onChange={(e) => onUpdate({ definitionOfDone: e.target.value })}
          placeholder="Definition of done (optional)"
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
        />
      </div>

      <select
        value={subtask.estimatedMinutes}
        onChange={(e) => onUpdate({ estimatedMinutes: Number(e.target.value) as TimeEstimate })}
        className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
      >
        {TIME_ESTIMATES.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {canRemove && (
        <button
          onClick={onRemove}
          className="p-2 text-gray-400 hover:text-red-500 transition-colors"
          title="Remove subtask"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      )}
    </div>
  );
}
