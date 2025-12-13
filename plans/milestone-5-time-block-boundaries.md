# Milestone 5: Time Block Boundaries

## Overview

**Goal:** Protect the day from task blowup

**Current State:**
- Tasks can be marked complete in Today view
- No tracking of current time vs. scheduled blocks
- No nudge when time runs out
- No voice input capability

**Target State:**
- Real-time tracking of active time blocks
- TaskBoundaryModal when block ends
- Voice input for progress capture
- Auto-create follow-up task with remainder

---

## Implementation Steps

### Step 1: Create Time Tracking Hook

**New file:** `src/hooks/useTimeBlockBoundary.ts`

```typescript
interface TimeBlockBoundaryState {
  activeBlock: TimeBlock | null;       // Currently active block
  endedBlock: TimeBlock | null;        // Block that just ended (triggers modal)
  minutesRemaining: number | null;     // Countdown within active block
}

// Logic:
// 1. Run interval every 30 seconds
// 2. Find block where: now >= startTime AND now < endTime
// 3. If previous activeBlock exists but no longer active, set as endedBlock
// 4. Expose: activeBlock, endedBlock, clearEndedBlock()
```

---

### Step 2: Create TaskBoundaryModal

**New file:** `src/components/modals/TaskBoundaryModal.tsx`

```typescript
interface TaskBoundaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  block: TimeBlock;
  subtask: Subtask;
  parentItem: BacklogItem | undefined;
  onMarkComplete: (actualMinutes?: number) => void;
  onCreateFollowUp: (progressNote: string, remainingWork: string) => void;
}
```

**Modal states:**
1. **Initial** - "Time's up for [task]" with "Done" / "Need more time" buttons
2. **Done flow** - Prompt for actual time
3. **Need more time flow** - VoiceInput for progress → create follow-up

---

### Step 3: Create VoiceInput Component

**New file:** `src/components/VoiceInput.tsx`

```typescript
interface VoiceInputProps {
  onTranscript: (text: string) => void;
  placeholder?: string;
  className?: string;
}

// Uses Web Speech API:
// 1. Check: 'webkitSpeechRecognition' in window
// 2. Create recognition with continuous=false
// 3. Handle: onresult, onerror, onend
// 4. UI: Microphone button + text area
// 5. Fallback: manual text input
```

---

### Step 4: Extend Types

**File:** `src/types/index.ts`

```typescript
interface Subtask {
  // ... existing fields
  actualMinutes?: number;
  completedAt?: string;
  progressNote?: string;
  parentSubtaskId?: string;  // Link to original if follow-up
}

interface TimeBlock {
  // ... existing fields
  status: 'scheduled' | 'completed' | 'partial';
}
```

---

### Step 5: Update useModalState Hook

**File:** `src/hooks/useModalState.ts`

```typescript
type ModalType = 'decomposition' | 'overflow' | 'commit' | 'taskBoundary' | null;

interface TaskBoundaryData {
  blockId: string;
  subtaskId: string;
}

// Add: openTaskBoundaryModal(blockId, subtaskId)
// Add: isTaskBoundaryOpen, taskBoundaryData
```

---

### Step 6: Integrate into Today Page

**File:** `src/app/today/page.tsx`

1. Import and use `useTimeBlockBoundary` hook
2. Import `TaskBoundaryModal`
3. Watch for `endedBlock` and open modal
4. Wire up handlers:
   - `handleMarkComplete(actualMinutes)` - mark done with time
   - `handleCreateFollowUp(progress, remaining)` - create new subtask

---

## Data Flow

```
[useTimeBlockBoundary hook]
    ↓ (detects block end)
[TodayPage] → opens TaskBoundaryModal
    ↓
[TaskBoundaryModal]
    ├── "Done" → onMarkComplete(actualMinutes)
    │       → Update subtask.status = 'completed'
    │       → Update subtask.actualMinutes
    │
    └── "Need more time" → [VoiceInput]
            → onCreateFollowUp(progress, remaining)
            → Create new Subtask:
                - parentSubtaskId: original
                - title: "[Original] - Remainder"
                - status: 'estimated' (backlog)
```

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/hooks/useTimeBlockBoundary.ts` | Time tracking |
| `src/components/modals/TaskBoundaryModal.tsx` | End-of-block modal |
| `src/components/VoiceInput.tsx` | Voice capture |

## Files to Modify

| File | Changes |
|------|---------|
| `src/app/today/page.tsx` | Integrate hook, modal, handlers |
| `src/types/index.ts` | Add actualMinutes, status |
| `src/hooks/useModalState.ts` | Add taskBoundary modal type |

---

## Acceptance Criteria

- [ ] Hook detects when current time passes block end time
- [ ] Modal appears when time block ends
- [ ] "Done" option prompts for actual time and completes task
- [ ] "Need more time" shows voice input
- [ ] Voice input captures progress (or text fallback)
- [ ] Follow-up task created and added to backlog
- [ ] Original task marked as partial
