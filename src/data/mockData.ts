/**
 * Mock Data - Re-exports from sampleData
 *
 * This file now re-exports all data from sampleData.ts which contains
 * Jon's real personal tasks from iOS Reminders.
 *
 * To switch back to generic work examples, comment out the re-export
 * and uncomment the original mock data below.
 */

// =============================================================================
// ACTIVE DATA SOURCE: Real personal tasks from sampleData.ts
// =============================================================================
export {
  user,
  categories,
  externalEvents,
  backlogItems,
  subtasks,
  timeBlocks,
  weeklyPlan,
  decompositionSuggestions,
  getUser,
  getCategories,
  getCategoryById,
  getExternalEvents,
  getBacklogItems,
  getSubtasks,
  getTimeBlocks,
  getWeeklyPlan,
  getSubtasksForBacklog,
  getBlockForSubtask,
  getEventsForDate,
  getBlocksForDate,
  getDecompositionSuggestions,
  getDayColumns,
} from './sampleData';

// =============================================================================
// ORIGINAL MOCK DATA (commented out - uncomment to use generic examples)
// =============================================================================

/*
import type {
  User,
  ExternalEvent,
  BacklogItem,
  Subtask,
  TimeBlock,
  WeeklyPlan,
  DayColumn,
} from '@/types';
import { calculateDuration } from '@/lib/dateUtils';

// User profile
export const user: User = {
  id: 'user_001',
  name: 'Jon',
  workHours: {
    start: '08:00',
    end: '17:00',
    days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
  },
  whirlwindPercentage: 0.4,
};

// External calendar events (from Google Calendar)
export const externalEvents: ExternalEvent[] = [
  { id: 'ext_001', title: 'Team Standup', date: '2025-12-09', startTime: '09:00', endTime: '09:30' },
  { id: 'ext_002', title: '1:1 with Sarah', date: '2025-12-09', startTime: '14:00', endTime: '14:30' },
  { id: 'ext_003', title: 'Product Review', date: '2025-12-10', startTime: '10:00', endTime: '11:00' },
  { id: 'ext_004', title: 'Sprint Planning', date: '2025-12-10', startTime: '14:00', endTime: '15:30' },
  { id: 'ext_005', title: 'Team Standup', date: '2025-12-10', startTime: '09:00', endTime: '09:30' },
  { id: 'ext_006', title: 'Team Standup', date: '2025-12-11', startTime: '09:00', endTime: '09:30' },
  { id: 'ext_007', title: 'Investor Update Call', date: '2025-12-11', startTime: '11:00', endTime: '12:00' },
  { id: 'ext_008', title: 'Design Review', date: '2025-12-12', startTime: '15:00', endTime: '16:00' },
];

// Backlog items
export const backlogItems: BacklogItem[] = [
  {
    id: 'backlog_001',
    title: 'Launch beta feature',
    description: 'Get the new dashboard feature ready for beta users',
    status: 'decomposed',
    priorityRank: 1,
    subtaskIds: ['subtask_001', 'subtask_002', 'subtask_003', 'subtask_004'],
  },
  {
    id: 'backlog_002',
    title: 'Q1 planning document',
    description: 'Draft the Q1 roadmap and OKRs',
    status: 'decomposed',
    priorityRank: 2,
    subtaskIds: ['subtask_005', 'subtask_006', 'subtask_007'],
  },
  {
    id: 'backlog_003',
    title: 'User research synthesis',
    description: 'Compile findings from user interviews',
    status: 'decomposed',
    priorityRank: 3,
    subtaskIds: ['subtask_008', 'subtask_009'],
  },
  {
    id: 'backlog_004',
    title: 'Review analytics dashboard',
    description: 'Check Q4 metrics and prepare summary',
    status: 'backlog',
    priorityRank: 4,
    subtaskIds: [],
  },
  {
    id: 'backlog_005',
    title: 'Write blog post on AI product management',
    description: 'Personal thought leadership piece',
    status: 'backlog',
    priorityRank: 5,
    subtaskIds: [],
  },
  {
    id: 'backlog_006',
    title: 'Competitive analysis update',
    description: 'Refresh competitive landscape doc',
    status: 'backlog',
    priorityRank: 6,
    subtaskIds: [],
  },
  {
    id: 'backlog_007',
    title: 'Prepare board deck section',
    description: 'Product section for board meeting',
    status: 'backlog',
    priorityRank: 7,
    subtaskIds: [],
  },
  {
    id: 'backlog_008',
    title: 'Side project: capacity planner app',
    description: 'Work on personal productivity app',
    status: 'backlog',
    priorityRank: 8,
    subtaskIds: [],
  },
];

// Subtasks (decomposed work items)
export const subtasks: Subtask[] = [
  {
    id: 'subtask_001',
    backlogItemId: 'backlog_001',
    title: 'Finalize feature scope with engineering',
    definitionOfDone: 'Shared doc with agreed scope, eng sign-off',
    estimatedMinutes: 60,
    status: 'scheduled',
    scheduledBlockId: 'block_001',
  },
  {
    id: 'subtask_002',
    backlogItemId: 'backlog_001',
    title: 'Write beta release notes',
    definitionOfDone: 'Release notes ready for review',
    estimatedMinutes: 60,
    status: 'scheduled',
    scheduledBlockId: 'block_002',
  },
  {
    id: 'subtask_003',
    backlogItemId: 'backlog_001',
    title: 'Create beta user onboarding flow',
    definitionOfDone: 'Figma mockups approved, copy finalized',
    estimatedMinutes: 120,
    status: 'scheduled',
    scheduledBlockId: 'block_003',
  },
  {
    id: 'subtask_004',
    backlogItemId: 'backlog_001',
    title: 'Set up beta feedback collection',
    definitionOfDone: 'Feedback form created, analytics events defined',
    estimatedMinutes: 90,
    status: 'estimated',
    scheduledBlockId: null,
  },
  {
    id: 'subtask_005',
    backlogItemId: 'backlog_002',
    title: 'Review Q4 learnings and metrics',
    definitionOfDone: 'Summary doc with key metrics and lessons',
    estimatedMinutes: 90,
    status: 'scheduled',
    scheduledBlockId: 'block_004',
  },
  {
    id: 'subtask_006',
    backlogItemId: 'backlog_002',
    title: 'Draft Q1 OKRs',
    definitionOfDone: '3-4 objectives with key results, aligned to company goals',
    estimatedMinutes: 120,
    status: 'scheduled',
    scheduledBlockId: 'block_005',
  },
  {
    id: 'subtask_007',
    backlogItemId: 'backlog_002',
    title: 'Create Q1 roadmap visualization',
    definitionOfDone: 'Timeline view with initiatives and milestones',
    estimatedMinutes: 90,
    status: 'overflow',
    scheduledBlockId: null,
  },
  {
    id: 'subtask_008',
    backlogItemId: 'backlog_003',
    title: 'Transcribe and tag interview notes',
    definitionOfDone: 'All 8 interviews transcribed, quotes tagged',
    estimatedMinutes: 180,
    status: 'overflow',
    scheduledBlockId: null,
  },
  {
    id: 'subtask_009',
    backlogItemId: 'backlog_003',
    title: 'Write research synthesis report',
    definitionOfDone: '2-3 page report with findings and recommendations',
    estimatedMinutes: 150,
    status: 'overflow',
    scheduledBlockId: null,
  },
];

// Scheduled time blocks
export const timeBlocks: TimeBlock[] = [
  { id: 'block_001', subtaskId: 'subtask_001', date: '2025-12-09', startTime: '08:00', endTime: '09:00' },
  { id: 'block_002', subtaskId: 'subtask_002', date: '2025-12-09', startTime: '10:00', endTime: '11:00' },
  { id: 'block_003', subtaskId: 'subtask_003', date: '2025-12-09', startTime: '11:00', endTime: '13:00' },
  { id: 'block_004', subtaskId: 'subtask_005', date: '2025-12-10', startTime: '08:00', endTime: '09:00' },
  { id: 'block_005', subtaskId: 'subtask_006', date: '2025-12-10', startTime: '11:30', endTime: '13:30' },
];

// Weekly plan summary
export const weeklyPlan: WeeklyPlan = {
  id: 'week_2025-12-09',
  weekStartDate: '2025-12-09',
  status: 'planning',
  totalCapacityMinutes: 1110, // After whirlwind buffer
  scheduledMinutes: 510,
  overflowSubtaskIds: ['subtask_007', 'subtask_008', 'subtask_009'],
};

// Mock LLM decomposition suggestions for raw backlog items
export const decompositionSuggestions: Record<string, Partial<Subtask>[]> = {
  backlog_004: [
    { title: 'Pull Q4 analytics data from dashboard', estimatedMinutes: 30, definitionOfDone: 'Export key metrics to spreadsheet' },
    { title: 'Analyze trends and anomalies', estimatedMinutes: 60, definitionOfDone: 'List of 5-7 key insights documented' },
    { title: 'Create summary presentation', estimatedMinutes: 90, definitionOfDone: '5-slide deck ready for review' },
  ],
  backlog_005: [
    { title: 'Outline blog post structure', estimatedMinutes: 30, definitionOfDone: 'Detailed outline with main points' },
    { title: 'Write first draft', estimatedMinutes: 120, definitionOfDone: '1500-2000 word draft completed' },
    { title: 'Edit and add examples', estimatedMinutes: 60, definitionOfDone: 'Polished post ready for publication' },
  ],
  backlog_006: [
    { title: 'Update competitor list', estimatedMinutes: 30, definitionOfDone: 'List of 10-15 competitors with recent funding/updates' },
    { title: 'Analyze feature comparisons', estimatedMinutes: 90, definitionOfDone: 'Feature matrix updated' },
    { title: 'Write executive summary', estimatedMinutes: 60, definitionOfDone: '1-page summary of competitive positioning' },
  ],
  backlog_007: [
    { title: 'Gather product metrics', estimatedMinutes: 60, definitionOfDone: 'Key metrics compiled from analytics' },
    { title: 'Create product narrative', estimatedMinutes: 90, definitionOfDone: 'Story arc for board presentation' },
    { title: 'Design slides', estimatedMinutes: 120, definitionOfDone: '8-10 slides ready for review' },
  ],
  backlog_008: [
    { title: 'Define MVP features', estimatedMinutes: 60, definitionOfDone: 'Feature list prioritized' },
    { title: 'Set up project structure', estimatedMinutes: 90, definitionOfDone: 'Repo created, tech stack configured' },
    { title: 'Build weekly planning view', estimatedMinutes: 240, definitionOfDone: 'Basic UI functional' },
  ],
};

// Data access functions (swap these for API calls later)
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
  // In real app, would filter by weekStartDate
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

// Get day columns for week overview (abstract capacity view)
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

    // Get events and blocks for this day
    const dayEvents = externalEvents.filter(e => e.date === dateStr);
    const dayBlocks = timeBlocks.filter(b => b.date === dateStr);

    // Calculate external minutes
    const externalMinutes = dayEvents.reduce((sum, event) => {
      return sum + calculateDuration(event.startTime, event.endTime);
    }, 0);

    // Calculate scheduled minutes
    const scheduledMinutes = dayBlocks.reduce((sum, block) => {
      return sum + calculateDuration(block.startTime, block.endTime);
    }, 0);

    // Daily work minutes (9 hours) minus externals, then minus whirlwind (40%)
    const totalWorkMinutes = 9 * 60;
    const afterExternals = totalWorkMinutes - externalMinutes;
    const whirlwindMinutes = Math.round(afterExternals * user.whirlwindPercentage);
    const capacity = afterExternals - whirlwindMinutes;

    // Format short date
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
*/
