# Framework Review

Run a Time Boss framework alignment review using the time-boss-framework agent.

## Instructions

You are invoking the time-boss-framework agent to review the specified target against the Time Boss operating system principles.

### Step 1: Load the Agent
Read `.claude/agents/time-boss-framework.md` to understand the framework principles, review methodology, and output format.

### Step 2: Load Framework Context
Read the framework context files:
- `context/timebossapp-notes.txt` — Original problem statement and insights
- `docs/time-boss-app-prd.md` — Framework alignment section and glossary

Pay special attention to:
- The 10 Time Boss principles
- The minimum viable loop
- The trade-off acknowledgment concept
- What's explicitly listed as in-scope vs. out-of-scope

### Step 3: Determine Review Scope

Based on the argument provided (or lack thereof), determine what to review:

| Argument | Scope |
|----------|-------|
| (none) | Full project review: PRD + all milestone plans + key components |
| `prd` | Only `docs/time-boss-app-prd.md` |
| `milestone-N` | Specific milestone plan (e.g., `plans/milestone-3-weekly-commit-flow.md`) |
| `principle:N` | Review implementation of specific principle (e.g., `principle:7` for Commit) |
| `loop` | Review the minimum viable loop implementation |
| File path | Review the specific file |

### Step 4: Read Target Files

Read the files in scope. For a full review, read:
1. `docs/time-boss-app-prd.md`
2. All files in `plans/` directory
3. Key component files related to the principles

For principle-specific reviews, identify and read relevant files:
- Principle 1 (Weekly Planning): `src/app/page.tsx`, week components
- Principle 2 (Daily Review): `src/app/today/page.tsx`, `DailyReviewModal`
- Principle 3 (Backlog): Backlog components
- Principle 4 (Discrete Tasks): Decomposition modal, task types
- Principle 5 (Whirlwind): `useCapacityCalculation.ts`, capacity display
- Principle 6 (Overflow): `OverflowModal`, capacity enforcement
- Principle 7 (Commit): `CommitConfirmationModal`, weekly plan state
- Principle 8 (No Open Loops): Task status handling, daily review
- Principle 9 (Time Boundaries): Time block boundary handling
- Principle 10 (Calibration): Calibration logic, actual time logging

### Step 5: Conduct Review

Apply the time-boss-framework methodology:
1. Identify which principles are being implemented
2. Check alignment with framework expectations
3. Note gaps, drift, or conflicts
4. Detect scope creep that dilutes the core thesis
5. Generate prioritized findings

### Step 6: Output Findings

Present findings in the prioritized list format specified in the agent definition:
- Group by priority (Critical > High > Medium > Low)
- Include all four types (Validate, Refine, Add, Remove)
- Reference specific principles
- Make recommendations actionable

## Example Invocations

```
/framework-review
→ Full project review against all principles

/framework-review prd
→ Review PRD for framework alignment

/framework-review milestone-3
→ Review weekly commit flow milestone

/framework-review principle:7
→ Review implementation of "Commit to the Plan" principle

/framework-review loop
→ Review the minimum viable loop implementation

/framework-review src/hooks/useCapacityCalculation.ts
→ Review specific file against framework
```

## Output Template

```
# Time Boss Framework Review

**Scope:** [What was reviewed]
**Date:** [Current date]
**Framework Reference:** docs/time-boss-app-prd.md, context/timebossapp-notes.txt

---

## Summary

- **Validates:** X findings (aligned with framework)
- **Refinements:** X findings (drift from framework)
- **Additions:** X findings (missing framework elements)
- **Removals:** X findings (conflicts with philosophy)

## Principle Coverage

| Principle | Status | Notes |
|-----------|--------|-------|
| 1. Weekly Planning | ✅/⚠️/❌ | [Brief note] |
| 2. Daily Review | ✅/⚠️/❌ | [Brief note] |
| 3. Backlog | ✅/⚠️/❌ | [Brief note] |
| 4. Discrete Tasks | ✅/⚠️/❌ | [Brief note] |
| 5. Whirlwind Buffer | ✅/⚠️/❌ | [Brief note] |
| 6. Overflow Resolution | ✅/⚠️/❌ | [Brief note] |
| 7. Commit | ✅/⚠️/❌ | [Brief note] |
| 8. No Open Loops | ✅/⚠️/❌ | [Brief note] |
| 9. Time Boundaries | ✅/⚠️/❌ | [Brief note] |
| 10. Calibration | ✅/⚠️/❌ | [Brief note] |

---

## Critical Findings

[List any Critical priority findings first]

## High Priority Findings

[High priority findings]

## Medium Priority Findings

[Medium priority findings]

## Low Priority Findings

[Low priority findings]

---

## Core Thesis Alignment

**Is the core thesis preserved?** [Yes/Partial/No]
> "Your to-do list and calendar are the same thing."

[Assessment of whether the implementation maintains this fundamental insight]

## Scope Creep Watch

[Any features or plans that might dilute the core thesis]

## Recommended Next Steps

1. [Most important action to improve framework alignment]
2. [Second priority]
3. [Third priority]
```

---

**Argument:** $ARGUMENTS
