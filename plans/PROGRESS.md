# Time Boss - Milestone Progress

## Current Status

**Active Milestone:** Milestone 3 - Weekly Commit Flow
**Last Updated:** 2024-12-31

---

## Milestones

### Milestone 1: Data Foundation ✅
**Status:** Complete
**Completed:** 2024-12-31

Data persists, weekly planning works end-to-end.

**What was built:**
- Supabase database with full schema (profiles, categories, backlog_items, subtasks, time_blocks, external_events, weekly_plans)
- Row Level Security (RLS) policies for all tables
- Email magic link authentication
- API routes for all entities (CRUD operations)
- React hooks for data fetching (`useAppData`, `useBacklog`, `useSubtasks`, etc.)
- Main page wired to real data with optimistic updates

**Key files:**
- `supabase/schema.sql` - Database schema and RLS
- `src/lib/supabase/` - Supabase client configuration
- `src/app/api/` - All API routes
- `src/hooks/useData.ts` - Data fetching hooks
- `src/lib/api.ts` - Client-side API wrapper

---

### Milestone 2: LLM Decomposition ✅
**Status:** Complete
**Completed:** 2024-12-31

AI-powered task breakdown into schedulable subtasks.

**What was built:**
- Anthropic SDK integration for Claude API calls
- `/api/decompose` endpoint that calls Claude claude-sonnet-4-20250514
- DecompositionModal with loading spinner and error handling
- LLM-generated subtasks with title, definitionOfDone, estimatedMinutes, rationale
- Subtasks marked with `llmGenerated: true` and `llmRationale` when saved

**Key files:**
- `src/app/api/decompose/route.ts` - Claude API integration
- `src/components/modals/DecompositionModal.tsx` - Updated with API calls

---

### Milestone 3: Weekly Commit Flow ⏳
**Status:** Not Started

Weekly planning commitment workflow.

**Goal:** User commits to a weekly plan, can't modify committed items without explicit "re-plan" action.

---

### Milestone 4: Daily Review ⏳
**Status:** Not Started

End-of-day review and overflow handling.

**Goal:** Daily review flow to mark tasks complete/incomplete and handle overflow.

---

### Milestone 5: Time Block Boundaries ⏳
**Status:** Not Started

Respect calendar and work hour constraints.

**Goal:** Time blocks respect external events and work hours, visual timeline shows conflicts.

---

### Milestone 6: Calibration Loop ⏳
**Status:** Not Started

Estimation accuracy feedback loop.

**Goal:** Track actual vs estimated time, surface calibration insights.

---

## Legend

- ✅ Complete
- 🚧 In Progress
- ⏳ Not Started
