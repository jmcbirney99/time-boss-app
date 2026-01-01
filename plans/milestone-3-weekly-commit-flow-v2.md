# Milestone 3: Weekly Commit Flow (v2)

## Overview

**Goal:** Complete weekly planning ritual with commit action and re-plan capability

**Exit Criteria:** User can commit to weekly plan, see committed state, and re-plan if needed

---

## Scope Decisions (MVP)

Based on spec analysis, these decisions simplify MVP scope:

| Question | Decision |
|----------|----------|
| Post-commit task completion | **Allowed** - users can mark tasks complete |
| Post-commit editing | **Blocked** - all modifications require re-plan |
| Post-commit adding tasks | **Allowed to backlog only** - scheduling requires re-plan |
| Re-plan limits | **Unlimited** - no restrictions for MVP |
| Week rollover | **Automatic** - new week starts in 'planning' status |
| Incomplete task carryover | **Manual** - user moves from backlog (defer to Milestone 4) |
| Re-plan confirmation | **Yes** - simple confirmation modal |

---

## Implementation Steps

### Step 1: Add 'commit' Modal Type to useModalState

**File:** `src/hooks/useModalState.ts`

```typescript
// Line 3: Update type
type ModalType = 'decomposition' | 'overflow' | 'commit' | 'replan' | null;

// Add to return object (around line 50):
isCommitOpen: modalState.type === 'commit',
isReplanOpen: modalState.type === 'replan',
openCommitModal: useCallback(() => {
  setModalState({ type: 'commit', data: null });
}, []),
openReplanModal: useCallback(() => {
  setModalState({ type: 'replan', data: null });
}, []),
```

---

### Step 2: Create CommitConfirmationModal

**New file:** `src/components/modals/CommitConfirmationModal.tsx`

```typescript
interface CommitConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  scheduledMinutes: number;
  scheduledTaskCount: number;
  unscheduledBacklogCount: number;
  topUnscheduledItems: BacklogItem[]; // Top 5 by priority_rank
  isLoading: boolean;
}
```

**Modal layout:**
```
┌─────────────────────────────────────────────────────────────┐
│  Commit Weekly Plan                                    [X]  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  What you're committing to:                                 │
│    12 tasks • 18 hours scheduled                            │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  What won't get attention this week:                        │
│    17 backlog items, including:                             │
│    • Create estate planning legal docs                      │
│    • Fix backyard electrical outlet                         │
│    • Research cholesterol meds                              │
│    • Review insurance policies                              │
│    • Update LinkedIn profile                                │
│    + 12 more...                                             │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  Is that okay with you?                                     │
│                                                             │
│  Once committed, you'll need to "Re-plan" to make changes.  │
│                                                             │
│              [Cancel]        [Yes, Commit Plan]             │
└─────────────────────────────────────────────────────────────┘
```

**Accessibility:**
- `role="alertdialog"` (requires response)
- `aria-labelledby` → title
- `aria-describedby` → description
- Focus trap within modal
- ESC key closes modal

---

### Step 3: Create ReplanConfirmationModal

**New file:** `src/components/modals/ReplanConfirmationModal.tsx`

```typescript
interface ReplanConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isLoading: boolean;
}
```

**Modal layout:**
```
┌─────────────────────────────────────────────────────────────┐
│  Re-plan Week?                                         [X]  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  This will unlock your weekly plan for modifications.       │
│  You'll need to commit again when you're done.              │
│                                                             │
│              [Cancel]        [Yes, Re-plan]                 │
└─────────────────────────────────────────────────────────────┘
```

---

### Step 4: Update TopBar with Commit/Committed States

**File:** `src/components/layout/TopBar.tsx`

**Updated props:**
```typescript
interface TopBarProps {
  weekDateRange: string;
  totalCapacity: string;
  scheduled: string;
  remaining: string;
  isOverCapacity: boolean;
  overflowMinutes?: number;
  onReviewOverflow?: () => void;
  // NEW PROPS:
  planStatus: 'planning' | 'committed';
  onCommitClick?: () => void;
  onReplanClick?: () => void;
}
```

**Button states (right section, after capacity stats):**

| State | Button | Behavior |
|-------|--------|----------|
| `planning` + no overflow | "Commit Plan" (primary) | Enabled, opens modal |
| `planning` + overflow | "Commit Plan" (disabled) | Tooltip: "Resolve overflow to commit" |
| `committed` | "Committed" badge + "Re-plan" link | Badge is green, link opens replan modal |

**Disabled button pattern (aria-disabled for tooltip accessibility):**
```typescript
<Tooltip content="Resolve overflow to commit">
  <Button
    aria-disabled={isOverCapacity}
    onClick={isOverCapacity ? undefined : onCommitClick}
    className={isOverCapacity ? 'opacity-50 cursor-not-allowed' : ''}
  >
    Commit Plan
  </Button>
</Tooltip>
```

---

### Step 5: Wire Up Commit Flow in page.tsx

**File:** `src/app/page.tsx`

**Changes needed:**

1. Destructure `weeklyPlan` from `appData`:
```typescript
const { weeklyPlan } = appData;
```

2. Add modal state:
```typescript
const {
  isCommitOpen,
  isReplanOpen,
  openCommitModal,
  openReplanModal,
  closeModal,
  // ...existing
} = useModalState();
```

3. Create handlers:
```typescript
const [isCommitting, setIsCommitting] = useState(false);

const handleCommit = async () => {
  setIsCommitting(true);
  try {
    await appData.weeklyPlan.upsert({
      status: 'committed',
      committedAt: new Date().toISOString(),
    });
    closeModal();
  } catch (error) {
    console.error('Commit failed:', error);
    // TODO: Show error toast
  } finally {
    setIsCommitting(false);
  }
};

const handleReplan = async () => {
  setIsCommitting(true);
  try {
    await appData.weeklyPlan.upsert({
      status: 'planning',
      committedAt: null,
    });
    closeModal();
  } catch (error) {
    console.error('Replan failed:', error);
  } finally {
    setIsCommitting(false);
  }
};
```

4. Calculate modal data:
```typescript
const scheduledSubtasks = subtasks.filter(s => s.status === 'scheduled');
const scheduledMinutes = scheduledSubtasks.reduce((sum, s) => sum + s.estimatedMinutes, 0);
const scheduledBacklogIds = new Set(scheduledSubtasks.map(s => s.backlogItemId));
const unscheduledItems = backlogItems.filter(b => !scheduledBacklogIds.has(b.id));
const topUnscheduledItems = unscheduledItems
  .sort((a, b) => a.priorityRank - b.priorityRank)
  .slice(0, 5);
```

5. Update TopBar props:
```typescript
<TopBar
  // ...existing props
  planStatus={weeklyPlan?.status ?? 'planning'}
  onCommitClick={openCommitModal}
  onReplanClick={openReplanModal}
/>
```

6. Render modals:
```typescript
<CommitConfirmationModal
  isOpen={isCommitOpen}
  onClose={closeModal}
  onConfirm={handleCommit}
  scheduledMinutes={scheduledMinutes}
  scheduledTaskCount={scheduledBacklogIds.size}
  unscheduledBacklogCount={unscheduledItems.length}
  topUnscheduledItems={topUnscheduledItems}
  isLoading={isCommitting}
/>

<ReplanConfirmationModal
  isOpen={isReplanOpen}
  onClose={closeModal}
  onConfirm={handleReplan}
  isLoading={isCommitting}
/>
```

---

### Step 6: Block Modifications in Committed State

**Approach:** Add `isCommitted` check to drag-and-drop handlers and edit buttons.

**Files to update:**
- `src/components/schedule/DayColumn.tsx` - block drag-drop
- `src/components/schedule/TimeBlockCard.tsx` - block edit/delete
- `src/components/backlog/BacklogItemCard.tsx` - block drag-to-schedule

**Pattern:**
```typescript
const handleDragEnd = (result: DropResult) => {
  if (weeklyPlan?.status === 'committed') {
    toast.info('Plan is committed. Click Re-plan to make changes.');
    return;
  }
  // ... existing logic
};
```

**Allowed in committed state:**
- Mark subtasks complete/incomplete (checkbox toggle)
- Add new items to backlog (unscheduled)
- View all data

---

## Data Flow

```
User clicks "Commit Plan" (TopBar)
    ↓
openCommitModal() called
    ↓
CommitConfirmationModal opens with summary data
    ↓
User clicks "Yes, Commit Plan"
    ↓
handleCommit() called:
  - API: PATCH /api/weekly-plan { status: 'committed', committedAt: ISO }
  - closeModal()
    ↓
weeklyPlan refreshes with new status
    ↓
TopBar re-renders:
  - "Committed" badge (green)
  - "Re-plan" link
    ↓
Modification handlers now check status and block changes
```

---

## Files Changed Summary

| File | Change |
|------|--------|
| `src/hooks/useModalState.ts` | Add 'commit' and 'replan' modal types |
| `src/components/modals/CommitConfirmationModal.tsx` | **New** |
| `src/components/modals/ReplanConfirmationModal.tsx` | **New** |
| `src/components/layout/TopBar.tsx` | Add commit button, committed badge, re-plan link |
| `src/app/page.tsx` | Wire up weeklyPlan state, modal handlers, pass props |
| `src/components/schedule/DayColumn.tsx` | Block drag-drop when committed |
| `src/components/schedule/TimeBlockCard.tsx` | Block edit/delete when committed |
| `src/components/backlog/BacklogItemCard.tsx` | Block drag-to-schedule when committed |

---

## Acceptance Criteria

### Commit Flow
- [ ] Commit button shows in TopBar when plan status is 'planning'
- [ ] Commit button is disabled with tooltip when overflow exists
- [ ] Clicking enabled button opens CommitConfirmationModal
- [ ] Modal shows scheduled task count and total hours
- [ ] Modal shows unscheduled backlog count
- [ ] Modal lists top 5 highest-priority unscheduled items (by priority_rank)
- [ ] Modal asks "Is that okay with you?"
- [ ] Cancel button closes modal without changes
- [ ] Confirm button shows loading state during API call
- [ ] Confirming changes status to 'committed' and sets committedAt
- [ ] Success: modal closes, TopBar shows "Committed" badge

### Committed State
- [ ] "Committed" badge (green) shows in TopBar
- [ ] "Re-plan" link shows next to badge
- [ ] Dragging time blocks is blocked with toast message
- [ ] Editing time blocks is blocked
- [ ] Deleting time blocks is blocked
- [ ] Dragging backlog items to schedule is blocked
- [ ] Marking subtasks complete IS allowed
- [ ] Adding new backlog items IS allowed

### Re-plan Flow
- [ ] Clicking "Re-plan" opens ReplanConfirmationModal
- [ ] Confirming changes status to 'planning' and clears committedAt
- [ ] TopBar returns to showing "Commit Plan" button
- [ ] All modification actions are re-enabled

### Error Handling
- [ ] API failure shows error toast
- [ ] Modal stays open on failure (can retry)
- [ ] Button returns to enabled state after failure

---

## Out of Scope (Future Milestones)

- Week rollover logic and incomplete task carryover → Milestone 4
- Re-plan analytics/tracking
- Multi-device sync/conflict resolution
- Partial modifications without full re-plan
