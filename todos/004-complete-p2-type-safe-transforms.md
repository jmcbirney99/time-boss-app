---
status: complete
priority: p2
issue_id: "004"
tags: [type-safety, api, transforms]
dependencies: ["001"]
---

# Unsafe Type Assertions in Transform Functions

## Problem Statement
The `api.ts` transform functions use `as` type assertions which provide no runtime safety. If the API response shape changes, TypeScript won't catch it at compile time, and undefined values will silently propagate through the app.

## Findings
- All transform functions use `as` assertions: `as BacklogItem`, `as Subtask`, etc.
- Location: `src/lib/api.ts:10-50`
- No runtime validation of API responses
- Schema drift between Supabase and TypeScript types goes undetected

## Current Pattern
```typescript
function transformBacklogItem(item: any): BacklogItem {
  return {
    id: item.id,
    title: item.title,
    // ... maps snake_case to camelCase
  } as BacklogItem;  // ← Unsafe assertion
}
```

## Proposed Solutions

### Option 1: Use Zod schemas to validate API responses
- **Pros**: Runtime validation, single source of truth with Issue #001
- **Cons**: Slight performance overhead (negligible for this app)
- **Effort**: Small (1 hour) - builds on Issue #001
- **Risk**: Low

## Recommended Action
1. After Issue #001 creates Zod schemas, extend them for API responses
2. Replace `as` assertions with `.parse()` calls
3. Transform functions become: `BacklogItemSchema.parse(transformedData)`
4. Invalid responses throw clear errors instead of silent corruption

## Technical Details
- **Affected Files**: `src/lib/api.ts`
- **Related Components**: All components using API data
- **Database Changes**: No
- **Dependencies**: Issue #001 (Zod schemas) must be completed first

## Acceptance Criteria
- [ ] All transform functions use Zod `.parse()` instead of `as` assertions
- [ ] Invalid API responses throw descriptive errors
- [ ] No `as` type assertions remain in api.ts
- [ ] Existing functionality preserved

## Work Log

### 2025-12-28 - Approved for Work
**By:** Claude Triage System
**Actions:**
- Issue approved during triage session
- Status: **ready** → Ready to work on
- Dependency on Issue #001 noted

**Learnings:**
- Type assertions are a code smell that hide runtime errors
- Zod provides both input validation and response validation

## Notes
Source: Plan review triage session on 2025-12-28
Reviewers: Kieran TypeScript Reviewer
