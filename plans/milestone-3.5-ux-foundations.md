# Milestone 3.5: UX Foundations

## Overview

Fix foundational UX issues discovered during systematic Playwright audit before proceeding to Milestones 4-6. These issues block basic usability and must be addressed first.

## Priority Issues

### P1 - Critical (Blocks Core Functionality)

| Issue | Todo | Description |
|-------|------|-------------|
| Mobile layout broken | `007-pending-p1-mobile-layout-broken.md` | Two-column grid doesn't collapse, app unusable on phones |
| Backlog scroll hidden | `008-pending-p1-backlog-scroll-hidden.md` | 86 items but only 6 visible, no scroll indication |

### P2 - Important (Degrades Experience)

| Issue | Todo | Description |
|-------|------|-------------|
| Auth UI missing | `006-pending-auth-ui-indicators.md` | No login status or user indicator in TopBar |
| Card expansion missing | `009-pending-p2-backlog-card-expansion.md` | Can't click cards to view/edit full details |

## Implementation Order

### Phase 1: Scroll & Visibility (1 file)
**File:** `src/components/backlog/BacklogPanel.tsx`

1. Add visible scrollbar to backlog container
2. Add bottom shadow gradient when more content exists
3. Ensure Quick Add input always visible at bottom

### Phase 2: Mobile Responsive (3-4 files)
**Files:**
- `src/app/page.tsx` - Main grid layout
- `src/components/layout/TopBar.tsx` - Mobile nav
- `src/components/week/WeekOverview.tsx` - Mobile adaptation
- `src/components/backlog/BacklogPanel.tsx` - Mobile layout

1. Add Tailwind breakpoints for mobile (< 768px)
2. Stack columns vertically on mobile
3. Add hamburger menu or tab navigation
4. Collapse TopBar stats on mobile

### Phase 3: Auth Indicator (1-2 files)
**Files:**
- `src/components/layout/TopBar.tsx`
- `src/hooks/useAuth.ts` (if needed)

1. Add user email/avatar to TopBar right side
2. Add dropdown with Sign Out option
3. Show "Sign In" link when logged out

### Phase 4: Card Detail View (2-3 files)
**Files:**
- `src/components/backlog/BacklogItem.tsx` - Add click handler
- `src/components/backlog/TaskDetailModal.tsx` (new)
- `src/app/page.tsx` - Modal state management

1. Create TaskDetailModal component
2. Add click handler to backlog cards
3. Display all task metadata in modal
4. Enable edit/delete from modal

## Success Criteria

- [ ] Mobile viewport (375px) renders correctly
- [ ] Backlog scrolls with visible scroll affordance
- [ ] User can see auth status in TopBar
- [ ] Clicking backlog card opens detail view
- [ ] All tests pass
- [ ] No new console errors

## Testing Checklist

After implementation, verify with Playwright:
- [ ] Desktop (1440x900) - all features work
- [ ] Tablet (768x1024) - layout adapts
- [ ] Mobile (375x667) - layout collapses, all content accessible
- [ ] Backlog scroll works and is visible
- [ ] Card click opens detail modal
- [ ] Auth indicator shows in TopBar

## Screenshots Reference

Audit screenshots in `.playwright-mcp/`:
- `audit-desktop-1440x900.png`
- `audit-tablet-768x1024.png`
- `audit-mobile-375x667.png`
- `audit-today-page.png`

## Notes

- Day card expansion (timeline) already works
- Navigation between Week/Today works
- Quick Add input works
- Break Down button works
- These are net-new features, not bugs in existing features
