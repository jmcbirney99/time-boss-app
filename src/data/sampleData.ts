/**
 * Sample Data - Based on Jon's actual iOS Reminders
 *
 * Categories:
 * - General (personal tasks, family, financial)
 * - House (home maintenance, repairs, cleaning)
 * - Medical (health appointments, preventive care)
 * - Career (networking, skill building, job-related)
 *
 * This data represents real personal task management scenarios
 * to test the Time Boss app against actual use cases.
 */

import type {
  User,
  ExternalEvent,
  BacklogItem,
  Subtask,
  TimeBlock,
  WeeklyPlan,
  DayColumn,
  Category,
} from '@/types';
import { calculateDuration } from '@/lib/dateUtils';

// =============================================================================
// CATEGORIES - Life areas for organizing tasks (from iOS Reminders lists)
// =============================================================================

export const categories: Category[] = [
  { id: 'cat_general', name: 'General', color: '#6B7280' },  // Gray
  { id: 'cat_house', name: 'House', color: '#F59E0B' },      // Amber
  { id: 'cat_medical', name: 'Medical', color: '#EF4444' },  // Red
  { id: 'cat_career', name: 'Career', color: '#3B82F6' },    // Blue
];

// =============================================================================
// USER PROFILE
// =============================================================================

export const user: User = {
  id: 'user_001',
  name: 'Jon',
  workHours: {
    start: '08:00',
    end: '17:00',
    days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
  },
  whirlwindPercentage: 0.4,
  estimationMultiplier: 1.0, // Starts at 1.0, learns from actual vs estimated
};

// =============================================================================
// EXTERNAL EVENTS (Personal calendar - family, appointments, etc.)
// =============================================================================

export const externalEvents: ExternalEvent[] = [
  // Monday
  { id: 'ext_001', title: 'Family planning meeting', date: '2025-12-15', startTime: '08:00', endTime: '09:00' },
  { id: 'ext_002', title: 'Ivy school pickup', date: '2025-12-15', startTime: '15:00', endTime: '15:30' },
  // Tuesday
  { id: 'ext_003', title: 'Dentist - Ivy', date: '2025-12-16', startTime: '10:00', endTime: '11:00' },
  { id: 'ext_004', title: 'Networking coffee', date: '2025-12-16', startTime: '14:00', endTime: '15:00' },
  // Wednesday
  { id: 'ext_005', title: 'CT Angio appointment', date: '2025-12-17', startTime: '09:00', endTime: '10:30' },
  // Thursday
  { id: 'ext_006', title: 'Girls dance class', date: '2025-12-18', startTime: '16:00', endTime: '17:00' },
  // Friday
  { id: 'ext_007', title: 'Date night planning', date: '2025-12-19', startTime: '12:00', endTime: '12:30' },
];

// =============================================================================
// BACKLOG ITEMS - Organized by category
// =============================================================================

export const backlogItems: BacklogItem[] = [
  // ---------------------------------------------------------------------------
  // GENERAL / PERSONAL - Financial, Family, Planning
  // ---------------------------------------------------------------------------
  {
    id: 'backlog_001',
    title: 'Create financial plan for December',
    description: 'Who we need to buy for: Tor birthday, Girls gifts, Hallie secret Santa from McB, Mcb and Tor stockings ($50 each), Brandon and Annaleise ($20 per gift), Family secret Santa x2 ($50 per gift), Cousin secret Santa x2 ($15 per gift), Blair and Chris baby shower gift ($100)',
    status: 'decomposed',
    priorityRank: 1,
    subtaskIds: ['subtask_001', 'subtask_002', 'subtask_003'],
    categoryId: 'cat_general',
    dueDate: '2025-12-20',
    tags: ['financial'],
  },
  {
    id: 'backlog_002',
    title: 'Plan Torie\'s birthday weekend / celebrations',
    description: 'Coordinate birthday activities and gifts',
    status: 'backlog',
    priorityRank: 2,
    subtaskIds: [],
    categoryId: 'cat_general',
    dueDate: '2025-12-14',
  },
  {
    id: 'backlog_003',
    title: 'Sign up for Fadi financial things',
    description: 'Buy whole life insurance on Ivy, for 500k paid in full at 30 years old - will cost $50/mo. I am the owner not her, when she is 30 I am able to get $350k out for free. This becomes secret stash of cash. Sign up for new kid when she is born. 6.5% return. Do it w aaa insurance (super quality). Universal or whole, not term. $50/mo per kid.',
    status: 'backlog',
    priorityRank: 3,
    subtaskIds: [],
    categoryId: 'cat_general',
    tags: ['financial'],
  },
  {
    id: 'backlog_004',
    title: 'Do budget true up at the end of each week',
    description: 'Look at sources, credit cards, and bank account, and Truebill to see what the net change was.',
    status: 'backlog',
    priorityRank: 4,
    subtaskIds: [],
    categoryId: 'cat_general',
    recurringFrequency: 'weekly',
    recurringInterval: 1,
    tags: ['financial'],
  },
  {
    id: 'backlog_005',
    title: 'Create estate planning legal docs',
    description: 'Use ARAG legal benefits: https://www.araglegal.com/member/',
    status: 'backlog',
    priorityRank: 5,
    subtaskIds: [],
    categoryId: 'cat_general',
    tags: ['financial'],
  },
  {
    id: 'backlog_006',
    title: 'Look into 2 night getaway Dec 27-29',
    description: 'Research options via points or home exchange',
    status: 'backlog',
    priorityRank: 6,
    subtaskIds: [],
    categoryId: 'cat_general',
    dueDate: '2025-12-20',
  },
  {
    id: 'backlog_007',
    title: 'Look into invest America account',
    description: 'Trump plan for kids like 529',
    status: 'backlog',
    priorityRank: 7,
    subtaskIds: [],
    categoryId: 'cat_general',
    tags: ['financial'],
  },

  // ---------------------------------------------------------------------------
  // HOUSE - Home Maintenance, Repairs, Cleaning
  // ---------------------------------------------------------------------------
  {
    id: 'backlog_008',
    title: 'Downgrade Cox internet to $50/mo',
    description: 'Promo expiring - need to call and negotiate',
    status: 'backlog',
    priorityRank: 8,
    subtaskIds: [],
  },
  {
    id: 'backlog_009',
    title: 'Fix stinky downstairs bathroom',
    description: 'Replace the wax seal. Look up on YouTube how to do it.',
    status: 'decomposed',
    priorityRank: 9,
    subtaskIds: ['subtask_004', 'subtask_005', 'subtask_006'],
  },
  {
    id: 'backlog_010',
    title: 'Contract Electrician for backyard outlet',
    description: 'Fix the backyard outlet which causes the power to go out when it rains on the circuit in the garage and the dining room chandelier',
    status: 'backlog',
    priorityRank: 10,
    subtaskIds: [],
  },
  {
    id: 'backlog_011',
    title: 'Look into solar and whole house fan',
    description: 'Research options for home energy efficiency',
    status: 'backlog',
    priorityRank: 11,
    subtaskIds: [],
  },
  {
    id: 'backlog_012',
    title: 'Clean and replace filters in the furnace',
    description: 'Clean the "p trap" condensation trap with a wire down into the PVC pipe',
    status: 'backlog',
    priorityRank: 12,
    subtaskIds: [],
  },
  {
    id: 'backlog_013',
    title: 'Kitchen tv wall revamp',
    description: 'Reorganize and improve the kitchen TV wall setup',
    status: 'backlog',
    priorityRank: 13,
    subtaskIds: [],
  },
  {
    id: 'backlog_014',
    title: 'Kid proof railing upgrade',
    description: 'Make railings safer for kids',
    status: 'backlog',
    priorityRank: 14,
    subtaskIds: [],
  },
  {
    id: 'backlog_015',
    title: 'De cob web our entire house',
    description: 'Deep clean cobwebs from all areas',
    status: 'backlog',
    priorityRank: 15,
    subtaskIds: [],
  },

  // ---------------------------------------------------------------------------
  // MEDICAL - Health Appointments, Preventive Care
  // ---------------------------------------------------------------------------
  {
    id: 'backlog_016',
    title: 'Take pictures of bodies for skin cancer check MONTHLY',
    description: 'Process: 1. Take pictures of key areas on our body, especially with some exposure like back, neck, back of legs, bottom of feet. 2. Google search pictures of skin cancer and compare any questionable marks. 3. Put pictures in a folder for reference with dates.',
    status: 'decomposed',
    priorityRank: 16,
    subtaskIds: ['subtask_007', 'subtask_008', 'subtask_009'],
  },
  {
    id: 'backlog_017',
    title: 'Schedule appointment for mole on belly',
    description: 'Schedule dermatologist appointment',
    status: 'backlog',
    priorityRank: 17,
    subtaskIds: [],
  },
  {
    id: 'backlog_018',
    title: 'Call Mission advanced imaging center',
    description: 'Schedule CT Angio coronary appointment. Phone: 949-364-6900. Address: 27700 Medical Center Rd. Name: Mission advanced imaging center tower two.',
    status: 'backlog',
    priorityRank: 18,
    subtaskIds: [],
  },
  {
    id: 'backlog_019',
    title: 'Research cholesterol meds and other options',
    description: '#health - look into alternatives and discuss with doctor',
    status: 'backlog',
    priorityRank: 19,
    subtaskIds: [],
  },
  {
    id: 'backlog_020',
    title: 'Call and make dental appointments for end of year',
    description: 'Schedule for Ivy, Tor, and MCB before insurance resets',
    status: 'backlog',
    priorityRank: 20,
    subtaskIds: [],
  },

  // ---------------------------------------------------------------------------
  // CAREER / AI - Networking, Skill Building, Projects
  // ---------------------------------------------------------------------------
  {
    id: 'backlog_021',
    title: 'Create AI Workflow Knowledge Base',
    description: 'Building an AI Workflow Knowledge Base - See Claude chat for context',
    status: 'decomposed',
    priorityRank: 21,
    subtaskIds: ['subtask_010', 'subtask_011', 'subtask_012'],
  },
  {
    id: 'backlog_022',
    title: 'Networking - Ask person to meet next week',
    description: 'Goal: meet with one person every week for networking',
    status: 'backlog',
    priorityRank: 22,
    subtaskIds: [],
  },
  {
    id: 'backlog_023',
    title: 'Write script for LinkedIn engagement',
    description: 'Write script that scrapes posts and people on LinkedIn and tells me which to comment on and when (early)',
    status: 'backlog',
    priorityRank: 23,
    subtaskIds: [],
  },
  {
    id: 'backlog_024',
    title: 'Create 3-5 examples from day job for interviews',
    description: 'Then figure out how to translate those to another business',
    status: 'backlog',
    priorityRank: 24,
    subtaskIds: [],
  },
  {
    id: 'backlog_025',
    title: 'Write retro about time at WBX',
    description: 'What would I do differently / how could I do better',
    status: 'backlog',
    priorityRank: 25,
    subtaskIds: [],
  },
  {
    id: 'backlog_026',
    title: 'Read/synthesize Kieran Flanagan marketing post',
    description: 'https://open.substack.com/pub/kieranflanagan/p/ai-changed-everything-how-the-fck',
    status: 'backlog',
    priorityRank: 26,
    subtaskIds: [],
  },
  {
    id: 'backlog_027',
    title: 'Hit up Mat New for product mentorship',
    description: 'Reach out to discuss product mentorship opportunities',
    status: 'backlog',
    priorityRank: 27,
    subtaskIds: [],
  },
  {
    id: 'backlog_028',
    title: 'Build app with compound engineering (vibe coded)',
    description: 'https://github.com/everyinc/compound-engineering-plugin',
    status: 'backlog',
    priorityRank: 28,
    subtaskIds: [],
  },
  {
    id: 'backlog_029',
    title: 'Research ways to maximize HR perks',
    description: 'Review benefits and optimize usage',
    status: 'backlog',
    priorityRank: 29,
    subtaskIds: [],
  },
];

// =============================================================================
// SUBTASKS - Decomposed work items
// =============================================================================

export const subtasks: Subtask[] = [
  // Financial plan for December (backlog_001)
  {
    id: 'subtask_001',
    backlogItemId: 'backlog_001',
    title: 'List all people to buy gifts for with budget per person',
    definitionOfDone: 'Spreadsheet with names, gift ideas, and budget amounts',
    estimatedMinutes: 30,
    status: 'scheduled',
    scheduledBlockId: 'block_001',
  },
  {
    id: 'subtask_002',
    backlogItemId: 'backlog_001',
    title: 'Research gift ideas for each person',
    definitionOfDone: '2-3 gift options per person with links',
    estimatedMinutes: 60,
    status: 'scheduled',
    scheduledBlockId: 'block_002',
  },
  {
    id: 'subtask_003',
    backlogItemId: 'backlog_001',
    title: 'Order all gifts online',
    definitionOfDone: 'All gifts ordered, tracking numbers saved',
    estimatedMinutes: 45,
    status: 'estimated',
    scheduledBlockId: null,
  },

  // Fix bathroom (backlog_009)
  {
    id: 'subtask_004',
    backlogItemId: 'backlog_009',
    title: 'Watch YouTube tutorial on replacing wax seal',
    definitionOfDone: 'Understand the process, note tools needed',
    estimatedMinutes: 30,
    status: 'scheduled',
    scheduledBlockId: 'block_003',
  },
  {
    id: 'subtask_005',
    backlogItemId: 'backlog_009',
    title: 'Buy supplies from Home Depot',
    definitionOfDone: 'Wax ring, bolts, and any tools purchased',
    estimatedMinutes: 45,
    status: 'estimated',
    scheduledBlockId: null,
  },
  {
    id: 'subtask_006',
    backlogItemId: 'backlog_009',
    title: 'Replace wax seal',
    definitionOfDone: 'Toilet reinstalled, no more smell, no leaks',
    estimatedMinutes: 90,
    status: 'estimated',
    scheduledBlockId: null,
  },

  // Skin cancer check (backlog_016)
  {
    id: 'subtask_007',
    backlogItemId: 'backlog_016',
    title: 'Take photos of Torie\'s skin (back, neck, legs, feet)',
    definitionOfDone: 'All key areas photographed with good lighting',
    estimatedMinutes: 20,
    status: 'scheduled',
    scheduledBlockId: 'block_004',
  },
  {
    id: 'subtask_008',
    backlogItemId: 'backlog_016',
    title: 'Take photos of Jon\'s skin (back, neck, legs, feet)',
    definitionOfDone: 'All key areas photographed with good lighting',
    estimatedMinutes: 20,
    status: 'estimated',
    scheduledBlockId: null,
  },
  {
    id: 'subtask_009',
    backlogItemId: 'backlog_016',
    title: 'Compare photos to skin cancer reference images, file photos',
    definitionOfDone: 'Photos organized in dated folder, any concerns noted',
    estimatedMinutes: 30,
    status: 'estimated',
    scheduledBlockId: null,
  },

  // AI Workflow Knowledge Base (backlog_021)
  {
    id: 'subtask_010',
    backlogItemId: 'backlog_021',
    title: 'Define knowledge base structure and categories',
    definitionOfDone: 'Outline of main sections and taxonomy',
    estimatedMinutes: 60,
    status: 'scheduled',
    scheduledBlockId: 'block_005',
  },
  {
    id: 'subtask_011',
    backlogItemId: 'backlog_021',
    title: 'Document 5 AI workflow patterns from Claude chat',
    definitionOfDone: '5 workflows documented with steps and examples',
    estimatedMinutes: 90,
    status: 'overflow',
    scheduledBlockId: null,
  },
  {
    id: 'subtask_012',
    backlogItemId: 'backlog_021',
    title: 'Set up Notion or Obsidian for knowledge base',
    definitionOfDone: 'Tool configured, initial structure created',
    estimatedMinutes: 45,
    status: 'overflow',
    scheduledBlockId: null,
  },
];

// =============================================================================
// TIME BLOCKS - Scheduled work
// =============================================================================

export const timeBlocks: TimeBlock[] = [
  // Monday
  { id: 'block_001', subtaskId: 'subtask_001', date: '2025-12-15', startTime: '09:30', endTime: '10:00' },
  { id: 'block_002', subtaskId: 'subtask_002', date: '2025-12-15', startTime: '10:00', endTime: '11:00' },
  // Tuesday
  { id: 'block_003', subtaskId: 'subtask_004', date: '2025-12-16', startTime: '08:00', endTime: '08:30' },
  // Wednesday
  { id: 'block_004', subtaskId: 'subtask_007', date: '2025-12-17', startTime: '11:00', endTime: '11:20' },
  // Thursday
  { id: 'block_005', subtaskId: 'subtask_010', date: '2025-12-18', startTime: '08:00', endTime: '09:00' },
];

// =============================================================================
// WEEKLY PLAN
// =============================================================================

export const weeklyPlan: WeeklyPlan = {
  id: 'week_2025-12-15',
  weekStartDate: '2025-12-15',
  status: 'planning',
  totalCapacityMinutes: 1080, // After whirlwind buffer (approx 18 hours)
  scheduledMinutes: 230, // Current scheduled time
  overflowSubtaskIds: ['subtask_011', 'subtask_012'],
};

// =============================================================================
// LLM DECOMPOSITION SUGGESTIONS
// Mock suggestions for backlog items that haven't been decomposed
// =============================================================================

export const decompositionSuggestions: Record<string, Partial<Subtask>[]> = {
  backlog_002: [ // Plan Torie's birthday
    { title: 'Decide on birthday activity (dinner, outing, party)', estimatedMinutes: 30, definitionOfDone: 'Activity chosen and booked if needed' },
    { title: 'Plan and order birthday cake', estimatedMinutes: 20, definitionOfDone: 'Cake ordered or ingredients bought' },
    { title: 'Buy birthday gift', estimatedMinutes: 45, definitionOfDone: 'Gift purchased and wrapped' },
    { title: 'Coordinate with family for celebration', estimatedMinutes: 20, definitionOfDone: 'Everyone notified of plans' },
  ],
  backlog_003: [ // Fadi financial things
    { title: 'Call Fadi to discuss whole life insurance options', estimatedMinutes: 30, definitionOfDone: 'Call completed, notes taken on options' },
    { title: 'Research AAA insurance whole life policies', estimatedMinutes: 45, definitionOfDone: 'Quote obtained, terms understood' },
    { title: 'Complete application for Ivy\'s policy', estimatedMinutes: 60, definitionOfDone: 'Application submitted' },
  ],
  backlog_004: [ // Weekly budget true up
    { title: 'Export transactions from credit cards and bank', estimatedMinutes: 15, definitionOfDone: 'All transactions exported to spreadsheet' },
    { title: 'Categorize transactions and compare to budget', estimatedMinutes: 30, definitionOfDone: 'Net change calculated, variances noted' },
    { title: 'Update budget tracker with learnings', estimatedMinutes: 15, definitionOfDone: 'Tracker updated, adjustments made if needed' },
  ],
  backlog_005: [ // Estate planning
    { title: 'Log into ARAG legal portal and explore options', estimatedMinutes: 30, definitionOfDone: 'Understand what documents are available' },
    { title: 'Schedule consultation with ARAG attorney', estimatedMinutes: 15, definitionOfDone: 'Appointment booked' },
    { title: 'Gather information needed for estate docs', estimatedMinutes: 45, definitionOfDone: 'List of assets, beneficiaries, guardians compiled' },
    { title: 'Complete estate planning documents', estimatedMinutes: 120, definitionOfDone: 'Will, healthcare directive, POA completed' },
  ],
  backlog_008: [ // Downgrade Cox internet
    { title: 'Research current Cox promotions and competitor prices', estimatedMinutes: 20, definitionOfDone: 'Know what deals are available' },
    { title: 'Call Cox retention department', estimatedMinutes: 30, definitionOfDone: 'New rate negotiated or service cancelled' },
  ],
  backlog_010: [ // Electrician for backyard outlet
    { title: 'Get 3 quotes from local electricians', estimatedMinutes: 45, definitionOfDone: '3 quotes received with scope of work' },
    { title: 'Choose electrician and schedule work', estimatedMinutes: 15, definitionOfDone: 'Appointment scheduled, deposit paid if needed' },
  ],
  backlog_017: [ // Mole appointment
    { title: 'Find dermatologist that takes insurance', estimatedMinutes: 20, definitionOfDone: 'Doctor identified, reviews checked' },
    { title: 'Call and schedule appointment', estimatedMinutes: 10, definitionOfDone: 'Appointment booked' },
  ],
  backlog_022: [ // Networking
    { title: 'Identify person to reach out to this week', estimatedMinutes: 15, definitionOfDone: 'Person selected from network' },
    { title: 'Send outreach message', estimatedMinutes: 10, definitionOfDone: 'Message sent via LinkedIn or email' },
    { title: 'Prepare talking points for meeting', estimatedMinutes: 20, definitionOfDone: 'Questions and topics ready' },
  ],
  backlog_024: [ // Interview examples
    { title: 'List 5 significant projects from current role', estimatedMinutes: 30, definitionOfDone: 'Projects listed with outcomes' },
    { title: 'Write STAR format stories for top 3 examples', estimatedMinutes: 90, definitionOfDone: '3 stories written in Situation-Task-Action-Result format' },
    { title: 'Practice telling stories out loud', estimatedMinutes: 30, definitionOfDone: 'Can tell each story in 2-3 minutes' },
  ],
  backlog_028: [ // Build app with compound engineering
    { title: 'Review compound engineering plugin documentation', estimatedMinutes: 45, definitionOfDone: 'Understand capabilities and setup' },
    { title: 'Set up local development environment', estimatedMinutes: 60, definitionOfDone: 'Project running locally' },
    { title: 'Build first feature using vibe coding approach', estimatedMinutes: 120, definitionOfDone: 'One feature complete and working' },
  ],
};

// =============================================================================
// DATA ACCESS FUNCTIONS
// =============================================================================

export function getUser(): User {
  return user;
}

export function getExternalEvents(weekStartDate?: string): ExternalEvent[] {
  if (!weekStartDate) return externalEvents;
  return externalEvents.filter((e) => {
    const eventDate = new Date(e.date);
    const weekStart = new Date(weekStartDate);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 5);
    return eventDate >= weekStart && eventDate < weekEnd;
  });
}

export function getBacklogItems(): BacklogItem[] {
  return backlogItems;
}

export function getSubtasks(): Subtask[] {
  return subtasks;
}

export function getTimeBlocks(weekStartDate?: string): TimeBlock[] {
  if (!weekStartDate) return timeBlocks;
  return timeBlocks.filter((b) => {
    const blockDate = new Date(b.date);
    const weekStart = new Date(weekStartDate);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 5);
    return blockDate >= weekStart && blockDate < weekEnd;
  });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function getWeeklyPlan(weekStartDate: string): WeeklyPlan {
  return weeklyPlan;
}

export function getSubtasksForBacklog(backlogId: string): Subtask[] {
  return subtasks.filter((s) => s.backlogItemId === backlogId);
}

export function getBlockForSubtask(subtaskId: string): TimeBlock | undefined {
  return timeBlocks.find((b) => b.subtaskId === subtaskId);
}

export function getEventsForDate(date: string): ExternalEvent[] {
  return externalEvents.filter((e) => e.date === date);
}

export function getBlocksForDate(date: string): TimeBlock[] {
  return timeBlocks.filter((b) => b.date === date);
}

export function getDecompositionSuggestions(backlogId: string): Partial<Subtask>[] {
  return decompositionSuggestions[backlogId] || [];
}

export function getDayColumns(weekStartDate: string): DayColumn[] {
  const weekStart = new Date(weekStartDate);
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  const dayIds = ['mon', 'tue', 'wed', 'thu', 'fri'];
  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  return dayIds.map((id, index) => {
    const date = new Date(weekStart);
    date.setDate(date.getDate() + index);
    const dateStr = date.toISOString().split('T')[0];

    const dayEvents = externalEvents.filter(e => e.date === dateStr);
    const dayBlocks = timeBlocks.filter(b => b.date === dateStr);

    const externalMinutes = dayEvents.reduce((sum, event) => {
      return sum + calculateDuration(event.startTime, event.endTime);
    }, 0);

    const scheduledMinutes = dayBlocks.reduce((sum, block) => {
      return sum + calculateDuration(block.startTime, block.endTime);
    }, 0);

    const totalWorkMinutes = 9 * 60;
    const afterExternals = totalWorkMinutes - externalMinutes;
    const whirlwindMinutes = Math.round(afterExternals * user.whirlwindPercentage);
    const capacity = afterExternals - whirlwindMinutes;

    const shortDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    return {
      id,
      dayName: dayNames[index],
      date: dateStr,
      shortDate,
      capacity,
      scheduledMinutes,
      taskCount: dayBlocks.length,
      isToday: dateStr === todayStr,
    };
  });
}
