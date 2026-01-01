-- Time Boss App Database Schema
-- Run this in your Supabase SQL Editor

-- =============================================================================
-- TABLES
-- =============================================================================

-- Profiles table (extends Supabase auth.users)
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  work_hours_start text default '08:00',
  work_hours_end text default '17:00',
  work_days text[] default '{"monday","tuesday","wednesday","thursday","friday"}',
  whirlwind_percentage numeric default 0.4,
  estimation_multiplier numeric default 1.0,
  created_at timestamp with time zone default now()
);

-- Categories for organizing backlog items
create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  name text not null,
  color text,
  created_at timestamp with time zone default now(),
  unique(user_id, name)
);

-- Backlog Items
create table if not exists backlog_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  title text not null,
  description text,
  status text default 'backlog' check (status in ('backlog', 'decomposed', 'archived')),
  priority_rank integer not null,
  priority_level text check (priority_level in ('high', 'medium', 'low', 'none')),
  category_id uuid references categories(id) on delete set null,
  due_date date,
  due_date_end date,
  due_time time,
  recurring_frequency text check (recurring_frequency in ('daily', 'weekly', 'monthly', 'yearly', 'custom')),
  recurring_interval integer,
  recurring_rule text,
  tags text[],
  created_at timestamp with time zone default now(),
  completed_at timestamp with time zone,
  constraint check_date_range check (due_date_end is null or due_date_end >= due_date)
);

-- Subtasks
create table if not exists subtasks (
  id uuid primary key default gen_random_uuid(),
  backlog_item_id uuid references backlog_items(id) on delete cascade not null,
  title text not null,
  definition_of_done text,
  estimated_minutes integer not null,
  actual_minutes integer,
  status text default 'estimated' check (status in ('estimated', 'scheduled', 'in_progress', 'completed', 'overflow', 'deferred')),
  llm_generated boolean default false,
  llm_rationale text,
  progress_note text,
  parent_subtask_id uuid references subtasks(id) on delete set null,
  created_at timestamp with time zone default now(),
  completed_at timestamp with time zone
);

-- Time Blocks
create table if not exists time_blocks (
  id uuid primary key default gen_random_uuid(),
  subtask_id uuid references subtasks(id) on delete cascade not null,
  date date not null,
  start_time time not null,
  end_time time not null,
  status text default 'scheduled' check (status in ('scheduled', 'completed', 'partial')),
  created_at timestamp with time zone default now()
);

-- External Events (manual entry for MVP, calendar sync later)
create table if not exists external_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  title text not null,
  date date not null,
  start_time time not null,
  end_time time not null,
  created_at timestamp with time zone default now()
);

-- Weekly Plans
create table if not exists weekly_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  week_start_date date not null,
  status text default 'planning' check (status in ('planning', 'committed')),
  committed_at timestamp with time zone,
  reflection_notes jsonb,
  created_at timestamp with time zone default now(),
  unique(user_id, week_start_date)
);

-- Daily Reviews
create table if not exists daily_reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  date date not null,
  completed_subtask_ids uuid[],
  incomplete_subtask_ids uuid[],
  overflow_actions jsonb,
  notes text,
  completed_at timestamp with time zone,
  created_at timestamp with time zone default now(),
  unique(user_id, date)
);

-- =============================================================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================================================

-- Enable RLS on all tables
alter table profiles enable row level security;
alter table categories enable row level security;
alter table backlog_items enable row level security;
alter table subtasks enable row level security;
alter table time_blocks enable row level security;
alter table external_events enable row level security;
alter table weekly_plans enable row level security;
alter table daily_reviews enable row level security;

-- Profiles policies
create policy "Users can view own profile" on profiles
  for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles
  for update using (auth.uid() = id);
create policy "Users can insert own profile" on profiles
  for insert with check (auth.uid() = id);

-- Categories policies
create policy "Users can CRUD own categories" on categories
  for all using (user_id = auth.uid());

-- Backlog items policies
create policy "Users can CRUD own backlog items" on backlog_items
  for all using (user_id = auth.uid());

-- Subtasks policies (via backlog_item ownership)
create policy "Users can view own subtasks" on subtasks
  for select using (
    exists (
      select 1 from backlog_items
      where backlog_items.id = subtasks.backlog_item_id
      and backlog_items.user_id = auth.uid()
    )
  );
create policy "Users can insert own subtasks" on subtasks
  for insert with check (
    exists (
      select 1 from backlog_items
      where backlog_items.id = subtasks.backlog_item_id
      and backlog_items.user_id = auth.uid()
    )
  );
create policy "Users can update own subtasks" on subtasks
  for update using (
    exists (
      select 1 from backlog_items
      where backlog_items.id = subtasks.backlog_item_id
      and backlog_items.user_id = auth.uid()
    )
  );
create policy "Users can delete own subtasks" on subtasks
  for delete using (
    exists (
      select 1 from backlog_items
      where backlog_items.id = subtasks.backlog_item_id
      and backlog_items.user_id = auth.uid()
    )
  );

-- Time blocks policies (via subtask -> backlog_item ownership)
create policy "Users can view own time blocks" on time_blocks
  for select using (
    exists (
      select 1 from subtasks
      join backlog_items on backlog_items.id = subtasks.backlog_item_id
      where subtasks.id = time_blocks.subtask_id
      and backlog_items.user_id = auth.uid()
    )
  );
create policy "Users can insert own time blocks" on time_blocks
  for insert with check (
    exists (
      select 1 from subtasks
      join backlog_items on backlog_items.id = subtasks.backlog_item_id
      where subtasks.id = time_blocks.subtask_id
      and backlog_items.user_id = auth.uid()
    )
  );
create policy "Users can update own time blocks" on time_blocks
  for update using (
    exists (
      select 1 from subtasks
      join backlog_items on backlog_items.id = subtasks.backlog_item_id
      where subtasks.id = time_blocks.subtask_id
      and backlog_items.user_id = auth.uid()
    )
  );
create policy "Users can delete own time blocks" on time_blocks
  for delete using (
    exists (
      select 1 from subtasks
      join backlog_items on backlog_items.id = subtasks.backlog_item_id
      where subtasks.id = time_blocks.subtask_id
      and backlog_items.user_id = auth.uid()
    )
  );

-- External events policies
create policy "Users can CRUD own external events" on external_events
  for all using (user_id = auth.uid());

-- Weekly plans policies
create policy "Users can CRUD own weekly plans" on weekly_plans
  for all using (user_id = auth.uid());

-- Daily reviews policies
create policy "Users can CRUD own daily reviews" on daily_reviews
  for all using (user_id = auth.uid());

-- =============================================================================
-- TRIGGERS
-- =============================================================================

-- Auto-create profile on user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', new.email));

  -- Create default categories for new user
  insert into public.categories (user_id, name, color) values
    (new.id, 'General', '#6B7280'),
    (new.id, 'House', '#F59E0B'),
    (new.id, 'Medical', '#EF4444'),
    (new.id, 'Career', '#3B82F6');

  return new;
end;
$$ language plpgsql security definer;

-- Drop trigger if exists and recreate
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- =============================================================================
-- INDEXES (for performance)
-- =============================================================================

create index if not exists idx_backlog_items_user_id on backlog_items(user_id);
create index if not exists idx_backlog_items_priority on backlog_items(user_id, priority_rank);
create index if not exists idx_subtasks_backlog_item on subtasks(backlog_item_id);
create index if not exists idx_time_blocks_subtask on time_blocks(subtask_id);
create index if not exists idx_time_blocks_date on time_blocks(date);
create index if not exists idx_external_events_user_date on external_events(user_id, date);
create index if not exists idx_weekly_plans_user_week on weekly_plans(user_id, week_start_date);
