# Milestone 4: Daily Review

## Overview

**Goal:** Morning ritual works - reconcile yesterday, confirm today

**Current State:**
- No daily review modal exists
- Today view shows current day's tasks but no review flow
- No way to handle incomplete tasks from previous day

**Target State:**
- DailyReviewModal triggered manually from Today view
- Shows yesterday's incomplete tasks with resolution options
- Shows today's schedule preview
- "Start Day" confirmation

---

## Implementation Steps

### Step 1: Add Types

**File:** `src/types/index.ts`

```typescript
// Daily review action types
export type DailyReviewAction = 'reschedule' | 'defer' | 'delete';

// For tracking incomplete item resolutions
export interface IncompleteItemResolution {
  subtaskId: string;
  action: DailyReviewAction;
  newDate?: string; // Required if action is 'reschedule'
}

// Daily review record (for future persistence)
export interface DailyReview {
  id: string;
  date: string;
  completedSubtaskIds: string[];
  incompleteSubtaskIds: string[];
  overflowActions: IncompleteItemResolution[];
  notes?: string;
  completedAt?: string;
}
```

---

### Step 2: Create DailyReviewModal Component

**New file:** `src/components/modals/DailyReviewModal.tsx`

```typescript
interface DailyReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  yesterdayDate: Date;
  todayDate: Date;
  incompleteSubtasks: Array<{
    subtask: Subtask;
    parentTitle: string;
    block?: TimeBlock;
  }>;
  todayBlocks: Array<{
    block: TimeBlock;
    subtask: Subtask;
    parentTitle: string;
  }>;
  onStartDay: (
    resolutions: Map<string, { action: DailyReviewAction; newDate?: string }>,
    notes?: string
  ) => void;
}
```

**Modal Sections:**

1. **Header:** "Morning Review" with date
2. **Yesterday's Incomplete** (if any)
   - List each incomplete task
   - Per-task resolution options (radio buttons):
     - "Reschedule to today" (default)
     - "Defer to backlog"
     - "Delete"
3. **Today's Preview**
   - Show today's scheduled blocks sorted by time
   - Total scheduled time summary
4. **Notes** (optional textarea)
5. **Footer:** Cancel + "Start Day" button

---

### Step 3: Add Data Helper Functions

**File:** `src/data/sampleData.ts`

```typescript
// Get incomplete subtasks from a specific date
export function getIncompleteSubtasksForDate(date: string): Subtask[] {
  const dateBlocks = timeBlocks.filter(b => b.date === date);
  const scheduledSubtaskIds = dateBlocks.map(b => b.subtaskId);

  return subtasks.filter(s =>
    scheduledSubtaskIds.includes(s.id) &&
    s.status !== 'completed'
  );
}
```

---

### Step 4: Integrate into Today View

**File:** `src/app/today/page.tsx`

1. Import `DailyReviewModal`
2. Add state: `const [isReviewModalOpen, setIsReviewModalOpen] = useState(false)`
3. Calculate `yesterdayIncomplete` from data
4. Add "Morning Review" button to header
5. Handle `onStartDay` callback:
   - 'reschedule': create new block for today
   - 'defer': set subtask.status = 'estimated', clear scheduledBlockId
   - 'delete': set subtask.status = 'archived'

---

## Modal UI Layout

```
+------------------------------------------+
| Morning Review                        [X] |
+------------------------------------------+
| Yesterday's Incomplete (2 tasks)          |
|                                           |
| [Task Card]                               |
|   Task title              [90m badge]     |
|   Parent item name                        |
|   ( ) Reschedule to today                 |
|   ( ) Defer to backlog                    |
|   ( ) Delete                              |
+------------------------------------------+
| Today's Schedule (3 tasks, 2h 30m)        |
|                                           |
|   9:30 - 10:00  Gift list spreadsheet     |
|   10:00 - 11:00 Research gift ideas       |
+------------------------------------------+
| Notes (optional)                          |
| [textarea]                                |
+------------------------------------------+
|              [Cancel]  [Start Day]        |
+------------------------------------------+
```

---

## Data Flow

```
Today Page
    ↓
Calculate yesterday's incomplete tasks
    ↓
Open DailyReviewModal
    ↓
User selects resolution for each incomplete task
    ↓
User optionally adds notes
    ↓
Click "Start Day"
    ↓
onStartDay callback:
  - 'reschedule': create new block for today
  - 'defer': status = 'estimated', clear block
  - 'delete': status = 'archived'
```

---

## Files Changed Summary

| File | Action |
|------|--------|
| `src/types/index.ts` | Add DailyReviewAction, IncompleteItemResolution, DailyReview |
| `src/components/modals/DailyReviewModal.tsx` | **New** |
| `src/app/today/page.tsx` | Add state, button, modal integration |
| `src/data/sampleData.ts` | Add helper functions |

---

## Acceptance Criteria

- [ ] "Morning Review" button visible in Today view
- [ ] Modal shows yesterday's incomplete tasks
- [ ] User must select resolution for each incomplete task
- [ ] "Start Day" button disabled until all resolved
- [ ] Resolutions apply correctly (reschedule/defer/delete)
- [ ] Today's schedule preview shows in modal
- [ ] Notes field available (optional)
