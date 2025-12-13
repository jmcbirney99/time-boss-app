---
description: Write a PRD with Socratic questioning and multi-perspective review
---

# PRD Writing Workflow

Guide the PM through writing a Product Requirements Document with Socratic questioning and multi-perspective review.

---

## Phase 1: Setup

Say:
"# PRD Writing Workflow

Let's write a great PRD together. I'll guide you through the process step by step.

**Step 1: Choose a template**

Which PRD format would you like to use?

1. **Lenny's PRD** - Minimal, 7 key questions. Great for quick iteration.
2. **Comprehensive PRD** - Full problem + solution alignment. Better for complex features.

Which do you prefer? (1 or 2)"

**STOP - Wait for user to choose template**

---

## Phase 2: Context Loading

Say:
"Great choice.

**Step 2: Load context**

Please @ mention any relevant files:
- Product documentation
- User research
- Competitive analysis
- Previous PRDs for reference

Example: `@context/PRODUCT.md @research/user-interviews.md`

Or say 'skip' if you don't have context files ready."

**STOP - Wait for user to provide context or skip**

---

## Phase 3: Feature Description

Say:
"**Step 3: Describe the feature**

In 1-2 sentences, what do you want to build? Don't worry about being perfect - we'll refine it together."

**STOP - Wait for user to describe feature**

---

## Phase 4: Socratic Questioning

Say:
"Now let's sharpen your thinking with 5 key questions. Answer each one, or say 'help' if you want me to suggest an answer.

---

**Question 1: Problem Clarity**
What specific user pain point does this solve? Can you describe a real scenario where a user experiences this pain?"

**STOP - Wait for answer**

Say:
"**Question 2: Solution Validation**
Why is this the right solution for that problem? What alternatives did you consider and reject?"

**STOP - Wait for answer**

Say:
"**Question 3: Success Criteria**
How will we know if this feature is successful? What metrics will move, and by how much?"

**STOP - Wait for answer**

Say:
"**Question 4: Scope & Tradeoffs**
What are we explicitly NOT doing as part of this? What's out of scope?"

**STOP - Wait for answer**

Say:
"**Question 5: Strategic Fit**
Why is this the right feature to build RIGHT NOW? How does it connect to company priorities?"

**STOP - Wait for answer**

---

## Phase 5: Draft Generation

Say:
"Excellent thinking. Now I'll generate 3 different PRD drafts, each with a different strategic angle:

1. **User-centric** - Emphasizes user pain and journey
2. **Business-centric** - Emphasizes metrics and ROI
3. **Technical-centric** - Emphasizes implementation and feasibility

Generating now..."

**ACTION:** Generate 3 PRD drafts using the selected template, incorporating:
- The feature description
- Answers to all 5 Socratic questions
- Any context from loaded files

Save each draft to:
- `prd/[feature]-draft-user-centric.md`
- `prd/[feature]-draft-business-centric.md`
- `prd/[feature]-draft-technical-centric.md`

Say:
"I've created 3 drafts in the `prd/` folder:
- `[feature]-draft-user-centric.md`
- `[feature]-draft-business-centric.md`
- `[feature]-draft-technical-centric.md`

Review them and let me know which version you prefer, or if you want to combine elements from multiple versions."

**STOP - Wait for user to review and choose**

---

## Phase 6: Multi-Perspective Review

Say:
"Great choice. Now let's get feedback from different perspectives before you share this more widely.

I'll have three specialists review your PRD:
- 🟣 **Engineer** - Technical feasibility
- 🔵 **Executive** - Business framing
- 🟢 **User Researcher** - User perspective

Running reviews..."

**ACTION:** Invoke sub-agents to review the chosen PRD:
- engineer agent for technical review
- executive agent for business review
- user-researcher agent for user perspective

Compile feedback into `prd/[feature]-reviews.md`

Say:
"Reviews complete! I've saved the feedback to `prd/[feature]-reviews.md`

**Summary of feedback:**

🟣 **Engineer says:** [1-2 sentence summary]

🔵 **Executive says:** [1-2 sentence summary]

🟢 **User Researcher says:** [1-2 sentence summary]

Would you like to address any of this feedback? Tell me what to change, or say 'finalize' to create the final version."

**STOP - Wait for user response**

---

## Phase 7: Finalization

If user wants changes, make them and ask again.

When user says 'finalize':

**ACTION:** Create final PRD incorporating any requested changes. Save to `prd/[feature]-prd-final.md`

Say:
"Your PRD is ready!

📄 **Final PRD:** `prd/[feature]-prd-final.md`

**What's next?**
- Share with stakeholders for review
- Use `/communicate` to create an executive summary
- Use the nano-banana skill to create visual mockups

Good luck with your feature! 🚀"

---

## Notes for Claude

- Be encouraging throughout - PRD writing is hard
- If user struggles with Socratic questions, offer to help with suggestions
- Keep drafts concise - PRDs should be scannable
- For the chosen template, follow its structure exactly
- Name files clearly with the feature name
