---
status: completed
priority: p2
issue_id: "006"
tags: [auth, ux, navigation]
dependencies: []
---

# Auth Status UI & Login Access

## Problem Statement
Users have no visual indication of their authentication status, and no easy way to navigate to the login page from the main app.

## Requirements
1. **Auth status indicator** - Show whether user is logged in (e.g., user avatar/email in header)
2. **Login/logout access** - Provide navigation to /login page and logout functionality

## Proposed Solutions

### Option 1: Header user menu
- Add user avatar or email to header (top-right)
- Dropdown with "Sign out" option when logged in
- "Sign in" link when logged out
- **Effort**: Small

## Acceptance Criteria
- [ ] Auth status visible in UI (logged in vs logged out)
- [ ] Easy access to /login page when logged out
- [ ] Logout functionality when logged in
- [ ] Consistent placement in app header/navigation

## Notes
Source: User request on 2025-12-31
