# Milestone 2: LLM Decomposition

## Overview

**Goal:** Real AI-powered task breakdown

**Current State:**
- `DecompositionModal` (`src/components/modals/DecompositionModal.tsx`) exists and is fully functional UI-wise
- Currently calls `getDecompositionSuggestions(backlogItem.id)` from `src/data/mockData.ts` to load hardcoded suggestions
- Modal supports editing subtasks (title, definitionOfDone, estimatedMinutes), adding/removing rows
- `onSave` callback passes subtasks back to `page.tsx` which updates local state
- No API routes exist yet
- No Claude SDK installed

---

## LLM Contract (from PRD)

**Input:**
```json
{
  "backlogItem": {
    "title": "Launch side project",
    "description": "Get the MVP out the door..."
  },
  "constraints": {
    "minSubtaskMinutes": 60,
    "maxSubtaskMinutes": 240,
    "maxSubtasks": 8
  }
}
```

**Output:**
```json
{
  "subtasks": [
    {
      "title": "Define MVP scope",
      "definitionOfDone": "Written document with 3-5 core features",
      "estimatedMinutes": 90,
      "rationale": "Need clear scope before building"
    }
  ]
}
```

---

## Implementation Steps

### Step 1: Install Anthropic SDK

```bash
npm install @anthropic-ai/sdk
```

Add `ANTHROPIC_API_KEY` to `.env.local`.

---

### Step 2: Create API Route for Decomposition

**New file:** `src/app/api/decompose/route.ts`

```typescript
import Anthropic from '@anthropic-ai/sdk';
import { NextResponse } from 'next/server';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `You are helping a busy knowledge worker break down tasks into actionable subtasks.

Rules:
- Each subtask should be 1-4 hours (60-240 minutes)
- Include a clear "definition of done" - what does completion look like?
- Be realistic about time estimates based on typical complexity
- Maximum 8 subtasks per backlog item
- If the task is too large, suggest breaking it into multiple backlog items

Respond with JSON only in this format:
{
  "subtasks": [
    {
      "title": "string",
      "definitionOfDone": "string",
      "estimatedMinutes": number,
      "rationale": "string"
    }
  ]
}`;

export async function POST(request: Request) {
  const { backlogItem, constraints } = await request.json();

  const userMessage = `Break down this task into subtasks:

Title: ${backlogItem.title}
Description: ${backlogItem.description || 'No description provided'}

Constraints:
- Minimum subtask duration: ${constraints.minSubtaskMinutes} minutes
- Maximum subtask duration: ${constraints.maxSubtaskMinutes} minutes
- Maximum number of subtasks: ${constraints.maxSubtasks}`;

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userMessage }],
  });

  const content = response.content[0];
  if (content.type === 'text') {
    const parsed = JSON.parse(content.text);
    return NextResponse.json(parsed);
  }

  return NextResponse.json({ error: 'Unexpected response format' }, { status: 500 });
}
```

---

### Step 3: Wire DecompositionModal to API

**Modify:** `src/components/modals/DecompositionModal.tsx`

1. Add loading state: `const [isLoading, setIsLoading] = useState(false)`
2. Add error state: `const [error, setError] = useState<string | null>(null)`
3. Replace mock data call with API fetch:

```typescript
useEffect(() => {
  if (isOpen && backlogItem && existingSubtasks.length === 0) {
    setIsLoading(true);
    setError(null);

    fetch('/api/decompose', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        backlogItem: { title: backlogItem.title, description: backlogItem.description },
        constraints: { minSubtaskMinutes: 60, maxSubtaskMinutes: 240, maxSubtasks: 8 }
      })
    })
      .then(res => res.json())
      .then(data => {
        setSubtasks(data.subtasks.map((s, i) => ({
          id: `new-${Date.now()}-${i}`,
          title: s.title,
          estimatedMinutes: s.estimatedMinutes,
          definitionOfDone: s.definitionOfDone,
          rationale: s.rationale,
        })));
      })
      .catch(err => setError('Failed to generate suggestions'))
      .finally(() => setIsLoading(false));
  }
}, [isOpen, backlogItem, existingSubtasks]);
```

4. Show loading spinner while waiting
5. Show error message if API call fails
6. Store rationale from each subtask

---

### Step 4: Extend Subtask Type

**Modify:** `src/types/index.ts`

```typescript
interface Subtask {
  // ... existing fields
  llmGenerated: boolean;      // NEW
  llmRationale?: string;      // NEW
}
```

---

### Step 5: Update Save Handler

**Modify:** `src/app/page.tsx` - `handleDecompositionSave`

Set `llmGenerated: true` and pass through `rationale` when creating subtasks from API suggestions.

---

## Files Changed Summary

| File | Change |
|------|--------|
| `package.json` | Add `@anthropic-ai/sdk` dependency |
| `.env.local` | Add `ANTHROPIC_API_KEY` |
| `src/app/api/decompose/route.ts` | **New** - POST endpoint calling Claude |
| `src/types/index.ts` | Add `llmGenerated` and `llmRationale` to Subtask |
| `src/components/modals/DecompositionModal.tsx` | Add loading/error states, fetch from API |
| `src/app/page.tsx` | Set LLM metadata when saving |

---

## Acceptance Criteria

- [ ] Clicking "Break Down" on a backlog item calls Claude API
- [ ] Loading spinner shows while waiting for response
- [ ] Error message displays if API fails
- [ ] Suggested subtasks populate the modal
- [ ] User can edit suggestions before saving
- [ ] Saved subtasks have `llmGenerated: true`

---

## Dependencies

**NPM packages to add:**
- `@anthropic-ai/sdk`

**Environment variables:**
- `ANTHROPIC_API_KEY`
