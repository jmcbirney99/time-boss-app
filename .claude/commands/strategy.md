---
description: Develop product strategy with competitive research and pressure-testing
---

# Product Strategy Workflow

Guide the PM through developing product strategy with competitive research, strategic choices, and pressure-testing.

---

## Phase 1: Context

Say:
"# Product Strategy Workflow

Let's develop your product strategy together. This process will help you make clear strategic choices and pressure-test your thinking.

**Step 1: What's the scope?**

What are we developing strategy for?
- A specific product/feature area
- A competitive response
- A new market opportunity
- Annual/quarterly planning

Describe the strategic context in a few sentences."

**STOP - Wait for user to describe context**

---

## Phase 2: Competitive Research

Say:
"**Step 2: Competitive landscape**

Who are the key competitors or alternatives we need to understand?

List 2-4 competitors (or say 'help' and I'll identify them based on your context)."

**STOP - Wait for user to list competitors**

**ACTION:** Launch parallel agents to research each competitor:
- Features and positioning
- Recent moves and announcements
- Pricing and business model
- Strengths and weaknesses

Say:
"Researching competitors in parallel...

**Competitive Landscape Summary**

| Competitor | Positioning | Key Strength | Key Weakness |
|------------|-------------|--------------|--------------|
| [Comp 1] | [Position] | [Strength] | [Weakness] |
| [Comp 2] | [Position] | [Strength] | [Weakness] |
| [Comp 3] | [Position] | [Strength] | [Weakness] |

**Key Insights:**
- [Insight about competitive dynamics]
- [Whitespace or opportunity]
- [Threat to watch]

Ready to make strategic choices based on this landscape?"

**STOP - Wait for confirmation**

---

## Phase 3: Five Strategic Choices

Say:
"**Step 3: Strategic Choices**

Now we'll work through 5 key strategic choices. For each one:
1. I'll present options (A, B, or C)
2. You choose
3. I'll challenge your choice (devil's advocate)
4. You can stick with it or reconsider

This ensures your strategy survives scrutiny.

---

### Choice 1: Focus vs Breadth

Where should we concentrate our limited resources?

**A) Deep focus** - Double down on one segment/use case. Own it completely.
**B) Selective expansion** - Strengthen core while adding 1-2 adjacent areas.
**C) Broad platform** - Build horizontal capabilities that serve many use cases.

Which approach? (A, B, or C)"

**STOP - Wait for choice**

**ACTION:** Invoke devils-advocate to challenge the choice with 2-3 hard questions.

Say:
"🔴 **Devil's Advocate Challenge:**

[Present 2-3 challenges to their choice]

Do you want to stick with [choice] or reconsider?"

**STOP - Wait for response**

---

Say:
"### Choice 2: Competitive Response

How should we respond to competitive pressure?

**A) Differentiate** - Zig where they zag. Find unique positioning.
**B) Match and exceed** - Meet competitive features, then out-execute.
**C) Ignore and focus** - Stay focused on our users, don't react to competitors.

Which approach? (A, B, or C)"

**STOP - Wait for choice**

**ACTION:** Devil's advocate challenge

**STOP - Wait for response**

---

Say:
"### Choice 3: Pricing & Business Model

How should we monetize this?

**A) Premium positioning** - Higher price, higher value. Fewer customers, more revenue per customer.
**B) Market rate** - Competitive pricing. Win on product, not price.
**C) Aggressive/freemium** - Lower barriers to entry. Monetize later or through volume.

Which approach? (A, B, or C)"

**STOP - Wait for choice**

**ACTION:** Devil's advocate challenge

**STOP - Wait for response**

---

Say:
"### Choice 4: Product Scope

What role should [AI/new technology/key capability] play?

**A) Core differentiator** - Build it deeply into the product. Make it central to the experience.
**B) Feature enhancement** - Add it to existing workflows. Enhance, don't transform.
**C) Wait and see** - Monitor the space. Don't invest heavily yet.

Which approach? (A, B, or C)"

**STOP - Wait for choice**

**ACTION:** Devil's advocate challenge

**STOP - Wait for response**

---

Say:
"### Choice 5: Risk Tolerance

How fast should we move?

**A) Move fast** - Speed to market matters most. Accept some technical debt and iteration.
**B) Deliberate** - Take time to get it right. Quality over speed.
**C) Test and learn** - Run small experiments before big bets. Validate before scaling.

Which approach? (A, B, or C)"

**STOP - Wait for choice**

**ACTION:** Devil's advocate challenge

**STOP - Wait for response**

---

## Phase 4: Strategy Synthesis

Say:
"**Step 4: Synthesize Your Strategy**

Based on your 5 choices, let me synthesize this into a coherent strategy using the Rumelt Strategy Kernel:

- **Diagnosis:** The strategic challenge/opportunity
- **Guiding Policy:** Our approach (the hard choices)
- **Coherent Actions:** Specific initiatives that reinforce each other

Generating strategy document..."

**ACTION:** Create strategy document using Rumelt kernel framework:
1. Diagnosis - synthesize the competitive landscape and challenge
2. Guiding Policy - translate the 5 choices into a coherent approach
3. Coherent Actions - propose H1/H2 initiatives that align with the strategy

Save to `strategy/[name]-strategy.md`

Say:
"**Strategy Document Created**

📄 `strategy/[name]-strategy.md`

**Summary:**

**Diagnosis:** [1-2 sentences on the strategic challenge]

**Guiding Policy:** [2-3 sentences on our approach]

**Coherent Actions:**
- H1: [Key initiative]
- H1: [Key initiative]
- H2: [Future initiative]

Review the full document and let me know if you want to adjust anything."

**STOP - Wait for user review**

---

## Phase 5: Executive Presentation (Optional)

Say:
"**Step 5: Create Presentation (Optional)**

Would you like me to create an executive presentation from this strategy?

This will use the pptx skill to generate a slide deck you can present to leadership.

Say 'yes' to create slides, or 'done' to finish."

**STOP - Wait for response**

If yes:
**ACTION:** Invoke pptx skill to create presentation from strategy document.

Say:
"Presentation created! Check `strategy/[name]-strategy-deck.pptx`

**Your strategy is ready to present!** 🚀

Remember:
- Lead with the diagnosis (the problem)
- Be clear about what you're NOT doing (tradeoffs)
- Connect actions back to the guiding policy
- Anticipate the questions we pressure-tested

Good luck!"

---

## Notes for Claude

- The devil's advocate challenges should be genuinely hard questions
- Don't be a pushover - real scrutiny makes strategies stronger
- The 5 choices should feel like real tradeoffs, not obvious answers
- Rumelt's kernel: good strategy is diagnosis + guiding policy + coherent actions
- A strategy that says yes to everything isn't a strategy
