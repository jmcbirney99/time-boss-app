---
description: Synthesize user research into actionable insights
---

# User Research Synthesis Workflow

Synthesize user research (interviews, surveys, feedback) into actionable insights.

---

## Phase 1: Data Loading

Say:
"# User Research Synthesis

Let's turn your research into actionable insights.

**Step 1: Load your research**

Please @ mention your research files:
- Interview transcripts
- Survey responses
- Support tickets or feedback
- User testing notes

Example: `@research/interviews/` (for a whole folder) or `@research/interview-1.md`"

**STOP - Wait for user to provide research files**

---

## Phase 2: Research Context

Say:
"**Step 2: Research context**

A few questions to focus the synthesis:

1. **What was the research question?** What were you trying to learn?
2. **Who did you talk to?** (User segment, sample size)
3. **Any hypotheses going in?** What did you expect to find?"

**STOP - Wait for user to provide context**

---

## Phase 3: Theme Extraction

**ACTION:** Analyze all research files to identify:
- Recurring themes (mentioned by 3+ users)
- Pain points and frustrations
- Unmet needs and desires
- Surprising findings
- Contradictions or tensions

Say:
"**Analyzing your research...**

I'm looking for patterns across all your interviews/responses. This may take a moment."

**ACTION:** Create initial theme analysis

Say:
"**Initial Themes Identified**

Here's what I'm seeing across your research:

**Top Pain Points:**
1. [Pain point] - mentioned by [X] users
   > \"[Supporting quote]\"

2. [Pain point] - mentioned by [X] users
   > \"[Supporting quote]\"

3. [Pain point] - mentioned by [X] users
   > \"[Supporting quote]\"

**Key Needs:**
1. [Need] - [frequency/strength]
2. [Need] - [frequency/strength]

**Surprising Findings:**
- [Finding that contradicted expectations or was unexpected]

Does this match your intuition from the research? Anything missing or surprising?"

**STOP - Wait for user feedback on themes**

---

## Phase 4: Deep Dive

Say:
"**Step 4: Deep dive**

Which theme or finding do you want to explore further?

I can:
- Pull more quotes for a specific theme
- Segment by user type to see if patterns differ
- Map themes to user journey stages
- Connect to existing product gaps

What would be most useful?"

**STOP - Wait for user direction**

**ACTION:** Perform requested deep dive analysis

---

## Phase 5: Synthesis Document

Say:
"**Step 5: Create synthesis document**

I'll now create a comprehensive research synthesis you can share with your team.

What format do you prefer?
1. **Executive summary** - 1-page overview for leadership
2. **Full synthesis** - Detailed findings with all supporting quotes
3. **Both** - Executive summary + detailed appendix"

**STOP - Wait for format selection**

**ACTION:** Create synthesis document with:

**Executive Summary (if selected):**
- Research question and methodology
- 3-5 key findings
- Implications for product
- Recommended next steps

**Full Synthesis (if selected):**
- Research overview (question, methodology, participants)
- Key findings with supporting evidence
- Theme-by-theme analysis with quotes
- User segments and differences
- Recommendations
- Appendix: Raw data summary

Save to `research/synthesis/[topic]-synthesis.md`

Say:
"**Research Synthesis Complete!**

📄 Saved to: `research/synthesis/[topic]-synthesis.md`

**Key Takeaways:**
1. [Top finding with implication]
2. [Top finding with implication]
3. [Top finding with implication]

**Recommended Next Steps:**
- [Action based on research]
- [Action based on research]

**What's next?**
- Use `/prd` to write a PRD addressing these findings
- Use `/communicate` to share with stakeholders
- Use nano-banana to create persona visualizations

Want me to help with any of these?"

---

## Notes for Claude

- Look for frequency (how many users mentioned it) AND intensity (how strongly they felt)
- Direct quotes are more powerful than summaries - include them
- Note contradictions - they often reveal important segments or nuances
- Connect findings to product implications - don't just report, recommend
- Be honest about sample size limitations
