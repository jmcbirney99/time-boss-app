---
status: completed
priority: p1
issue_id: "007"
tags: [responsive, mobile, css, layout]
dependencies: []
---

# Mobile Layout Completely Broken

## Problem Statement
At mobile viewport (375x667), the two-column grid layout does not collapse to single column, making the app unusable on phones.

## Findings
Tested at 375x667 viewport:
- Two-column layout forces horizontal overflow
- Backlog column squeezed to ~75px width
- Text truncates severely ("86 ite", "decompo...")
- Capacity stats hidden from TopBar
- Commit Plan button not visible
- No hamburger menu or mobile navigation adaptation

## Screenshots
See `.playwright-mcp/audit-mobile-375x667.png`

## Proposed Solutions

### Option 1: Mobile-first responsive redesign
- Stack columns vertically on mobile (< 768px)
- Backlog takes full width, collapsible
- Week overview becomes scrollable horizontal list or accordion
- TopBar collapses to hamburger menu
- **Effort**: Medium-Large

### Option 2: Hide backlog on mobile
- Show only Week Overview on mobile
- Floating button to access backlog as slide-out drawer
- **Effort**: Medium

## Recommended Action
Option 1 - Full responsive redesign for mobile

## Acceptance Criteria
- [ ] Layout renders correctly at 375px width
- [ ] All text readable without horizontal scroll
- [ ] All interactive elements accessible
- [ ] TopBar adapts to narrow viewport
- [ ] Quick add input accessible on mobile

## Work Log
- 2025-12-31: Discovered during Playwright UX audit
