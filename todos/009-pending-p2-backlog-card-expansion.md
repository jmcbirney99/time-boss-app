---
status: completed
priority: p2
issue_id: "009"
tags: [ux, backlog, modal, interaction]
dependencies: []
---

# Backlog Card Click for Expanded View

## Problem Statement
Clicking on a backlog card does nothing. Users cannot view full task details, metadata, or edit task properties without using the "Break Down" button.

## Findings
- Backlog cards show title, description snippet, and status badge
- Only interactive element is "Break Down" button
- Card container has no `cursor: pointer` or click handler
- No way to view/edit: due date, category, tags, full description
- In Progress items show "0 subtasks" but no way to view subtask list

## Expected Behavior
Clicking a card should open an expanded view or modal showing:
- Full title and description
- Due date and time
- Category assignment
- Tags
- Subtask list (if decomposed)
- Edit capabilities
- Delete option

## Proposed Solutions

### Option 1: Card detail modal
- Click card to open TaskDetailModal
- Shows all metadata in organized layout
- Edit-in-place for each field
- **Effort**: Medium

### Option 2: Inline expansion
- Click card to expand inline (accordion style)
- Reveals additional fields below
- **Effort**: Small

### Option 3: Side panel
- Click card to show details in slide-out panel
- Keeps backlog visible while viewing details
- **Effort**: Medium

## Recommended Action
Option 1 - Modal provides cleanest UX and is consistent with other modals in app

## Acceptance Criteria
- [ ] Clicking backlog card opens detail view
- [ ] All task metadata visible (title, description, due date, category, tags)
- [ ] Can edit task properties from detail view
- [ ] Can delete task from detail view
- [ ] Can close detail view and return to backlog
- [ ] Card shows visual hover state indicating clickability

## Work Log
- 2025-12-31: Discovered during Playwright UX audit
