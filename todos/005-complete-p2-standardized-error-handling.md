---
status: complete
priority: p2
issue_id: "005"
tags: [api, error-handling, ux, maintainability]
dependencies: ["002"]
---

# Inconsistent Error Handling Across API Routes

## Problem Statement
API routes have inconsistent error response formats. Some return `{ error: message }`, others vary. No standardized error codes or user-friendly messages. This makes frontend error handling complex and users see cryptic errors.

## Findings
- Error response shapes vary across routes
- Location: All files in `src/app/api/*/route.ts`
- Some routes lack try-catch blocks entirely
- Supabase errors leak directly to users
- No distinction between user errors (400) and server errors (500)

## Current Patterns (inconsistent)
```typescript
// Pattern 1 - basic
return NextResponse.json({ error: error.message }, { status: 500 });

// Pattern 2 - auth
return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

// Pattern 3 - missing
// No try-catch, errors bubble up unhandled
```

## Proposed Solutions

### Option 1: Create standardized error response helper
- **Pros**: Consistent format, easy to update, better UX
- **Cons**: Slight refactoring effort
- **Effort**: Small (1 hour)
- **Risk**: Low

## Recommended Action
1. Create error helper in `src/lib/api-utils.ts` (alongside Issue #002's withAuth)
2. Define standard error response format:
   ```typescript
   interface ApiError {
     error: {
       message: string;      // User-friendly message
       code?: string;        // Machine-readable code (e.g., "VALIDATION_ERROR")
       details?: unknown;    // Optional additional context
     }
   }
   ```
3. Create helper functions: `badRequest()`, `unauthorized()`, `serverError()`
4. Refactor all routes to use helpers

## Technical Details
- **Affected Files**: All files in `src/app/api/*/route.ts`, new `src/lib/api-utils.ts`
- **Related Components**: Frontend error handling
- **Database Changes**: No
- **Dependencies**: Issue #002 (auth middleware) - can share api-utils.ts file

## Acceptance Criteria
- [ ] Error helper functions created in `src/lib/api-utils.ts`
- [ ] All API routes use standardized error responses
- [ ] User-friendly messages for common errors (validation, auth, not found)
- [ ] Supabase errors wrapped with friendly messages
- [ ] Consistent error shape across all routes

## Work Log

### 2025-12-28 - Approved for Work
**By:** Claude Triage System
**Actions:**
- Issue approved during triage session
- Status: **ready** → Ready to work on

**Learnings:**
- Error handling consistency improves both DX and UX
- Can be combined with auth middleware work in api-utils.ts

## Notes
Source: Plan review triage session on 2025-12-28
Reviewers: Architecture Strategist
