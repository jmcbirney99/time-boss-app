---
status: completed
priority: p1
issue_id: "008"
tags: [ux, scroll, backlog, css]
dependencies: []
---

# Backlog Scroll Not Visible

## Problem Statement
The backlog shows "86 items" but only ~6 are visible on screen. There's no visible scrollbar or indication that more items exist below, making users think the list is empty or incomplete.

## Findings
Tested at 1440x900 desktop viewport:
- Backlog header shows "86 items" correctly
- Only 5-6 items visible in viewport
- Last visible item ("Clean out garage") is cut off at bottom
- No visible scrollbar in backlog column
- No "scroll for more" indicator or shadow
- CSS likely has `overflow: hidden` or custom scrollbar that's invisible

## Screenshots
See `.playwright-mcp/audit-desktop-1440x900.png`

## Proposed Solutions

### Option 1: Visible scrollbar
- Add visible scrollbar to backlog container
- Use `overflow-y: auto` with visible scrollbar styling
- **Effort**: Small

### Option 2: Scroll indicator
- Add shadow gradient at bottom when more content exists
- "Scroll for more" text or chevron icon
- **Effort**: Small

### Option 3: Both
- Visible scrollbar + gradient shadow indicator
- **Effort**: Small

## Recommended Action
Option 3 - Both scrollbar and shadow indicator for best UX

## Acceptance Criteria
- [ ] User can visually tell there are more items below
- [ ] Scrollbar is visible or scroll affordance is clear
- [ ] Bottom shadow/gradient appears when more content exists
- [ ] Scroll to bottom shows Quick Add input

## Work Log
- 2025-12-31: Discovered during Playwright UX audit
