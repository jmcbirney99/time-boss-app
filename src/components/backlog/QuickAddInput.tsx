'use client';

import { useState, useRef, FormEvent } from 'react';

interface QuickAddInputProps {
  onAdd: (title: string) => Promise<void>;
}

export function QuickAddInput({ onAdd }: QuickAddInputProps) {
  const [title, setTitle] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      await onAdd(trimmed);
      setTitle('');
      inputRef.current?.focus();
    } catch {
      setError('Failed to add task');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4">
      {error && (
        <div className="text-sm text-red-600 mb-2">{error}</div>
      )}
      <div className="flex gap-2">
        <input
          ref={inputRef}
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Add a task..."
          disabled={isLoading}
          className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sage-500"
          aria-label="New task title"
        />
        <button
          type="submit"
          disabled={!title.trim() || isLoading}
          className="px-4 py-2 text-sm font-medium text-white bg-sage-600 rounded-lg hover:bg-sage-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? '...' : 'Add'}
        </button>
      </div>
    </form>
  );
}
