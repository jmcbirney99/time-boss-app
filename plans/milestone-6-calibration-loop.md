# Milestone 6: Calibration Loop

## Overview

**Goal:** Learn from actual time to improve estimates

**Current State:**
- `Subtask` has `estimatedMinutes` but no `actualMinutes`
- Task completion just sets status to 'completed'
- No calibration data or calculation
- User interface has `whirlwindPercentage` but no `estimationMultiplier`

**Target State:**
- Actual time logging on task completion
- Rolling average calibration multiplier
- Calibration insight displayed
- (Optional) Adjusted estimates in UI

---

## Implementation Steps

### Step 1: Extend Types

**File:** `src/types/index.ts`

```typescript
interface Subtask {
  // ... existing fields
  actualMinutes?: number;      // Logged after completion
  completedAt?: string;        // ISO timestamp
}

interface User {
  // ... existing fields
  estimationMultiplier: number;  // Learned calibration, starts at 1.0
}
```

---

### Step 2: Create Calibration Utility

**New file:** `src/lib/calibration.ts`

```typescript
// Get completed tasks with both estimated and actual times
export function getCompletedTasksWithTimes(subtasks: Subtask[]): Subtask[] {
  return subtasks.filter(s =>
    s.status === 'completed' &&
    s.actualMinutes !== undefined &&
    s.estimatedMinutes > 0
  );
}

// Calculate rolling average ratio from last N completed tasks
export function calculateCalibrationMultiplier(
  subtasks: Subtask[],
  windowSize: number = 20
): number {
  const completed = getCompletedTasksWithTimes(subtasks);
  if (completed.length === 0) return 1.0;

  const recent = completed.slice(-windowSize);
  const ratios = recent.map(s => s.actualMinutes! / s.estimatedMinutes);
  const avgRatio = ratios.reduce((sum, r) => sum + r, 0) / ratios.length;

  return Math.round(avgRatio * 100) / 100; // Round to 2 decimals
}

// Get human-readable calibration insight
export function getCalibrationInsight(multiplier: number): string {
  if (multiplier > 1.1) {
    const pct = Math.round((multiplier - 1) * 100);
    return `Your tasks typically take ${pct}% longer than estimated`;
  } else if (multiplier < 0.9) {
    const pct = Math.round((1 - multiplier) * 100);
    return `You tend to finish ${pct}% faster than estimated`;
  } else {
    return 'Your estimates are accurate (within 10%)';
  }
}
```

---

### Step 3: Create Time Logging Modal

**New file:** `src/components/modals/TimeLoggingModal.tsx`

```typescript
interface TimeLoggingModalProps {
  subtask: Subtask;
  timeBlock: TimeBlock;
  isOpen: boolean;
  onClose: () => void;
  onLogTime: (actualMinutes: number) => void;
}
```

**UI:**
```
"How long did this take?"

[As Estimated (60m)]   [+25% (75m)]   [-25% (45m)]

Or enter exact time: [____] minutes

        [Cancel]  [Log Time]
```

---

### Step 4: Wire Time Logging to Task Completion

**File:** `src/app/today/page.tsx`

```typescript
const [timeLoggingSubtask, setTimeLoggingSubtask] = useState<Subtask | null>(null);

const handleMarkComplete = (subtaskId: string) => {
  const subtask = subtasks.find(s => s.id === subtaskId);
  setTimeLoggingSubtask(subtask); // Opens modal instead of completing immediately
};

const handleTimeLogged = (actualMinutes: number) => {
  // Update subtask with actualMinutes, completedAt, status
  setSubtasks(prev => prev.map(s =>
    s.id === timeLoggingSubtask?.id
      ? { ...s, status: 'completed', actualMinutes, completedAt: new Date().toISOString() }
      : s
  ));
  setTimeLoggingSubtask(null);
};
```

---

### Step 5: Display Calibration Insight

**File:** `src/components/today/TodayView.tsx`

```typescript
import { calculateCalibrationMultiplier, getCalibrationInsight } from '@/lib/calibration';

// In component:
const multiplier = calculateCalibrationMultiplier(subtasks);
const insight = getCalibrationInsight(multiplier);
const completedCount = getCompletedTasksWithTimes(subtasks).length;

// In JSX, after progress bar:
{completedCount >= 3 && (
  <div className="text-sm text-gray-600 mt-2">
    {insight}
  </div>
)}
```

---

### Step 6: Add Test Data

**File:** `src/data/sampleData.ts`

Add some completed subtasks with `actualMinutes` for testing:

```typescript
{
  id: 'subtask_test_001',
  // ...other fields
  status: 'completed',
  estimatedMinutes: 60,
  actualMinutes: 75,
  completedAt: '2025-12-10T10:30:00Z',
}
```

---

## Files Changed Summary

| File | Action |
|------|--------|
| `src/types/index.ts` | Add `actualMinutes`, `completedAt`, `estimationMultiplier` |
| `src/lib/calibration.ts` | **New** - Calibration calculations |
| `src/components/modals/TimeLoggingModal.tsx` | **New** - Time logging UI |
| `src/app/today/page.tsx` | Wire modal to completion flow |
| `src/components/today/TodayView.tsx` | Display calibration insight |
| `src/data/sampleData.ts` | Add test data with actualMinutes |

---

## Acceptance Criteria

- [ ] Marking a task complete opens time logging modal
- [ ] Quick options: "As estimated", "+25%", "-25%"
- [ ] Can enter exact time manually
- [ ] Actual time saved to subtask
- [ ] Calibration multiplier calculates correctly
- [ ] Calibration insight shows after 3+ completed tasks
- [ ] Insight updates after each completion

---

## Out of Scope (Deferred)

- Adjusting displayed estimates based on multiplier
- Persisting calibration to database
- Historical calibration trends
- Per-category calibration
