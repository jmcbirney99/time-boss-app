# Milestone 3: Weekly Commit Flow

## Overview

**Goal:** Complete weekly planning ritual with commit action

**Current State:**
- `WeeklyPlan` type has `status: 'planning' | 'committed'` (no `committedAt` field yet)
- `OverflowModal` exists with resolution UI, but is optional (not enforced)
- `TopBar` shows overflow badge and "Review" button, but no commit button
- `useCapacityCalculation` computes `isOverCapacity` and `overflowMinutes`

**Target State:**
- Commit button in TopBar
- Cannot commit if overflow exists (enforced)
- CommitConfirmationModal for explicit commitment
- Track `committedAt` timestamp

---

## Implementation Steps

### Step 1: Update WeeklyPlan Type

**File:** `src/types/index.ts`

```typescript
export interface WeeklyPlan {
  id: string;
  weekStartDate: string;
  status: 'planning' | 'committed';
  totalCapacityMinutes: number;
  scheduledMinutes: number;
  overflowSubtaskIds: string[];
  committedAt?: string;  // ADD THIS
}
```

---

### Step 2: Add Commit Modal Type to useModalState

**File:** `src/hooks/useModalState.ts`

```typescript
type ModalType = 'decomposition' | 'overflow' | 'commit' | null;

// Add to return object:
isCommitOpen: modalState.type === 'commit',
openCommitModal: useCallback(() => {
  setModalState({ type: 'commit', data: null });
}, []),
```

---

### Step 3: Create CommitConfirmationModal

**New file:** `src/components/modals/CommitConfirmationModal.tsx`

```typescript
interface CommitConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  scheduledMinutes: number;
  scheduledTaskCount: number;
  unscheduledBacklogCount: number;
  topUnscheduledItems: BacklogItem[]; // Top 3-5 by priority
}
```

**Modal content:**
- Header: "Commit Weekly Plan"
- Commitment summary: "You are committing to [X] tasks totaling [Y hours] this week."
- **Trade-off Acknowledgment section:**
  - "This means [Z] backlog items won't get attention this week"
  - List top 3-5 highest-priority unscheduled items (title only)
  - Visual separator
  - Question: "Is that okay with you?"
- Note: "Once committed, you'll get reminders when time blocks end."
- Footer: Cancel (secondary) + "Yes, Commit Plan" (primary)

**Trade-off section UI:**
```
┌─────────────────────────────────────────────────────────────┐
│  What you're committing to:                                  │
│    12 tasks • 18 hours scheduled                            │
├─────────────────────────────────────────────────────────────┤
│  What won't get attention this week:                        │
│    17 backlog items, including:                             │
│    • Create estate planning legal docs                      │
│    • Fix backyard electrical outlet                         │
│    • Research cholesterol meds                              │
│    + 14 more...                                             │
├─────────────────────────────────────────────────────────────┤
│  Is that okay with you?                                     │
│                                                             │
│           [Cancel]        [Yes, Commit Plan]                │
└─────────────────────────────────────────────────────────────┘
```

**Key insight:** This transforms the commit from "I resolved overflow" (reactive) to "I'm consciously choosing to focus on these things" (ownership).

---

### Step 4: Add Commit Button to TopBar

**File:** `src/components/layout/TopBar.tsx`

**Props to add:**
```typescript
interface TopBarProps {
  // ...existing props...
  planStatus: 'planning' | 'committed';
  onCommitClick?: () => void;
}
```

**Button states:**
- `planStatus === 'committed'`: Show "Committed" badge (green, non-interactive)
- `planStatus === 'planning' && !isOverCapacity`: Show enabled "Commit Plan" button
- `planStatus === 'planning' && isOverCapacity`: Show disabled button with tooltip "Resolve overflow first"

---

### Step 5: Wire Up Commit Flow in page.tsx

**File:** `src/app/page.tsx`

1. Add `weeklyPlan` state (initialize from `getWeeklyPlan`)
2. Destructure `isCommitOpen`, `openCommitModal` from `useModalState`
3. Create `handleCommit` callback:
   ```typescript
   const handleCommit = () => {
     setWeeklyPlan(prev => ({
       ...prev,
       status: 'committed',
       committedAt: new Date().toISOString(),
     }));
     closeModal();
   };
   ```
4. Pass `planStatus` and `onCommitClick` to TopBar
5. Render CommitConfirmationModal

---

## Data Flow

```
User clicks "Commit Plan" (TopBar)
    ↓
openCommitModal() called
    ↓
CommitConfirmationModal opens
    ↓
User clicks "Commit Plan" button
    ↓
handleCommit() called:
  - weeklyPlan.status = 'committed'
  - weeklyPlan.committedAt = timestamp
  - closeModal()
    ↓
TopBar re-renders with "Committed" badge
```

---

## Enforcement Logic

- TopBar renders commit button as **disabled** when `isOverCapacity === true`
- Already computed by `useCapacityCalculation`
- Tooltip on disabled button: "Resolve overflow to commit"

---

## Files Changed Summary

| File | Change |
|------|--------|
| `src/types/index.ts` | Add `committedAt?: string` to WeeklyPlan |
| `src/hooks/useModalState.ts` | Add 'commit' modal type |
| `src/components/modals/CommitConfirmationModal.tsx` | **New** |
| `src/components/layout/TopBar.tsx` | Add commit button and badge |
| `src/app/page.tsx` | Wire up weeklyPlan state and commit flow |

---

## Acceptance Criteria

- [ ] Commit button shows in TopBar when plan status is 'planning'
- [ ] Commit button is disabled when overflow exists
- [ ] Clicking enabled button opens confirmation modal
- [ ] Modal shows trade-off acknowledgment:
  - [ ] Displays count of scheduled tasks and total hours
  - [ ] Displays count of unscheduled backlog items
  - [ ] Lists top 3-5 highest-priority unscheduled items
  - [ ] Asks "Is that okay with you?"
- [ ] Confirming changes status to 'committed' and sets timestamp
- [ ] "Committed" badge shows after committing
- [ ] Cannot commit again once committed
