# feat: Auth UI Indicators

Add authentication status UI to the header showing login state with login/logout functionality.

## Overview

Users have no visual indication of their authentication status. The TopBar already shows user email when available, but there's no way to sign out or sign in from the UI.

## Acceptance Criteria

- [ ] Show "Sign In" button in header when logged out
- [ ] Show user avatar + email with dropdown when logged in
- [ ] Dropdown contains "Sign Out" option
- [ ] Sign Out redirects to /login
- [ ] Loading skeleton shown during initial auth check
- [ ] Keyboard accessible (Enter/Space to open, Escape to close, Arrow keys to navigate)

## Technical Approach

### Architecture Decision: Auth State Management

Use a simple `useAuth` hook that subscribes to Supabase auth state changes. No React Context needed for this scope.

```typescript
// src/hooks/useAuth.ts
export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  return { user, loading }
}
```

### Files to Create

| File | Purpose |
|------|---------|
| `src/hooks/useAuth.ts` | Auth state hook with Supabase subscription |
| `src/components/layout/UserMenu.tsx` | Dropdown menu component for logged-in users |

### Files to Modify

| File | Change |
|------|--------|
| `src/components/layout/TopBar.tsx` | Replace static user indicator with UserMenu component |
| `src/lib/auth.ts` | Add error handling to signOut function |

## Implementation

### Step 1: Create useAuth hook

```typescript
// src/hooks/useAuth.ts
'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  return { user, loading }
}
```

### Step 2: Create UserMenu component

```typescript
// src/components/layout/UserMenu.tsx
'use client'

import { useState, useRef, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { signOut } from '@/lib/auth'
import Link from 'next/link'

export function UserMenu() {
  const { user, loading } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [isSigningOut, setIsSigningOut] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Close on Escape
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setIsOpen(false)
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [])

  const handleSignOut = async () => {
    setIsSigningOut(true)
    try {
      await signOut()
    } catch (error) {
      console.error('Sign out failed:', error)
      setIsSigningOut(false)
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-stone-200 animate-pulse" />
        <div className="hidden md:block w-20 h-4 bg-stone-200 rounded animate-pulse" />
      </div>
    )
  }

  // Logged out state
  if (!user) {
    return (
      <Link
        href="/login"
        className="px-4 py-2 text-sm font-medium text-white bg-sage-600 rounded-lg hover:bg-sage-700 transition-colors"
      >
        Sign In
      </Link>
    )
  }

  // Logged in state
  const initial = user.email?.charAt(0).toUpperCase() || '?'
  const email = user.email || 'User'

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-full focus:outline-none focus:ring-2 focus:ring-sage-500 focus:ring-offset-2"
        aria-haspopup="menu"
        aria-expanded={isOpen}
      >
        <div className="w-8 h-8 rounded-full bg-sage-500 flex items-center justify-center text-white text-sm font-medium">
          {initial}
        </div>
        <span className="hidden md:block text-sm text-stone-600 max-w-[150px] truncate" title={email}>
          {email}
        </span>
        <svg className="hidden md:block w-4 h-4 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-stone-200 py-1 z-40"
          role="menu"
        >
          <div className="px-4 py-2 border-b border-stone-100">
            <p className="text-sm font-medium text-stone-900 truncate">{email}</p>
          </div>
          <button
            onClick={handleSignOut}
            disabled={isSigningOut}
            className="w-full text-left px-4 py-2 text-sm text-stone-700 hover:bg-stone-100 disabled:opacity-50"
            role="menuitem"
          >
            {isSigningOut ? 'Signing out...' : 'Sign Out'}
          </button>
        </div>
      )}
    </div>
  )
}
```

### Step 3: Update TopBar

Replace the existing user indicator (lines 152-167) with:

```typescript
// In TopBar.tsx
import { UserMenu } from './UserMenu'

// Remove userEmail prop from interface

// Replace user indicator section with:
<UserMenu />
```

### Step 4: Update signOut in auth.ts

```typescript
// src/lib/auth.ts
export async function signOut() {
  const supabase = createClient()
  const { error } = await supabase.auth.signOut()

  if (error) {
    console.error('Sign out error:', error)
    throw error
  }

  window.location.href = '/login'
}
```

## Edge Cases Handled

| Case | Behavior |
|------|----------|
| Initial load | Show skeleton (pulsing avatar + text placeholder) |
| No email on user | Show "?" as avatar initial |
| Sign out fails | Log error, stay on page, button shows loading state |
| Dev bypass mode | Shows dev user normally (sign out does nothing server-side) |
| Mobile | Avatar only, dropdown works same as desktop |
| Session expires | onAuthStateChange fires, UI updates to show Sign In |

## Design Specs

- Avatar: 32x32px, `bg-sage-500`, white text, `rounded-full`
- Dropdown: 192px wide, `shadow-lg`, `z-40`, right-aligned
- Sign In button: `bg-sage-600`, white text, matches existing button styles
- Loading skeleton: `bg-stone-200`, `animate-pulse`

## Testing Checklist

- [ ] Logged out: "Sign In" button visible, links to /login
- [ ] Logged in: Avatar + email shown, dropdown opens on click
- [ ] Sign Out: Redirects to /login, clears session
- [ ] Loading state: Skeleton shown during initial auth check
- [ ] Keyboard: Can Tab to avatar, Enter to open, Escape to close
- [ ] Mobile: Avatar shows, dropdown works
- [ ] Click outside dropdown: Closes it

## References

- Existing auth helper: `src/lib/auth.ts:3-6`
- TopBar user indicator: `src/components/layout/TopBar.tsx:152-167`
- Supabase client: `src/lib/supabase/client.ts`
- Login page: `src/app/login/page.tsx`
