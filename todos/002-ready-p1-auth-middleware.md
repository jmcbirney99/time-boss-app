---
status: ready
priority: p1
issue_id: "002"
tags: [architecture, dry, auth, middleware]
dependencies: []
---

# Duplicated Auth Pattern Across All Routes

## Problem Statement
Every API route contains identical 6-line auth check pattern. This violates DRY and makes auth changes error-prone (must update 11+ files manually).

## Findings
- Same auth pattern repeated in all 11 API route files
- Location: `src/app/api/*/route.ts` (all route handlers)
- Any auth change requires updating multiple files
- Risk of inconsistency if one file is missed

## Current Pattern (repeated 11 times)
```typescript
const supabase = await createClient();
const { data: { user } } = await supabase.auth.getUser();
if (!user) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

## Proposed Solutions

### Option 1: Create withAuth middleware wrapper
- **Pros**: Single source of truth, easy to add logging/rate-limiting later
- **Cons**: Slight abstraction overhead
- **Effort**: Small (1.5 hours)
- **Risk**: Low

## Recommended Action
1. Create `src/lib/api-utils.ts` with `withAuth` wrapper
2. Wrapper handles auth check and injects user into handler
3. Refactor all route handlers to use wrapper
4. Pattern: `export const GET = withAuth(async (request, user) => { ... })`

## Technical Details
- **Affected Files**: All files in `src/app/api/*/route.ts`
- **Related Components**: `src/lib/supabase/server.ts`
- **Database Changes**: No

## Acceptance Criteria
- [ ] `withAuth` wrapper created in `src/lib/api-utils.ts`
- [ ] All 11 route files refactored to use wrapper
- [ ] Auth logic exists in exactly one place
- [ ] Unauthorized requests still return 401
- [ ] All existing functionality preserved

## Work Log

### 2025-12-28 - Approved for Work
**By:** Claude Triage System
**Actions:**
- Issue approved during triage session
- Status: **ready** → Ready to work on

**Learnings:**
- DRY violations in auth patterns create security maintenance burden

## Notes
Source: Plan review triage session on 2025-12-28
Reviewers: Kieran TypeScript Reviewer, Code Simplicity Reviewer, Architecture Strategist
