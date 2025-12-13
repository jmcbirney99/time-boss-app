# Milestone 1: Data Foundation

## Overview

**Goal:** Data persists, weekly planning works end-to-end

**Current State:**
- App uses in-memory mock data from `src/data/mockData.ts` (re-exports `src/data/sampleData.ts`)
- All data operations are synchronous functions that return static arrays
- Main page loads data via `useState` and manipulates it locally
- No authentication, no persistence

**Target State:**
- Supabase database stores all entities
- API routes handle CRUD operations
- Simple email auth (Supabase Auth)
- Components fetch/mutate data via API

---

## Schema Gaps from iOS Reminders Audit

The following data was captured from Jon's iOS Reminders but has no equivalent in the current TypeScript schema:

| Gap | Priority | Rationale |
|-----|----------|-----------|
| **Category** | High | Jon organizes by life area (House, Medical, Career, General) |
| **Due Date/Time** | High | iOS Reminders' core "hope to complete by" feature |
| **Recurring Pattern** | Medium | Many tasks repeat (weekly trash, monthly filters, etc.) |
| **Tags** | Low | Cross-cutting labels like #financial, #health |

These fields are added to the schema below.

---

## Data Schema (Supabase/Postgres)

Based on existing TypeScript types in `src/types/index.ts`, PRD schema, and iOS Reminders audit:

```sql
-- Users (extends Supabase auth.users)
create table profiles (
  id uuid primary key references auth.users(id),
  name text,
  work_hours_start text default '08:00',
  work_hours_end text default '17:00',
  work_days text[] default '{"monday","tuesday","wednesday","thursday","friday"}',
  whirlwind_percentage numeric default 0.4,
  estimation_multiplier numeric default 1.0,
  created_at timestamp with time zone default now()
);

-- Categories for organizing backlog items
create table categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) not null,
  name text not null,
  color text,  -- hex color for UI
  created_at timestamp with time zone default now(),
  unique(user_id, name)
);

-- Seed default categories
-- INSERT INTO categories (user_id, name, color) VALUES
--   (user_id, 'General', '#6B7280'),
--   (user_id, 'House', '#F59E0B'),
--   (user_id, 'Medical', '#EF4444'),
--   (user_id, 'Career', '#3B82F6');

-- Backlog Items
create table backlog_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) not null,
  title text not null,
  description text,
  status text default 'backlog' check (status in ('backlog', 'decomposed', 'archived')),
  priority_rank integer not null,
  -- NEW: Category (from iOS Reminders lists)
  category_id uuid references categories(id),
  -- NEW: Due date/time (from iOS Reminders)
  due_date date,
  due_time time,
  -- NEW: Recurring pattern (from iOS Reminders)
  recurring_frequency text check (recurring_frequency in ('daily', 'weekly', 'monthly', 'yearly', 'custom')),
  recurring_interval integer,  -- e.g., every 2 weeks
  recurring_rule text,  -- custom rule like "every 3 months on the second Saturday"
  -- NEW: Tags (from iOS Reminders hashtags)
  tags text[],  -- ["financial", "health"]
  created_at timestamp with time zone default now()
);

-- Subtasks
create table subtasks (
  id uuid primary key default gen_random_uuid(),
  backlog_item_id uuid references backlog_items(id) on delete cascade not null,
  title text not null,
  definition_of_done text,
  estimated_minutes integer not null,
  actual_minutes integer,
  status text default 'estimated' check (status in ('estimated', 'scheduled', 'in_progress', 'completed', 'overflow', 'deferred')),
  llm_generated boolean default false,
  llm_rationale text,
  created_at timestamp with time zone default now(),
  completed_at timestamp with time zone
);

-- Time Blocks
create table time_blocks (
  id uuid primary key default gen_random_uuid(),
  subtask_id uuid references subtasks(id) on delete cascade not null,
  date date not null,
  start_time time not null,
  end_time time not null,
  status text default 'scheduled' check (status in ('scheduled', 'completed', 'partial')),
  created_at timestamp with time zone default now()
);

-- External Events (manual entry for MVP, Google Calendar sync later)
create table external_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) not null,
  title text not null,
  date date not null,
  start_time time not null,
  end_time time not null,
  created_at timestamp with time zone default now()
);

-- Weekly Plans
create table weekly_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) not null,
  week_start_date date not null,
  status text default 'planning' check (status in ('planning', 'committed')),
  committed_at timestamp with time zone,
  reflection_notes jsonb,
  created_at timestamp with time zone default now(),
  unique(user_id, week_start_date)
);
```

---

## Implementation Steps

### Step 1: Supabase Setup

**Files to create:**
- `src/lib/supabase.ts` - Supabase client (browser + server)

**Actions:**
1. Install `@supabase/supabase-js` and `@supabase/ssr`
2. Create Supabase project (manual in dashboard)
3. Run SQL migrations to create tables
4. Add env vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Enable Row Level Security (RLS) on all tables

**RLS Policies (each table):**
```sql
-- Enable RLS
alter table profiles enable row level security;
alter table backlog_items enable row level security;
-- ... etc

-- User can only see/modify own data
create policy "Users can view own profile" on profiles
  for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles
  for update using (auth.uid() = id);

create policy "Users can CRUD own backlog items" on backlog_items
  for all using (user_id = auth.uid());
-- Similar for other tables
```

---

### Step 2: Simple Auth

**Files to create:**
- `src/app/login/page.tsx` - Login page with email magic link
- `src/lib/auth.ts` - Auth helper functions
- `src/components/AuthGuard.tsx` - Wrapper for protected routes

**Auth Flow (MVP):**
1. Email magic link (no password)
2. Supabase handles email sending
3. On first login, create profile row via trigger or API

**Database trigger for auto-profile:**
```sql
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name)
  values (new.id, new.raw_user_meta_data->>'name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

---

### Step 3: API Routes

**Files to create:**
```
src/app/api/backlog/route.ts         - GET (list), POST (create)
src/app/api/backlog/[id]/route.ts    - GET, PUT, DELETE
src/app/api/subtasks/route.ts        - GET, POST
src/app/api/subtasks/[id]/route.ts   - GET, PUT, DELETE
src/app/api/time-blocks/route.ts     - GET, POST
src/app/api/time-blocks/[id]/route.ts - GET, PUT, DELETE
src/app/api/external-events/route.ts - GET, POST
src/app/api/weekly-plan/route.ts     - GET, POST/PUT (upsert)
src/app/api/user/route.ts            - GET (profile), PUT (update settings)
```

**Pattern for each route:**
```typescript
// src/app/api/backlog/route.ts
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data, error } = await supabase
    .from('backlog_items')
    .select('*')
    .order('priority_rank');

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const { data, error } = await supabase
    .from('backlog_items')
    .insert({ ...body, user_id: user.id })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
```

---

### Step 4: Data Fetching Layer

**Files to create:**
- `src/lib/api.ts` - Client-side fetch wrappers
- `src/hooks/useBacklog.ts` - React hook for backlog data
- `src/hooks/useSubtasks.ts` - React hook for subtasks
- `src/hooks/useTimeBlocks.ts` - React hook for time blocks
- `src/hooks/useExternalEvents.ts` - React hook for events
- `src/hooks/useWeeklyPlan.ts` - React hook for weekly plan

**Pattern:**
```typescript
// src/lib/api.ts
export async function fetchBacklog() {
  const res = await fetch('/api/backlog');
  if (!res.ok) throw new Error('Failed to fetch backlog');
  return res.json();
}

export async function createBacklogItem(item: Partial<BacklogItem>) {
  const res = await fetch('/api/backlog', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item),
  });
  if (!res.ok) throw new Error('Failed to create item');
  return res.json();
}
```

---

### Step 5: Replace Mock Data in Components

**Files to modify:**
- `src/app/page.tsx` - Main page, replace mock data with hooks
- `src/app/today/page.tsx` - Today view, replace mock data
- `src/components/backlog/BacklogList.tsx` - May need loading states

---

## Acceptance Criteria

- [ ] Jon can log in with email magic link
- [ ] Adding a backlog item persists across page refresh
- [ ] Scheduling a subtask to a day persists
- [ ] Decomposing a backlog item saves subtasks to database
- [ ] All existing UI functionality works with real data

---

## Dependencies

**NPM packages to add:**
- `@supabase/supabase-js`
- `@supabase/ssr`

**Environment variables:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## Critical Files

- `src/app/page.tsx` - Main weekly planning page
- `src/data/sampleData.ts` - Current data source showing data shapes
- `src/types/index.ts` - TypeScript interfaces
- `src/hooks/useCapacityCalculation.ts` - Existing hook pattern to follow
