---
description: Transform meeting notes into action items, decisions, and summaries
---

# Meeting Notes Processing Workflow

Transform raw meeting notes into structured action items, decisions, and summaries.

---

## Phase 1: Input

Say:
"# Meeting Notes Processing

Let's turn your meeting notes into actionable outputs.

**Step 1: Load your notes**

Please @ mention your meeting notes, or paste them directly.

Example: `@meetings/product-review-2024-01-15.md`"

**STOP - Wait for user to provide meeting notes**

---

## Phase 2: Meeting Context

Say:
"**Step 2: Quick context**

1. **What type of meeting was this?**
   - Sprint planning
   - Product review
   - Stakeholder sync
   - 1:1
   - Brainstorm/working session
   - Other: [describe]

2. **Who needs to see the output?** (Team only / Leadership / Cross-functional)"

**STOP - Wait for user to provide context**

---

## Phase 3: Extraction

**ACTION:** Analyze the meeting notes to extract:

1. **Decisions made** - What was decided? By whom?
2. **Action items** - Who committed to do what? By when?
3. **Open questions** - What wasn't resolved?
4. **Key discussion points** - Important context
5. **Follow-ups needed** - Meetings to schedule, people to loop in

Say:
"**Processing your meeting notes...**

Here's what I extracted:

---

## Decisions Made
| Decision | Made By | Date |
|----------|---------|------|
| [Decision 1] | [Person] | [Date] |
| [Decision 2] | [Person] | [Date] |

---

## Action Items
| Action | Owner | Due Date | Status |
|--------|-------|----------|--------|
| [Action 1] | [Owner] | [Date] | ⬜ |
| [Action 2] | [Owner] | [Date] | ⬜ |
| [Action 3] | [Owner] | [Date] | ⬜ |

---

## Open Questions
- [Question 1] - needs input from [person/team]
- [Question 2] - to be discussed in [next meeting]

---

## Key Discussion Points
- [Summary of important discussion 1]
- [Summary of important discussion 2]

---

Did I miss anything or get anything wrong?"

**STOP - Wait for user to review and correct**

---

## Phase 4: Output Format

Say:
"**Step 4: Output format**

How would you like this packaged?

1. **Action items only** - Just the task list (for project management tools)
2. **Full summary** - Complete meeting summary for documentation
3. **Stakeholder update** - Brief update for people who weren't there
4. **All of the above**

Which format? (1, 2, 3, or 4)"

**STOP - Wait for format selection**

---

## Phase 5: Generate Outputs

**ACTION:** Generate selected formats:

### Action Items Only
```
## Action Items from [Meeting Name] - [Date]

- [ ] [Action] - @[owner] - due [date]
- [ ] [Action] - @[owner] - due [date]
- [ ] [Action] - @[owner] - due [date]
```

### Full Summary
```
# [Meeting Name] - [Date]

**Attendees:** [List]
**Duration:** [Time]

## Summary
[2-3 sentence overview of what was covered]

## Decisions
[Bulleted list]

## Action Items
[Table with owner, action, due date]

## Discussion Notes
[Key points from the meeting]

## Open Items
[Questions and follow-ups]

## Next Meeting
[Date and topics if known]
```

### Stakeholder Update
```
## Quick Update: [Meeting Name]

**TL;DR:** [1 sentence summary]

**Key Decisions:**
- [Decision 1]
- [Decision 2]

**Action Items:** [X] items assigned, [Y] due this week

**Needs Your Input:** [Any open questions for this person]
```

Save to appropriate location based on format.

Say:
"**Outputs Created!**

[List files created with paths]

**Quick Actions:**
- Copy action items to your project management tool
- Share summary with attendees for confirmation
- Send stakeholder update to relevant people

Anything else you need from these notes?"

---

## Notes for Claude

- Infer owners from context if not explicit ("I'll do X" = that person owns it)
- Infer due dates from context ("by end of week", "before next sprint")
- Flag action items without clear owners or dates
- Keep summaries concise - people won't read long meeting notes
- Distinguish decisions (final) from discussion points (ongoing)
