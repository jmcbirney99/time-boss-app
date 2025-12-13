---
description: Transform PM content into different formats (Slack, email, user stories, tickets)
---

# Communication Transformation Workflow

Transform PM content (research, PRDs, analysis) into different formats for different audiences.

---

## Phase 1: Source Content

Say:
"# Communication Transformation

Let's transform your content for different audiences.

**Step 1: What content do you want to transform?**

Please @ mention the source file(s):
- PRD, strategy doc, or analysis
- Research findings
- Meeting notes or updates
- Any PM artifact

Example: `@prd/onboarding-prd-final.md`"

**STOP - Wait for user to provide source content**

---

## Phase 2: Format Selection

Say:
"**Step 2: Which formats do you need?**

Select all that apply (comma-separated numbers):

1. **Slack update** - Quick team update (2-4 lines, casual)
2. **Executive email** - Leadership communication (strategic, high-level)
3. **Notion doc** - Comprehensive documentation (300-600 words)
4. **Release notes** - Customer-facing announcement (benefit-focused)
5. **Stakeholder update** - Formal progress report (status, risks, next steps)
6. **User story** - Engineering handoff (As/I/So format with acceptance criteria)
7. **Linear/Jira ticket** - Issue format (title, description, AC, priority)

Which formats? (e.g., '1, 2, 4')"

**STOP - Wait for user to select formats**

---

## Phase 3: Audience Context

Say:
"**Step 3: Audience context**

A few quick questions to tailor the tone:

1. **Urgency level?** (FYI / Action needed / Urgent)
2. **Audience familiarity?** (They know the context / Need background)
3. **Any specific ask?** (Approval, feedback, awareness, etc.)"

**STOP - Wait for user to provide context**

---

## Phase 4: Generate Formats

**ACTION:** Generate each selected format using these guidelines:

### Slack Update
- 2-4 lines max
- Emoji-friendly but professional
- TL;DR first, details available if asked
- End with clear next step or ask

### Executive Email
- Subject line that captures the key point
- 3-paragraph max structure:
  - What happened/changed (1 sentence)
  - Why it matters (impact, metrics)
  - What you need (decision, awareness, support)
- No jargon, outcome-focused
- Clear call to action

### Notion Doc
- 300-600 words
- Headers for scannability
- Context → Details → Next Steps structure
- Links to related docs
- Comprehensive but not exhaustive

### Release Notes
- Customer-facing language (no internal jargon)
- Benefit-focused (what they can do now)
- Clear, concise descriptions
- Grouped by feature area if multiple items

### Stakeholder Update
- Status summary (on track / at risk / blocked)
- Progress since last update
- Key decisions made
- Risks and mitigations
- Next steps with owners and dates
- Help needed

### User Story
- As a [user type], I want to [action], so that [benefit]
- Acceptance criteria (Given/When/Then or checklist)
- Edge cases noted
- Dependencies flagged

### Linear/Jira Ticket
- Clear title (verb + object)
- Problem statement
- Proposed solution
- Acceptance criteria
- Priority and effort estimate
- Labels/tags

---

Save all formats to `communications/[topic]-[date]/`

Say:
"**Communications Generated!**

I've created the following files in `communications/[topic]-[date]/`:

[List each file created]

**Preview:**

---
**Slack Update:**
[Show the Slack version]

---
**Executive Email:**
[Show subject and first paragraph]

---
[Continue for each format]

Review these and let me know if you want to adjust anything for a specific audience."

**STOP - Wait for user review**

---

## Phase 5: Refinement

If user requests changes:

**ACTION:** Update the specific format(s) based on feedback.

Say:
"Updated! Here's the revised version:

[Show updated content]

Anything else to adjust?"

**STOP - Wait for response**

When user is satisfied:

Say:
"Your communications are ready to send! 📤

**Quick tips:**
- Slack: Post in the relevant channel, @mention if action needed
- Email: Send to specific recipients, BCC for FYI
- Notion: Link from relevant project pages
- Release notes: Coordinate with marketing on timing

Good luck!"

---

## Notes for Claude

- Match tone to the format (casual for Slack, formal for exec email)
- Same information, different framing for each audience
- Customer-facing content should never include internal jargon
- Always include a clear ask or next step
- Keep exec communications SHORT - they won't read long emails
