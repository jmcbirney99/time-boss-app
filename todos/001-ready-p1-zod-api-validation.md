---
status: ready
priority: p1
issue_id: "001"
tags: [security, type-safety, api, validation]
dependencies: []
---

# Missing Input Validation at API Boundaries

## Problem Statement
All 11 API routes accept request bodies without validation. External data passes directly to Supabase queries with only `as` type assertions, which provide zero runtime protection against malformed or malicious input.

## Findings
- All POST/PUT/PATCH handlers use unsafe type assertions
- Location: `src/app/api/backlog/route.ts:17-19` and all other API routes
- No runtime validation of incoming data
- Malformed requests could cause cryptic Supabase errors or data corruption

## Proposed Solutions

### Option 1: Add Zod schemas for all API payloads
- **Pros**: Type-safe, generates TypeScript types, great error messages
- **Cons**: Adds dependency, requires schema maintenance
- **Effort**: Medium (4 hours)
- **Risk**: Low

## Recommended Action
1. Install Zod: `npm install zod`
2. Create `src/lib/schemas.ts` with schemas for all entities
3. Add `.parse()` validation at each API route entry point
4. Return 400 with validation errors for invalid input

## Technical Details
- **Affected Files**: All files in `src/app/api/*/route.ts`
- **Related Components**: None (API layer only)
- **Database Changes**: No

## Acceptance Criteria
- [ ] Zod installed and schemas created for all entities
- [ ] All POST/PUT/PATCH handlers validate input with `.parse()`
- [ ] Invalid input returns 400 with descriptive error message
- [ ] TypeScript types derived from Zod schemas (single source of truth)
- [ ] Tests pass

## Work Log

### 2025-12-28 - Approved for Work
**By:** Claude Triage System
**Actions:**
- Issue approved during triage session
- Status: **ready** → Ready to work on

**Learnings:**
- API validation is a P1 security concern that should be addressed before adding more features

## Notes
Source: Plan review triage session on 2025-12-28
Reviewers: Kieran TypeScript Reviewer, Code Simplicity Reviewer, Architecture Strategist
