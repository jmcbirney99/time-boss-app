# feat: Add Task to Backlog

## Overview

Users currently see "No items in backlog" with no way to add tasks. Add an inline quick-add input at the bottom of the BacklogList component.

## Acceptance Criteria

- [ ] Inline input appears at bottom of BacklogList (always visible)
- [ ] User can type task title and press Enter or click "Add" to create
- [ ] Input clears and refocuses after successful creation (for rapid entry)
- [ ] Loading state shows while API request in progress
- [ ] Error message displays on validation or network failure
- [ ] Works on mobile (keyboard doesn't hide input)

## Implementation

### 1. Update BacklogList.tsx

Add props and quick-add input:

```tsx
// src/components/backlog/BacklogList.tsx

interface BacklogListProps {
  backlogItems: BacklogItemType[];
  subtasks: Subtask[];
  onDecomposeClick: (backlogItemId: string) => void;
  onAddItem: (title: string) => Promise<void>;  // NEW
}

// At bottom of component, before closing </div>:
<QuickAddInput onAdd={onAddItem} />
```

### 2. Create QuickAddInput component

```tsx
// src/components/backlog/QuickAddInput.tsx

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
    } catch (err) {
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
          className="px-4 py-2 text-sm font-medium text-white bg-sage-600 rounded-lg hover:bg-sage-700 disabled:opacity-50"
        >
          {isLoading ? '...' : 'Add'}
        </button>
      </div>
    </form>
  );
}
```

### 3. Wire up in page.tsx

```tsx
// src/app/page.tsx

// Add handler using existing useBacklog hook:
const handleAddBacklogItem = useCallback(async (title: string) => {
  await appData.backlog.create({ title });
}, [appData.backlog]);

// Pass to BacklogList:
<BacklogList
  backlogItems={backlogItems}
  subtasks={subtasks}
  onDecomposeClick={openDecompositionModal}
  onAddItem={handleAddBacklogItem}  // NEW
/>
```

## Files to Create/Modify

| File | Action |
|------|--------|
| `src/components/backlog/QuickAddInput.tsx` | Create |
| `src/components/backlog/BacklogList.tsx` | Add props, render QuickAddInput |
| `src/app/page.tsx` | Add handler, pass to BacklogList |

## References

- Existing input pattern: `src/components/modals/DecompositionModal.tsx:231-258`
- useBacklog.create: `src/hooks/useData.ts:52-56`
- POST /api/backlog: `src/app/api/backlog/route.ts:24-77`
- BacklogItemCreateSchema: `src/lib/schemas.ts:20-32`
