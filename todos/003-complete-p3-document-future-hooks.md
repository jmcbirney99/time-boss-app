---
status: complete
priority: p3
issue_id: "003"
tags: [documentation, maintainability, code-clarity]
dependencies: []
---

# Document Future-Milestone Hooks

## Problem Statement
Several hooks in `useData.ts` appear unused but are actually scaffolding for planned features in Milestones 3-4. Without documentation, future developers (or AI reviewers) may incorrectly flag these as dead code.

## Findings
- `useCategories()` - For backlog organization (Milestone 1 schema ready)
- `useWeeklyPlan()` - For Milestone 3: Weekly Commit Flow
- `useDailyReviews()` - For Milestone 4: Daily Review
- `useExternalEvents()` - For calendar integration (future)
- Code simplicity review incorrectly flagged as "68% unused code"

## Proposed Solutions

### Option 1: Add clarifying comments to hooks
- **Pros**: Quick, prevents future confusion, documents intent
- **Cons**: Comments can become stale
- **Effort**: Small (15 minutes)
- **Risk**: Low

## Recommended Action
Add a brief comment above each "unused" hook explaining which milestone it supports:

```typescript
/**
 * Hook for weekly plan state (Milestone 3: Weekly Commit Flow)
 * @see plans/milestone-3-weekly-commit-flow.md
 */
export function useWeeklyPlan() { ... }
```

## Technical Details
- **Affected Files**: `src/hooks/useData.ts`
- **Related Components**: None
- **Database Changes**: No

## Acceptance Criteria
- [ ] Each future-milestone hook has a comment referencing its milestone
- [ ] Comments include `@see` reference to the plan file

## Work Log

### 2025-12-28 - Approved for Work (Custom)
**By:** Claude Triage System
**Actions:**
- Original issue: "Delete unused hooks"
- User requested verification against planned features
- Found all hooks are intentional scaffolding for Milestones 3-4
- Changed to documentation task instead of deletion

**Learnings:**
- Always cross-reference "unused code" with planned features before recommending deletion
- Scaffolding for future work is valuable, not waste

## Notes
Source: Plan review triage session on 2025-12-28
Modified: User correctly identified hooks match planned milestones
