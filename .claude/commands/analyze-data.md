---
description: Analyze data for discovery, impact estimation, or experiment analysis
---

# Data Analysis Workflow

Guide the PM through data analysis: discovery, impact estimation, or experiment analysis.

---

## Phase 1: Mode Selection

Say:
"# Data Analysis Workflow

What type of analysis do you need?

1. **Discovery** - I have data and want to find problems/opportunities
2. **Impact Estimation** - I have a feature idea and want to estimate ROI
3. **Experiment Analysis** - I have A/B test results to analyze

Which mode? (1, 2, or 3)"

**STOP - Wait for user to choose mode**

---

# MODE 1: DISCOVERY

## Discovery Phase 1: Data Loading

Say:
"## Discovery Mode

Let's find insights in your data.

**Step 1: Load your data**

Please @ mention your data files:
- Funnel/conversion data (CSV)
- Survey responses (CSV)
- User feedback or support tickets

Example: `@data/funnel-metrics.csv @data/survey-responses.csv`"

**STOP - Wait for user to provide data files**

---

## Discovery Phase 2: Funnel Analysis

**ACTION:** Analyze the funnel data to identify:
- Where users drop off (biggest conversion gaps)
- Trends over time
- Segment differences

Say:
"**Funnel Analysis Complete**

Here's where users are dropping off:

| Stage | Conversion | Drop-off | Opportunity |
|-------|------------|----------|-------------|
[Table of funnel stages with metrics]

**Biggest opportunity:** [Identify the largest drop-off point]

Now let's understand WHY users drop off here..."

---

## Discovery Phase 3: Qualitative Analysis

**ACTION:** If survey/feedback data provided, analyze for:
- Themes related to the drop-off points
- Pain points and frustrations
- Feature requests

Say:
"**Qualitative Insights**

From user feedback, here's why users struggle at [drop-off point]:

**Top Pain Points:**
1. [Pain point with supporting quote]
2. [Pain point with supporting quote]
3. [Pain point with supporting quote]

**Key Themes:**
- [Theme 1]
- [Theme 2]

---

## Discovery Phase 4: Synthesis

**ACTION:** Create a problem analysis document combining quantitative and qualitative findings.

Save to `analysis/problem-analysis-[topic].md`

Say:
"**Analysis Complete!**

I've created a problem analysis document: `analysis/problem-analysis-[topic].md`

**Summary:**
- **Where:** [Drop-off point from funnel]
- **Why:** [Root causes from qualitative data]
- **Opportunity:** [Potential impact if solved]

**Recommended next steps:**
1. Validate these findings with user interviews
2. Use `/prd` to write a PRD addressing this problem
3. Use Mode 2 (Impact Estimation) to model the ROI

Want me to help with any of these?"

**END DISCOVERY MODE**

---

# MODE 2: IMPACT ESTIMATION

## Impact Phase 1: Feature Context

Say:
"## Impact Estimation Mode

Let's estimate the ROI of your feature idea.

**Step 1: Describe the feature**

What feature are you estimating impact for? Include:
- What it does
- Who it's for
- What behavior it changes"

**STOP - Wait for user to describe feature**

---

## Impact Phase 2: Current State

Say:
"**Step 2: Current metrics**

I need to understand the baseline. Please provide (or I'll help estimate):

1. **Users affected:** How many users would encounter this feature? (monthly)
2. **Current rate:** What's the current conversion/completion rate at this step?
3. **Value per action:** What's a successful action worth? (revenue, LTV, etc.)"

**STOP - Wait for user to provide metrics or ask for help**

---

## Impact Phase 3: Lift Estimation

Say:
"**Step 3: Expected lift**

Now the hard part - estimating how much the feature will improve the metric.

Sources for lift estimates:
- Historical data from similar features
- Industry benchmarks
- Research/case studies
- Expert judgment

What lift do you expect? Or say 'help' and I'll research benchmarks."

**STOP - Wait for user response**

---

## Impact Phase 4: Three Scenarios

**ACTION:** Build impact model with three scenarios:

```
Impact = Users Affected × Current Rate × Expected Lift × Value per Action
```

Calculate for:
- Pessimistic (20th percentile) - conservative assumptions
- Realistic (50th percentile) - best estimate
- Optimistic (80th percentile) - if everything goes well

Save to `analysis/impact-estimate-[feature].md`

Say:
"**Impact Estimation Complete**

| Scenario | Lift | Monthly Impact | Annual Impact |
|----------|------|----------------|---------------|
| Pessimistic | [X%] | [$X] | [$X] |
| Realistic | [X%] | [$X] | [$X] |
| Optimistic | [X%] | [$X] | [$X] |

**Key Assumptions:**
- [List assumptions]

**Sensitivity:** [Which variable has the biggest impact on the estimate]

Full analysis saved to: `analysis/impact-estimate-[feature].md`

**Next steps:**
- Share with leadership for prioritization
- Use `/strategy` to fit this into your roadmap
- Build and run an experiment to validate

Want me to help with any of these?"

**END IMPACT ESTIMATION MODE**

---

# MODE 3: EXPERIMENT ANALYSIS

## Experiment Phase 1: Data Loading

Say:
"## Experiment Analysis Mode

Let's analyze your A/B test results.

**Step 1: Load experiment data**

Please @ mention your experiment results file (CSV with treatment/control data).

Example: `@data/experiment-results.csv`"

**STOP - Wait for user to provide data**

---

## Experiment Phase 2: Topline Analysis

**ACTION:** Calculate topline metrics:
- Treatment vs control rates
- Absolute and relative lift
- Statistical significance (p-value, confidence interval)
- Sample size adequacy

Say:
"**Topline Results**

| Metric | Control | Treatment | Lift | Significant? |
|--------|---------|-----------|------|--------------|
| [Primary] | [X%] | [X%] | [+X%] | [Yes/No (p=X)] |
| [Secondary] | [X%] | [X%] | [+X%] | [Yes/No (p=X)] |

**Statistical Significance:** [Explanation]

⚠️ **Important:** These are topline numbers. Let's dig deeper before making a decision..."

---

## Experiment Phase 3: Segmentation (CRITICAL)

Say:
"**Step 2: Segmentation Analysis**

This is the most important step. Topline metrics can be deceiving.

Who was this feature built for? What's your target segment?"

**STOP - Wait for user to identify target segment**

**ACTION:** Break down results by:
- Target segment vs non-target
- User tenure (new vs existing)
- Other relevant dimensions

Say:
"**Segmentation Results**

| Segment | Control | Treatment | Lift | Significant? |
|---------|---------|-----------|------|--------------|
| Target: [X] | [%] | [%] | [+X%] | [Yes/No] |
| Non-target | [%] | [%] | [+X%] | [Yes/No] |

**Key Finding:** [Insight about segment differences]

This is why segmentation matters - [explain what would have been missed]"

---

## Experiment Phase 4: Quality Metrics

**ACTION:** Analyze quality/health metrics:
- Retention impact (7-day, 30-day)
- Engagement depth (not just activation)
- Leading indicators (feature usage, sharing, etc.)

Say:
"**Quality Metrics**

Beyond the primary metric, here's the full picture:

| Quality Metric | Control | Treatment | Healthy? |
|----------------|---------|-----------|----------|
| 7-day retention | [%] | [%] | [✓/⚠️] |
| 30-day retention | [%] | [%] | [✓/⚠️] |
| [Engagement metric] | [X] | [X] | [✓/⚠️] |

**Leading Indicators:**
- [Indicator 1]: [Finding]
- [Indicator 2]: [Finding]"

---

## Experiment Phase 5: Recommendation

**ACTION:** Synthesize all findings into a recommendation. Save to `analysis/experiment-readout-[name].md`

Say:
"**Recommendation**

Based on the complete analysis:

**Decision:** [Ship to 100% / Ship to segment / Iterate / Kill]

**Rationale:**
- Topline: [Summary]
- Target segment: [Summary]
- Quality metrics: [Summary]
- Leading indicators: [Summary]

**If shipping:** [Any caveats or monitoring needed]
**If iterating:** [What to change and test next]

Full readout saved to: `analysis/experiment-readout-[name].md`

Want me to help communicate these results? Use `/communicate` to create stakeholder updates."

**END EXPERIMENT ANALYSIS MODE**

---

## Notes for Claude

- Invoke the data-analyst sub-agent for complex statistical questions
- Always push for segmentation - it's where insights hide
- Be clear about confidence levels and limitations
- Three scenarios for estimates, never just one number
- Quality metrics matter as much as primary metrics
