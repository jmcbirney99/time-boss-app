-- Time Boss Seed Data
-- Realistic test data based on iOS Reminders patterns
-- Run after schema.sql: psql -f seed.sql or via Supabase SQL Editor

-- NOTE: This script assumes a dev user exists. The trigger in schema.sql creates
-- default categories, but we'll use our own comprehensive set here.

-- First, get the dev user ID (created by the auth bypass system)
-- We'll use a DO block to set a variable for the user_id

DO $$
DECLARE
  v_user_id uuid;
  -- Category IDs
  cat_general uuid;
  cat_career uuid;
  cat_personal uuid;
  cat_marriage uuid;
  cat_medical uuid;
  cat_house uuid;
  cat_calendar uuid;
  cat_groceries uuid;
  cat_align uuid;
  cat_gifts uuid;
  cat_vehicles uuid;
  cat_financial uuid;
  cat_dad_duty uuid;
  cat_watch uuid;
BEGIN
  -- Get the first user (dev user created by auth bypass)
  SELECT id INTO v_user_id FROM auth.users LIMIT 1;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'No user found. Please create a user first via the app or auth bypass.';
  END IF;

  -- Delete existing data for this user (clean slate)
  DELETE FROM time_blocks WHERE subtask_id IN (
    SELECT s.id FROM subtasks s
    JOIN backlog_items b ON b.id = s.backlog_item_id
    WHERE b.user_id = v_user_id
  );
  DELETE FROM subtasks WHERE backlog_item_id IN (
    SELECT id FROM backlog_items WHERE user_id = v_user_id
  );
  DELETE FROM backlog_items WHERE user_id = v_user_id;
  DELETE FROM categories WHERE user_id = v_user_id;
  DELETE FROM external_events WHERE user_id = v_user_id;

  -- =============================================================================
  -- CATEGORIES (based on iOS Reminders lists)
  -- =============================================================================

  INSERT INTO categories (id, user_id, name, color) VALUES
    (gen_random_uuid(), v_user_id, 'General', '#6B7280')
  RETURNING id INTO cat_general;

  INSERT INTO categories (id, user_id, name, color) VALUES
    (gen_random_uuid(), v_user_id, 'Career/AI', '#3B82F6')
  RETURNING id INTO cat_career;

  INSERT INTO categories (id, user_id, name, color) VALUES
    (gen_random_uuid(), v_user_id, 'Personal', '#8B5CF6')
  RETURNING id INTO cat_personal;

  INSERT INTO categories (id, user_id, name, color) VALUES
    (gen_random_uuid(), v_user_id, 'Marriage', '#EC4899')
  RETURNING id INTO cat_marriage;

  INSERT INTO categories (id, user_id, name, color) VALUES
    (gen_random_uuid(), v_user_id, 'Medical', '#EF4444')
  RETURNING id INTO cat_medical;

  INSERT INTO categories (id, user_id, name, color) VALUES
    (gen_random_uuid(), v_user_id, 'House', '#F59E0B')
  RETURNING id INTO cat_house;

  INSERT INTO categories (id, user_id, name, color) VALUES
    (gen_random_uuid(), v_user_id, 'Calendar', '#10B981')
  RETURNING id INTO cat_calendar;

  INSERT INTO categories (id, user_id, name, color) VALUES
    (gen_random_uuid(), v_user_id, 'Groceries', '#14B8A6')
  RETURNING id INTO cat_groceries;

  INSERT INTO categories (id, user_id, name, color) VALUES
    (gen_random_uuid(), v_user_id, 'Align (AI Consulting)', '#6366F1')
  RETURNING id INTO cat_align;

  INSERT INTO categories (id, user_id, name, color) VALUES
    (gen_random_uuid(), v_user_id, 'Gifts', '#F472B6')
  RETURNING id INTO cat_gifts;

  INSERT INTO categories (id, user_id, name, color) VALUES
    (gen_random_uuid(), v_user_id, 'Vehicles', '#64748B')
  RETURNING id INTO cat_vehicles;

  INSERT INTO categories (id, user_id, name, color) VALUES
    (gen_random_uuid(), v_user_id, 'Financial', '#22C55E')
  RETURNING id INTO cat_financial;

  INSERT INTO categories (id, user_id, name, color) VALUES
    (gen_random_uuid(), v_user_id, 'Dad Duty', '#FB923C')
  RETURNING id INTO cat_dad_duty;

  INSERT INTO categories (id, user_id, name, color) VALUES
    (gen_random_uuid(), v_user_id, 'Watch/Listen', '#A855F7')
  RETURNING id INTO cat_watch;

  -- =============================================================================
  -- BACKLOG ITEMS - HOUSE (29 items, short/vague personal tasks)
  -- =============================================================================

  -- Short, vague house tasks (typical iOS Reminders style)
  INSERT INTO backlog_items (user_id, title, description, status, priority_rank, priority_level, category_id, tags) VALUES
    (v_user_id, 'Paint baseboards', '', 'backlog', 1, 'low', cat_house, ARRAY['home-improvement']),
    (v_user_id, 'Fix holes in the wall', '', 'backlog', 2, 'medium', cat_house, ARRAY['home-improvement']),
    (v_user_id, 'Stinky bathroom', 'Look up on YouTube how to fix', 'backlog', 3, 'high', cat_house, NULL),
    (v_user_id, 'Get quotes for fence repair', '', 'backlog', 4, 'medium', cat_house, ARRAY['outdoor']),
    (v_user_id, 'Clean out garage', '', 'backlog', 5, 'low', cat_house, ARRAY['declutter']),
    (v_user_id, 'Organize pantry', '', 'backlog', 6, 'low', cat_house, ARRAY['declutter']),
    (v_user_id, 'Fix squeaky door', '', 'backlog', 7, NULL, cat_house, NULL),
    (v_user_id, 'Replace HVAC filter', 'Every 3 months', 'backlog', 8, 'medium', cat_house, ARRAY['recurring', 'maintenance']),
    (v_user_id, 'Clean dryer vent', '', 'backlog', 9, 'medium', cat_house, ARRAY['safety']),
    (v_user_id, 'Touch up paint in hallway', '', 'backlog', 10, 'low', cat_house, NULL);

  -- House tasks with notes/descriptions
  INSERT INTO backlog_items (user_id, title, description, status, priority_rank, priority_level, category_id, due_date, tags) VALUES
    (v_user_id, 'Contract Electrician to fix backyard outlet', 'Call Tom''s Electric: (555) 123-4567
They came out last time and did good work.
Need to fix the outlet near the patio before summer.', 'backlog', 11, 'high', cat_house, '2025-01-15', ARRAY['contractor', 'electrical']),
    (v_user_id, 'Get kitchen faucet replaced', 'Leaking again. Might need to replace whole fixture.
Consider Moen or Delta brand.', 'backlog', 12, 'high', cat_house, NULL, ARRAY['plumbing']),
    (v_user_id, 'Clean gutters before rainy season', '', 'backlog', 13, 'medium', cat_house, '2025-02-01', ARRAY['outdoor', 'seasonal']);

  -- House tasks with date ranges
  INSERT INTO backlog_items (user_id, title, description, status, priority_rank, priority_level, category_id, due_date, due_date_end, tags) VALUES
    (v_user_id, 'Parents visiting - prep guest room', 'Change sheets, clean bathroom, stock snacks', 'backlog', 14, 'high', cat_house, '2025-01-10', '2025-01-12', ARRAY['parentsvisit', 'guests']),
    (v_user_id, 'Deep clean house for party', '', 'backlog', 15, 'high', cat_house, '2025-01-18', '2025-01-20', ARRAY['party', 'cleaning']);

  -- Recurring house tasks
  INSERT INTO backlog_items (user_id, title, description, status, priority_rank, priority_level, category_id, recurring_frequency, recurring_interval, tags) VALUES
    (v_user_id, 'Take out trash', '', 'backlog', 16, NULL, cat_house, 'weekly', 1, ARRAY['recurring']),
    (v_user_id, 'Water plants', '', 'backlog', 17, NULL, cat_house, 'weekly', 1, ARRAY['recurring']),
    (v_user_id, 'Deep clean bathrooms', '', 'backlog', 18, 'low', cat_house, 'monthly', 1, ARRAY['recurring', 'cleaning']),
    (v_user_id, 'Check smoke detectors', '', 'backlog', 19, 'medium', cat_house, 'monthly', 6, ARRAY['recurring', 'safety']),
    (v_user_id, 'Service HVAC', 'Call ABC Heating & Air (555) 987-6543', 'backlog', 20, 'medium', cat_house, 'yearly', 1, ARRAY['recurring', 'maintenance']);

  -- More short house tasks
  INSERT INTO backlog_items (user_id, title, description, status, priority_rank, priority_level, category_id, tags) VALUES
    (v_user_id, 'Hang pictures in office', '', 'backlog', 21, 'low', cat_house, NULL),
    (v_user_id, 'Fix blinds in bedroom', '', 'backlog', 22, 'low', cat_house, NULL),
    (v_user_id, 'Caulk around bathtub', '', 'backlog', 23, 'medium', cat_house, ARRAY['bathroom']),
    (v_user_id, 'Power wash driveway', '', 'backlog', 24, 'low', cat_house, ARRAY['outdoor']),
    (v_user_id, 'Organize tool shed', '', 'backlog', 25, 'low', cat_house, ARRAY['outdoor', 'declutter']),
    (v_user_id, 'Replace doorbell battery', '', 'backlog', 26, NULL, cat_house, NULL),
    (v_user_id, 'Fix garbage disposal', 'Making weird noise', 'backlog', 27, 'medium', cat_house, ARRAY['kitchen']),
    (v_user_id, 'Patch hole in screen door', '', 'backlog', 28, 'low', cat_house, NULL),
    (v_user_id, 'Clean out closet', '', 'backlog', 29, 'low', cat_house, ARRAY['declutter']);

  -- =============================================================================
  -- BACKLOG ITEMS - MEDICAL (6 items)
  -- =============================================================================

  INSERT INTO backlog_items (user_id, title, description, status, priority_rank, priority_level, category_id, due_date, due_time, tags) VALUES
    (v_user_id, 'Annual physical', 'Dr. Smith at Main Street Medical
123 Main St, Suite 200
(555) 234-5678', 'backlog', 30, 'high', cat_medical, '2025-01-22', '09:00', ARRAY['appointment']),
    (v_user_id, 'Dentist cleaning', 'Bright Smile Dental
456 Oak Ave
(555) 345-6789', 'backlog', 31, 'medium', cat_medical, '2025-02-14', '14:30', ARRAY['appointment']),
    (v_user_id, 'Eye exam', 'Need to update glasses prescription', 'backlog', 32, 'medium', cat_medical, '2025-01-30', NULL, ARRAY['appointment']),
    (v_user_id, 'Refill prescriptions', '', 'backlog', 33, 'high', cat_medical, '2025-01-08', NULL, ARRAY['recurring']),
    (v_user_id, 'Schedule flu shot', '', 'backlog', 34, 'medium', cat_medical, NULL, NULL, NULL),
    (v_user_id, 'Research new dermatologist', 'Current one retired', 'backlog', 35, 'low', cat_medical, NULL, NULL, NULL);

  -- =============================================================================
  -- BACKLOG ITEMS - CAREER/AI (10 items)
  -- =============================================================================

  INSERT INTO backlog_items (user_id, title, description, status, priority_rank, priority_level, category_id, tags) VALUES
    (v_user_id, 'Update LinkedIn profile', 'Add recent projects and AI experience', 'backlog', 36, 'medium', cat_career, ARRAY['networking']),
    (v_user_id, 'Write blog post on RAG patterns', 'https://www.anthropic.com/research - reference their papers', 'backlog', 37, 'medium', cat_career, ARRAY['content', 'writing']);

  -- Recurring networking task
  INSERT INTO backlog_items (user_id, title, description, status, priority_rank, priority_level, category_id, recurring_frequency, recurring_interval, tags) VALUES
    (v_user_id, 'Weekly networking outreach', 'Reach out to 3 people on LinkedIn', 'backlog', 38, 'medium', cat_career, 'weekly', 1, ARRAY['recurring', 'networking']);

  INSERT INTO backlog_items (user_id, title, description, status, priority_rank, priority_level, category_id, due_date, tags) VALUES
    (v_user_id, 'Prepare conference talk proposal', 'AI Engineering Summit CFP deadline', 'backlog', 39, 'high', cat_career, '2025-01-31', ARRAY['speaking', 'conference']),
    (v_user_id, 'Review Claude API docs', 'https://docs.anthropic.com', 'backlog', 40, 'medium', cat_career, NULL, ARRAY['learning']),
    (v_user_id, 'Complete Coursera ML course', 'Started but never finished', 'backlog', 41, 'low', cat_career, NULL, ARRAY['learning']),
    (v_user_id, 'Set up GitHub portfolio', '', 'backlog', 42, 'medium', cat_career, NULL, ARRAY['portfolio']),
    (v_user_id, 'Research AI agent frameworks', 'LangGraph, CrewAI, AutoGen', 'backlog', 43, 'medium', cat_career, NULL, ARRAY['research']);

  -- Decomposed task with subtasks
  INSERT INTO backlog_items (user_id, title, description, status, priority_rank, priority_level, category_id, tags) VALUES
    (v_user_id, 'Build personal AI assistant prototype', 'Multi-modal assistant using Claude
- Voice interface
- Calendar integration
- Email summarization', 'decomposed', 44, 'high', cat_career, ARRAY['project', 'ai']);

  -- Get the ID of the last inserted item for subtasks
  INSERT INTO subtasks (backlog_item_id, title, definition_of_done, estimated_minutes, status, llm_generated)
    SELECT id, 'Set up project structure', 'Basic Next.js project with TypeScript configured', 60, 'estimated', false
    FROM backlog_items WHERE title = 'Build personal AI assistant prototype' AND user_id = v_user_id;
  INSERT INTO subtasks (backlog_item_id, title, definition_of_done, estimated_minutes, status, llm_generated)
    SELECT id, 'Implement Claude API integration', 'Working API calls with streaming responses', 120, 'estimated', false
    FROM backlog_items WHERE title = 'Build personal AI assistant prototype' AND user_id = v_user_id;
  INSERT INTO subtasks (backlog_item_id, title, definition_of_done, estimated_minutes, status, llm_generated)
    SELECT id, 'Add voice input using Web Speech API', 'Can speak to the assistant and get responses', 180, 'estimated', false
    FROM backlog_items WHERE title = 'Build personal AI assistant prototype' AND user_id = v_user_id;

  INSERT INTO backlog_items (user_id, title, description, status, priority_rank, priority_level, category_id, tags) VALUES
    (v_user_id, 'Apply for AI engineering roles', '', 'backlog', 45, 'high', cat_career, ARRAY['job-search']);

  -- =============================================================================
  -- BACKLOG ITEMS - PERSONAL (8 items)
  -- =============================================================================

  INSERT INTO backlog_items (user_id, title, description, status, priority_rank, priority_level, category_id, tags) VALUES
    (v_user_id, 'Call mom', '', 'backlog', 46, 'medium', cat_personal, ARRAY['family']),
    (v_user_id, 'Birthday gift for Sarah', '', 'backlog', 47, 'high', cat_gifts, NULL),
    (v_user_id, 'Renew gym membership', '', 'backlog', 48, 'low', cat_personal, ARRAY['health']),
    (v_user_id, 'Plan weekend trip', 'Maybe wine country or beach', 'backlog', 49, 'low', cat_personal, ARRAY['travel']),
    (v_user_id, 'Read "Atomic Habits"', 'Started it, need to finish', 'backlog', 50, 'low', cat_personal, ARRAY['reading']),
    (v_user_id, 'Organize photos from vacation', '', 'backlog', 51, 'low', cat_personal, NULL),
    (v_user_id, 'Cancel unused subscriptions', 'Check bank statement', 'backlog', 52, 'medium', cat_financial, ARRAY['money']);

  -- Personal task with due date range
  INSERT INTO backlog_items (user_id, title, description, status, priority_rank, priority_level, category_id, due_date, due_date_end, tags) VALUES
    (v_user_id, 'Book flights for Thanksgiving', 'Check Southwest and United', 'backlog', 53, 'high', cat_personal, '2025-02-01', '2025-02-15', ARRAY['travel', 'family']);

  -- =============================================================================
  -- BACKLOG ITEMS - MARRIAGE (4 items)
  -- =============================================================================

  INSERT INTO backlog_items (user_id, title, description, status, priority_rank, priority_level, category_id, due_date, tags) VALUES
    (v_user_id, 'Plan anniversary dinner', 'Make reservations at nice restaurant', 'backlog', 54, 'high', cat_marriage, '2025-02-14', ARRAY['date-night']),
    (v_user_id, 'Schedule couples massage', '', 'backlog', 55, 'medium', cat_marriage, NULL, ARRAY['date-night']),
    (v_user_id, 'Research weekend getaways', 'Something within 3 hour drive', 'backlog', 56, 'low', cat_marriage, NULL, ARRAY['travel']);

  -- Recurring date night
  INSERT INTO backlog_items (user_id, title, description, status, priority_rank, priority_level, category_id, recurring_frequency, recurring_interval, tags) VALUES
    (v_user_id, 'Weekly date night', 'No phones!', 'backlog', 57, 'high', cat_marriage, 'weekly', 1, ARRAY['recurring', 'date-night']);

  -- =============================================================================
  -- BACKLOG ITEMS - FINANCIAL (5 items)
  -- =============================================================================

  INSERT INTO backlog_items (user_id, title, description, status, priority_rank, priority_level, category_id, due_date, tags) VALUES
    (v_user_id, 'Review investment portfolio', 'Rebalance if needed', 'backlog', 58, 'medium', cat_financial, '2025-01-15', ARRAY['investing']),
    (v_user_id, 'Prepare tax documents', 'Gather W2s, 1099s, receipts', 'backlog', 59, 'high', cat_financial, '2025-02-28', ARRAY['taxes']),
    (v_user_id, 'Update budget spreadsheet', '', 'backlog', 60, 'medium', cat_financial, NULL, ARRAY['budgeting']),
    (v_user_id, 'Research refinancing options', 'Rates might be better now', 'backlog', 61, 'medium', cat_financial, NULL, ARRAY['mortgage']),
    (v_user_id, 'Review insurance policies', 'Auto, home, life - due for review', 'backlog', 62, 'low', cat_financial, NULL, ARRAY['insurance']);

  -- =============================================================================
  -- BACKLOG ITEMS - VEHICLES (4 items)
  -- =============================================================================

  INSERT INTO backlog_items (user_id, title, description, status, priority_rank, priority_level, category_id, due_date, tags) VALUES
    (v_user_id, 'Oil change', 'Honda dealership or Jiffy Lube', 'backlog', 63, 'medium', cat_vehicles, '2025-01-20', ARRAY['maintenance']),
    (v_user_id, 'Renew car registration', '', 'backlog', 64, 'high', cat_vehicles, '2025-01-31', NULL),
    (v_user_id, 'Get car washed', '', 'backlog', 65, 'low', cat_vehicles, NULL, NULL),
    (v_user_id, 'Check tire pressure', '', 'backlog', 66, NULL, cat_vehicles, NULL, ARRAY['maintenance']);

  -- =============================================================================
  -- BACKLOG ITEMS - DAD DUTY (4 items)
  -- =============================================================================

  INSERT INTO backlog_items (user_id, title, description, status, priority_rank, priority_level, category_id, due_date, tags) VALUES
    (v_user_id, 'Soccer practice pickup', '', 'backlog', 67, 'high', cat_dad_duty, '2025-01-09', ARRAY['kids']),
    (v_user_id, 'Help with science project', 'Solar system model', 'backlog', 68, 'high', cat_dad_duty, '2025-01-12', ARRAY['kids', 'school']),
    (v_user_id, 'Plan birthday party', 'Turning 8! Venue ideas?', 'backlog', 69, 'medium', cat_dad_duty, '2025-02-01', ARRAY['kids', 'party']),
    (v_user_id, 'Sign up for swim lessons', 'Check community pool schedule', 'backlog', 70, 'low', cat_dad_duty, NULL, ARRAY['kids']);

  -- =============================================================================
  -- BACKLOG ITEMS - WATCH/LISTEN (5 items, short and simple)
  -- =============================================================================

  INSERT INTO backlog_items (user_id, title, description, status, priority_rank, priority_level, category_id, tags) VALUES
    (v_user_id, 'The Bear S3', '', 'backlog', 71, NULL, cat_watch, ARRAY['tv']),
    (v_user_id, 'Dune Part 2', '', 'backlog', 72, NULL, cat_watch, ARRAY['movie']),
    (v_user_id, 'Huberman Lab - Sleep episode', '', 'backlog', 73, NULL, cat_watch, ARRAY['podcast']),
    (v_user_id, 'Lex Fridman - Sam Altman interview', '', 'backlog', 74, NULL, cat_watch, ARRAY['podcast', 'ai']),
    (v_user_id, 'All-In Podcast latest', '', 'backlog', 75, NULL, cat_watch, ARRAY['podcast']);

  -- =============================================================================
  -- BACKLOG ITEMS - GROCERIES (3 items)
  -- =============================================================================

  INSERT INTO backlog_items (user_id, title, description, status, priority_rank, priority_level, category_id, tags) VALUES
    (v_user_id, 'Weekly grocery run', 'Milk, eggs, bread, fruit, vegetables', 'backlog', 76, 'medium', cat_groceries, ARRAY['recurring']),
    (v_user_id, 'Costco trip', 'Paper towels, toilet paper, dog food', 'backlog', 77, 'low', cat_groceries, NULL),
    (v_user_id, 'Order specialty coffee beans', 'Check Trade Coffee subscription', 'backlog', 78, 'low', cat_groceries, NULL);

  -- =============================================================================
  -- BACKLOG ITEMS - ALIGN (AI Consulting) (3 items)
  -- =============================================================================

  INSERT INTO backlog_items (user_id, title, description, status, priority_rank, priority_level, category_id, due_date, tags) VALUES
    (v_user_id, 'Client proposal for RAG implementation', 'Acme Corp wants document search
Budget: TBD
Timeline: Q1', 'backlog', 79, 'high', cat_align, '2025-01-15', ARRAY['client', 'proposal']),
    (v_user_id, 'Update consulting website', 'Add case studies and testimonials', 'backlog', 80, 'medium', cat_align, NULL, ARRAY['marketing']),
    (v_user_id, 'Invoice for December work', '', 'backlog', 81, 'high', cat_align, '2025-01-05', ARRAY['admin', 'billing']);

  -- =============================================================================
  -- EXTERNAL EVENTS (sample calendar blocks)
  -- =============================================================================

  INSERT INTO external_events (user_id, title, date, start_time, end_time) VALUES
    (v_user_id, 'Team standup', '2025-01-06', '09:00', '09:30'),
    (v_user_id, 'Product review', '2025-01-06', '14:00', '15:00'),
    (v_user_id, 'Team standup', '2025-01-07', '09:00', '09:30'),
    (v_user_id, 'Client call - Acme Corp', '2025-01-07', '11:00', '12:00'),
    (v_user_id, 'Team standup', '2025-01-08', '09:00', '09:30'),
    (v_user_id, 'All hands meeting', '2025-01-08', '13:00', '14:00'),
    (v_user_id, 'Team standup', '2025-01-09', '09:00', '09:30'),
    (v_user_id, 'Sprint planning', '2025-01-09', '10:00', '11:30'),
    (v_user_id, 'Team standup', '2025-01-10', '09:00', '09:30'),
    (v_user_id, 'Friday wrap-up', '2025-01-10', '16:00', '16:30');

  RAISE NOTICE 'Seed data created successfully for user %', v_user_id;
END $$;
