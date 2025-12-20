# Behavioral Review

Run a behavioral science review of Time Boss using the behavioral-economist agent.

## Instructions

You are invoking the behavioral-economist agent to review the specified target through a behavioral science lens.

### Step 1: Load the Agent
Read `.claude/agents/behavioral-economist.md` to understand the review methodology, output format, and stance on contested topics.

### Step 2: Load the Research Foundation
Read `context/behavioral-research.md` — this is the evidence base for all recommendations. Pay special attention to:
- The Comparative Evidence Matrix (effect sizes, evidence strength)
- The Debate Dossiers (nuanced positions on contested topics)
- Boundary conditions and risks

### Step 3: Determine Review Scope

Based on the argument provided (or lack thereof), determine what to review:

| Argument | Scope |
|----------|-------|
| (none) | Full project review: PRD + all milestone plans |
| `prd` | Only `docs/time-boss-app-prd.md` |
| `milestone-N` | Specific milestone plan (e.g., `plans/milestone-3-weekly-commit-flow.md`) |
| `feature:X` | Search for and review components related to feature X |
| File path | Review the specific file |

### Step 4: Read Target Files

Read the files in scope. For a full review, read:
1. `docs/time-boss-app-prd.md`
2. All files in `plans/` directory
3. Key component files if reviewing implementation

### Step 5: Conduct Review

Apply the behavioral-economist methodology:
1. Identify behavior change mechanisms being used
2. Check alignment with research evidence
3. Note conflicts, gaps, and opportunities
4. Generate prioritized findings

### Step 6: Output Findings

Present findings in the prioritized list format specified in the agent definition:
- Group by priority (Critical > High > Medium > Low)
- Include all four types (Validate, Refine, Add, Remove)
- Cite specific research evidence for each finding
- Make recommendations actionable

## Example Invocations

```
/behavioral-review
→ Full project review

/behavioral-review prd
→ Review PRD only

/behavioral-review milestone-3
→ Review weekly commit flow milestone

/behavioral-review feature:decomposition
→ Review LLM decomposition feature

/behavioral-review src/components/modals/OverflowModal.tsx
→ Review specific component
```

## Output Template

```
# Behavioral Science Review

**Scope:** [What was reviewed]
**Date:** [Current date]
**Research Foundation:** context/behavioral-research.md

---

## Summary

- **Validates:** X findings (things working well)
- **Refinements:** X findings (adjust based on research)
- **Additions:** X findings (missing opportunities)
- **Removals:** X findings (may backfire)

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

## Key Themes

[2-3 overarching themes from the review]

## Recommended Next Steps

1. [Most important action]
2. [Second priority]
3. [Third priority]
```

---

**Argument:** $ARGUMENTS
