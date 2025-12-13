# Time Boss App
## Product Requirements Document

**Author:** Jon
**Last Updated:** December 2025
**Status:** Ready for MVP Implementation

---

## TL;DR

People routinely overcommit because standard to-do and calendar tools ignore true personal capacity. This app unifies a to-do backlog with a capacity-aware, calendar-based scheduling system, powered by LLM-driven task breakdown and estimation.

**Core Thesis:** Your to-do list and calendar are the same thing. If a task isn't scheduled on your calendar, it doesn't exist as a real commitment.

**The Problem Being Solved:** Jon uses iOS Reminders effectively for low-friction capture, but fails at:
1. Estimating how long tasks will take (overwhelmed by the mental overhead)
2. Mapping estimates to available calendar time
3. Actually allocating specific time slots for tasks
4. Learning from actual time spent to improve future estimates

**Key Differentiators:**
- Backlog with integrated weekly planning ritual
- Whirlwind buffer (40% default) that accounts for reality
- LLM-powered task decomposition that removes estimation friction
- Real-time time block boundary handling with voice capture
- Calibration loop that learns from actual vs. estimated time

---

## The Minimum Viable Loop

This is the core behavioral change the app must enable:

```
┌─────────────────────────────────────────────────────────────────┐
│                     WEEKLY PLANNING (Sunday)                     │
│  See backlog → Get LLM estimates → Drag to calendar → Commit    │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                     DAILY REVIEW (Morning)                       │
│  What didn't get done yesterday? → Reschedule → Confirm today   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                     DURING THE DAY                               │
│  Reference task details → Do the work → Time block ends...      │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                     TIME BLOCK BOUNDARY                          │
│  Done? → Mark complete (log actual time)                        │
│  Not done? → Voice capture progress → Schedule remainder        │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                    (feeds back into calibration)
```

### Loop Details

| Moment | What happens | Key UX |
|--------|--------------|--------|
| **Sunday planning** | Review backlog, get LLM estimates, drag to week, commit | Week view + commit button |
| **Morning review** | See today, handle yesterday's incomplete, confirm | Today view + "start day" modal |
| **Task boundary** | Time's up nudge → done or capture progress via voice → reschedule remainder | Notification + voice input |
| **Mark complete** | Log "took longer/shorter/as expected" | 1-tap or voice after completion |

### What "Commit" Means

- Enables notifications for scheduled task boundaries
- Creates a psychological contract with your future self
- Plan remains adaptable (can still move tasks)
- Tracks commitment vs. completion for reflection

---

## Time Boss Framework Alignment

This app implements the Time Boss operating system:

| Time Boss Principle | Implementation |
|---------------------|----------------|
| **Weekly Planning Meeting** | Sunday ritual: reflect, dump, prioritize, schedule, commit |
| **Daily Review Meeting** | Morning ritual: reconcile yesterday, confirm today |
| **Backlog (long-term memory)** | All tasks live here until scheduled |
| **Daily List (short-term memory)** | Not in MVP - captured via voice during day |
| **1-4 hour discrete tasks** | LLM breaks down tasks with clear definition of done |
| **40% Whirlwind buffer** | Capacity calculation reserves time for reality |
| **Deal with things that don't fit** | Overflow resolution: defer, delegate, delete, downsize |
| **Commit to the plan** | Explicit commit action with optional share |
| **No open loops** | Every task has a home: calendar, backlog, or deleted |

### Additions Beyond Time Boss Framework

These address Jon's specific pain points:

1. **LLM-assisted estimation** - Removes the mental overhead that blocks estimation
2. **Calibration loop** - Tracks actual vs. estimated to improve over time
3. **Time block boundary nudge** - Protects the day from task blowup; voice capture for low friction
4. **Voice input throughout** - Reduces friction for capture and progress updates

---

## Glossary

| Term | Definition |
|------|------------|
| **Backlog Item** | A captured task idea that hasn't been decomposed or scheduled. Lives outside the calendar. |
| **Subtask** | An atomic, actionable unit of work (1-4 hours) with a clear definition of done. |
| **Time Block** | A scheduled calendar slot assigned to a specific subtask. |
| **Capacity** | Available work hours minus external events minus whirlwind buffer. |
| **Whirlwind** | Buffer time (default 40%) reserved for interruptions, email, underestimated tasks, and mental breaks. |
| **Overflow** | When planned work exceeds available capacity; requires explicit resolution. |
| **Weekly Planning** | The primary ritual where users decompose, estimate, and schedule work for the coming week. |
| **Daily Review** | Morning habit to reconcile what got done yesterday, handle incomplete work, and confirm today. |
| **Time Block Boundary** | The moment when a scheduled task's allocated time ends. |
| **Calibration** | The system's learned adjustment factor based on actual vs. estimated time history. |

---

## Goals

### User Goals
1. See exactly how much can realistically fit in a week by comparing capacity to planned commitments
2. Get help estimating tasks so estimation doesn't become a blocker
3. Enter each week with high commitment confidence; reduce overwhelm
4. Protect the day from individual tasks blowing up the schedule
5. Learn over time to estimate more accurately

### Non-Goals (MVP)
- Team coordination or shared calendars
- Native mobile app (responsive web is sufficient)
- Complex stakeholder scheduling
- Browser notifications (manual triggers only in MVP)
- Onboarding flow

---

## User Stories

### Weekly Planning Flow

| # | Story | Acceptance Criteria |
|---|-------|---------------------|
| 1 | As a user, I want to quickly add task ideas to a backlog so I never lose track of important to-dos | - Quick-add input always visible<br>- Voice input option for low friction<br>- Task appears immediately in backlog |
| 2 | As a user, I want LLM help breaking large tasks into 1-4 hour subtasks with time estimates | - "Decompose" button triggers LLM<br>- Shows loading state<br>- Returns subtasks with estimates and rationale<br>- Can edit before accepting |
| 3 | As a user, I want to see my true capacity before scheduling | - Shows: total hours, external events, whirlwind buffer, plannable time<br>- Updates in real-time as I schedule |
| 4 | As a user, I want to drag subtasks to specific calendar slots | - Drag from backlog to day/time<br>- Visual feedback during drag<br>- Snaps to time increments |
| 5 | As a user, when I've scheduled more than capacity, I want clear options to resolve overflow | - Overflow indicator when scheduled > capacity<br>- Modal with options: defer, delete, shrink estimate<br>- Cannot commit until resolved |
| 6 | As a user, I want to commit to my weekly plan | - "Commit" button locks in plan<br>- Enables time block notifications<br>- Records commitment for reflection |

### Daily Review Flow

| # | Story | Acceptance Criteria |
|---|-------|---------------------|
| 7 | As a user, I want a morning review to reconcile yesterday and confirm today | - Shows yesterday's incomplete tasks<br>- For each: reschedule, defer, or delete<br>- Shows today's schedule<br>- "Start Day" confirms |
| 8 | As a user, I want to see only today's scheduled tasks in a focused view | - Today view shows time blocks in order<br>- Each block shows task title, time, parent backlog item<br>- Current/next task highlighted |

### During the Day

| # | Story | Acceptance Criteria |
|---|-------|---------------------|
| 9 | As a user, when my time block ends, I want a nudge asking if I'm done | - Notification at block end time<br>- Options: "Done" or "Need more time" |
| 10 | As a user, if I'm not done, I want to quickly capture progress and schedule the remainder | - Voice input: "Here's what I got done..."<br>- LLM creates follow-up task with remaining work<br>- Prompts to schedule for tomorrow or later |
| 11 | As a user, when I complete a task, I want to quickly log actual time | - "How long did this take?" prompt<br>- Quick options: "As estimated", "Longer", "Shorter"<br>- Or enter specific time |

### Calibration

| # | Story | Acceptance Criteria |
|---|-------|---------------------|
| 12 | As a user, I want the system to learn from my actual times and improve estimates | - Tracks actual vs. estimated for all completed tasks<br>- Calculates rolling average ratio<br>- Shows: "Your tasks typically take 1.3x longer"<br>- Optionally adjusts displayed estimates |

---

## Implementation Status

### What's Built

| Component | Status | Notes |
|-----------|--------|-------|
| Weekly Planning View | ✅ Complete | Split-screen layout, drag-and-drop working |
| Backlog View | ✅ Complete | List with priority ordering, status badges |
| Today View | ✅ Complete | Daily task execution interface |
| Capacity Calculation | ✅ Complete | Formula matches Time Boss exactly |
| Overflow Detection | ✅ UI Only | Visual indicators exist, not enforced |
| Decomposition Modal | ✅ UI Only | Modal renders, no LLM integration |
| Drag-and-Drop | ✅ Complete | dnd-kit implementation working |
| Mobile Responsive | ✅ Complete | Bottom sheet overlays for mobile |
| Sage Green Theme | ✅ Complete | Calm aesthetic |

### What's Missing for MVP

| Feature | Priority | Why Critical |
|---------|----------|--------------|
| Data Persistence | **Critical** | No database, all mock data |
| LLM Decomposition | **Critical** | Core to removing estimation friction |
| Daily Review Flow | **Critical** | Part of minimum viable loop |
| Commit Action | **Critical** | Enables notifications, completes weekly flow |
| Time Block Boundary Nudge | **High** | Protects the day from task blowup |
| Actual Time Logging | **High** | Required for calibration loop |
| Voice Input | **High** | Low-friction capture and progress updates |
| Calibration Display | **Medium** | Learning feedback |
| Authentication | **Medium** | Required for persistence, can use simple auth initially |
| Google Calendar Sync | **Low** | Can use hardcoded events for MVP |
| Settings UI | **Low** | Hardcode defaults for MVP |

---

## Data Schema

### Core Entities

```typescript
interface User {
  id: string;
  name: string;
  workHours: {
    start: string;  // "08:00"
    end: string;    // "17:00"
    days: string[]; // ["monday", "tuesday", ...]
  };
  whirlwindPercentage: number;  // 0.40
  estimationMultiplier: number; // learned, starts at 1.0
}

interface BacklogItem {
  id: string;
  title: string;
  description?: string;
  status: 'backlog' | 'decomposed' | 'archived';
  priorityRank: number;
  subtaskIds: string[];
  createdAt: string;
}

interface Subtask {
  id: string;
  backlogItemId: string;
  title: string;
  definitionOfDone: string;
  estimatedMinutes: number;
  actualMinutes?: number;
  status: 'estimated' | 'scheduled' | 'in_progress' | 'completed' | 'overflow' | 'deferred';
  scheduledBlockId?: string;
  llmGenerated: boolean;
  llmRationale?: string;
  createdAt: string;
  completedAt?: string;
}

interface TimeBlock {
  id: string;
  subtaskId: string;
  date: string;        // "2025-01-15"
  startTime: string;   // "09:00"
  endTime: string;     // "10:30"
  status: 'scheduled' | 'completed' | 'partial';
}

interface WeeklyPlan {
  id: string;
  weekStartDate: string;  // Monday of the week
  status: 'planning' | 'committed';
  totalCapacityMinutes: number;
  scheduledMinutes: number;
  overflowSubtaskIds: string[];
  committedAt?: string;
  reflectionNotes?: {
    keep: string;
    start: string;
    stop: string;
  };
}

interface DailyReview {
  id: string;
  date: string;
  completedSubtaskIds: string[];
  incompleteSubtaskIds: string[];
  overflowActions: Array<{
    subtaskId: string;
    action: 'rescheduled' | 'deferred' | 'deleted';
    newDate?: string;
  }>;
  notes?: string;
  completedAt?: string;
}

interface ExternalEvent {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
}
```

---

## Sample Data

### Current State
The app uses mock data in `src/data/mockData.ts` with generic work-focused examples (e.g., "Q4 Marketing Campaign", "Website Redesign"). This doesn't reflect the personal task management use case.

### Target State
Replace mock data with realistic personal tasks from Jon's iOS Reminders, organized by category:

**Categories to include:**
- Housework / Home maintenance
- Family health
- Career advancement / Professional development
- Financial tasks
- Personal projects

**Sample data requirements:**
- Mix of small tasks (30-60 min) and larger projects needing decomposition
- Variety of urgency levels
- Some recurring patterns (weekly, monthly tasks)
- Real-world messiness (vague tasks that need clarification)

### Data Import
Jon's iOS Reminders will be exported and converted to backlog items. Categories from Reminders will map to tags or parent groupings in the app.

**Import mapping:**
| iOS Reminders Field | Time Boss Field |
|---------------------|-----------------|
| Title | BacklogItem.title |
| Notes | BacklogItem.description |
| List name | Category tag (future feature) |
| Due date | Informational only (not scheduled until planned) |
| Priority | BacklogItem.priorityRank (relative ordering) |

---

## Capacity Formula

```
Daily Capacity = (Work Hours) - (External Events) - (Whirlwind Buffer)

Where:
- Work Hours = end_time - start_time (e.g., 17:00 - 08:00 = 540 minutes)
- External Events = sum of blocking calendar events for that day
- Whirlwind Buffer = (Work Hours - External Events) × whirlwind_percentage

Example:
- Work day: 9 hours (540 min)
- Meetings: 2 hours (120 min)
- Available before whirlwind: 7 hours (420 min)
- Whirlwind (40%): 168 min
- Plannable Capacity: 252 min (~4.2 hours)

Weekly Capacity = sum of Daily Capacity for each work day
```

**Display to user:** "You have 4h 12m of plannable time on Monday"

---

## LLM Integration

### Decomposition Request

**System Prompt:**
```
You are helping a busy knowledge worker break down tasks into actionable subtasks.

Rules:
- Each subtask should be 1-4 hours (60-240 minutes)
- Include a clear "definition of done" - what does completion look like?
- Be realistic about time estimates based on typical complexity
- Maximum 8 subtasks per backlog item
- If the task is too large, suggest breaking it into multiple backlog items
```

**Input:**
```json
{
  "backlogItem": {
    "title": "Launch side project",
    "description": "Get the MVP out the door for the productivity app idea"
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
      "title": "Define MVP scope and success criteria",
      "definitionOfDone": "Written document with 3-5 core features and measurable launch criteria",
      "estimatedMinutes": 90,
      "rationale": "Need clear scope before any building starts"
    }
  ],
  "totalEstimatedMinutes": 270,
  "assumptions": "Assuming you have a clear product vision.",
  "suggestedNote": "This is a large project. Consider creating separate backlog items for design vs. development."
}
```

### Progress Capture (Voice → Follow-up Task)

**Input:** Voice transcription of progress update
**Output:** New subtask with remaining work and suggested estimate

---

## UI Requirements

### Screens & Views

| Screen/View | Purpose | Status | File(s) |
|-------------|---------|--------|---------|
| Weekly Planning View | Primary workflow - backlog + week overview | ✅ Built | `src/app/page.tsx` |
| Week Overview | 5-day grid with day cards | ✅ Built | `src/components/week/WeekOverview.tsx` |
| Day Card | Individual day in week grid, clickable to expand | ✅ Built | `src/components/week/DayCard.tsx` |
| Timeline Drawer (Desktop) | Expanded day timeline, inline below day card | ✅ Built | `src/components/timeline/TimelineDrawer.tsx` |
| Timeline Overlay (Mobile) | Expanded day timeline, full-screen modal | ✅ Built | `src/components/timeline/TimelineOverlay.tsx` |
| Backlog List | Left sidebar with task organization | ✅ Built | `src/components/backlog/BacklogList.tsx` |
| Today View | Daily execution focus | ✅ Built | `src/app/today/page.tsx`, `src/components/today/TodayView.tsx` |
| Top Bar | Navigation + capacity summary | ✅ Built | `src/components/layout/TopBar.tsx` |
| Decomposition Modal | LLM task breakdown UI | ✅ UI Only | `src/components/modals/DecompositionModal.tsx` |
| Overflow Modal | Over-capacity resolution | ✅ UI Only | `src/components/modals/OverflowModal.tsx` |
| Daily Review Modal | Morning reconciliation | ❌ Not built | — |
| Task Boundary Modal | End-of-block nudge | ❌ Not built | — |
| Commit Confirmation | Weekly plan commitment | ❌ Not built | — |
| Settings Page | User configuration | ❌ Not built | — |

### Weekly Planning View

**Main Layout** (`src/app/page.tsx`):
- Split screen: Backlog list (left 1/3), Week overview (right 2/3)
- Responsive: stacks vertically on mobile

**Backlog List** (`src/components/backlog/BacklogList.tsx`):
- Three sections:
  - "Ready to Schedule" - unscheduled subtasks (draggable)
  - "In Progress" - decomposed parent items
  - "Needs Breakdown" - raw backlog items with "Break Down" button

**Week Overview** (`src/components/week/WeekOverview.tsx`):
- Week-level capacity summary in header
- 5 day cards (Mon-Fri) in grid
- Click day card → expands timeline below (desktop) or overlay (mobile)

**Day Card** (`src/components/week/DayCard.tsx`):
- Day name + date + "Today" badge
- Capacity bar showing utilization %
- Task count badge
- Over-capacity warning if scheduled > capacity
- Chevron indicates expanded state
- Droppable target for drag-and-drop

**Timeline Drawer/Overlay** (`TimelineDrawer.tsx` / `TimelineOverlay.tsx`):
- Hour grid (8am-5pm) with visual timeline
- Scheduled task blocks (sage) and external events (gray)
- Current time indicator (red dot + line)
- Summary footer (task count + meeting count)
- Close button to collapse

**Top Bar** (`src/components/layout/TopBar.tsx`):
- Navigation tabs: "Week" / "Today"
- Week navigation arrows (prev/next)
- Week date range display
- Capacity metrics: Total / Scheduled / Remaining
- Overflow badge + "Review Overflow" button if over capacity

### Today View

**Page** (`src/app/today/page.tsx`):
- Single-day focus showing scheduled time blocks
- Back to Week navigation

**View Component** (`src/components/today/TodayView.tsx`):
- Date header with progress bar (completed/total)
- Task cards sorted by start time
- Task count and completion ratio

**Task Card** (`src/components/today/TaskCard.tsx`):
- Time range display
- Task title + parent item name
- Definition of done text
- "Mark Complete" button
- "Reschedule" link
- Completed state: green background, strikethrough

### Modals (Built)

**Decomposition Modal** (`src/components/modals/DecompositionModal.tsx`):
- Parent task info display
- Editable subtask rows (title, definition of done, estimate)
- Time estimate dropdown (30m, 60m, 90m, 120m, 180m, 240m)
- Add/remove subtask buttons
- Total estimate summary
- Save/Cancel buttons
- **Note:** Currently loads mock suggestions, not wired to LLM

**Overflow Modal** (`src/components/modals/OverflowModal.tsx`):
- Red warning header showing overflow amount
- One row per over-capacity subtask
- Resolution options: Reschedule next week, Move to backlog, Reduce estimate, Delete
- Progress indicator (X of Y resolved)
- "Resolve & Commit" button (disabled until all resolved)
- **Note:** Exists but not enforced in workflow

### Modals (Not Built)

**Daily Review Modal:**
- Triggered manually or at configurable morning time
- Sections:
  1. Yesterday's incomplete tasks (with resolution actions)
  2. Today's schedule preview
  3. "Start Day" confirmation

**Task Boundary Modal:**
- Triggered when time block ends
- Options:
  - "Done" → Mark complete, log actual time
  - "Need more time" → Voice capture progress → Create follow-up → Schedule

**Commit Confirmation Modal:**
- Summary of weekly plan
- Confirm commitment action
- Enables notifications

---

## Color Palette

| Element | Color | Hex |
|---------|-------|-----|
| External events | Gray | #9CA3AF |
| Scheduled tasks | Sage | #84A98C |
| Overflow indicator | Coral | #F4A89A |
| Completed tasks | Dark sage | #6B8B73 |
| Available time | Paper | #fafaf9 |
| Current time block | Highlighted sage | #6B8B73 border |

---

## MVP Feature Milestones

### Milestone 1: Data Foundation
**Goal:** Data persists, weekly planning works end-to-end

- [ ] Supabase schema setup
- [ ] API routes for CRUD operations
- [ ] Replace mock data with real persistence
- [ ] Simple auth (can be email-only for MVP)

### Milestone 2: LLM Decomposition
**Goal:** Real AI-powered task breakdown

- [ ] Claude API integration
- [ ] Decomposition endpoint
- [ ] Wire DecompositionModal to real API
- [ ] Store llm_generated and rationale

### Milestone 3: Weekly Commit Flow
**Goal:** Complete weekly planning ritual

- [ ] Commit button with confirmation
- [ ] Overflow resolution enforcement (can't commit if overflow)
- [ ] Weekly plan status tracking

### Milestone 4: Daily Review
**Goal:** Morning ritual works

- [ ] DailyReviewModal component
- [ ] Yesterday incomplete list with actions
- [ ] Today preview
- [ ] "Start Day" confirmation

### Milestone 5: Time Block Boundaries
**Goal:** Protect the day from task blowup

- [ ] Track current time vs. active block
- [ ] End-of-block nudge (in-app, not push notification)
- [ ] Voice input for progress capture
- [ ] Auto-create follow-up task with remainder

### Milestone 6: Calibration Loop
**Goal:** Learn from actual time

- [ ] Actual time logging on completion
- [ ] Calculate estimation multiplier (rolling 20 tasks)
- [ ] Display calibration insight
- [ ] Optionally adjust displayed estimates

---

## Technical Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 15 (App Router) |
| Styling | Tailwind CSS |
| Drag & Drop | @dnd-kit |
| Backend | Next.js API Routes |
| Database | Supabase (Postgres) |
| Auth | Supabase Auth (simple email or Google) |
| LLM | Claude API (claude-sonnet-4-20250514) |
| Voice | Web Speech API (browser native) |
| State | React Query + useState |
| Hosting | Vercel |

---

## Open Questions

1. **Voice input reliability:** Will Web Speech API be sufficient, or do we need a third-party service?
2. **Notification timing:** What's the right buffer before end of time block to nudge? 5 min? At end?
3. **Calibration display:** Should adjusted estimates be shown inline, or just as a note?

---

## Appendix: Files to Create

```
src/lib/supabase.ts              # Supabase client
src/lib/claude.ts                # Claude API client
src/lib/calibration.ts           # Estimation calibration logic
src/app/api/backlog/route.ts     # Backlog CRUD
src/app/api/subtasks/route.ts    # Subtasks CRUD
src/app/api/time-blocks/route.ts # Time blocks CRUD
src/app/api/weekly-plan/route.ts # Weekly plan operations
src/app/api/weekly-plan/commit/route.ts
src/app/api/daily-review/route.ts
src/app/api/decompose/route.ts   # LLM decomposition
src/components/modals/DailyReviewModal.tsx
src/components/modals/TaskBoundaryModal.tsx
src/components/modals/CommitConfirmationModal.tsx
src/components/VoiceInput.tsx    # Voice capture component
```

---

## Success Criteria

The MVP is complete when Jon can:

1. Add tasks to backlog
2. Get LLM help breaking them into estimated subtasks
3. Drag subtasks to calendar slots
4. See capacity vs. scheduled and resolve overflow
5. Commit to the weekly plan
6. Do a morning daily review to reconcile and confirm
7. Get a nudge when a time block ends
8. Mark tasks complete with actual time
9. See calibration insight after completing several tasks
