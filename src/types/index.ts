// User configuration
export interface User {
  id: string;
  name: string;
  workHours: {
    start: string; // "08:00"
    end: string;   // "17:00"
    days: string[]; // ["monday", "tuesday", ...]
  };
  whirlwindPercentage: number; // 0.4 for 40%
  estimationMultiplier: number; // Learned calibration, starts at 1.0
}

// Category for organizing backlog items (from iOS Reminders lists)
export interface Category {
  id: string;
  name: string;
  color?: string; // hex color for UI
}

// Recurring frequency options
export type RecurringFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';

// Priority level for semantic prioritization
export type PriorityLevel = 'high' | 'medium' | 'low' | 'none';

// External calendar events (from Google Calendar, etc.)
export interface ExternalEvent {
  id: string;
  title: string;
  date: string; // "2025-12-09"
  startTime: string; // "09:00"
  endTime: string;   // "09:30"
}

// Backlog item status
export type BacklogItemStatus = 'backlog' | 'decomposed' | 'archived';

// A high-level task in the backlog
export interface BacklogItem {
  id: string;
  title: string;
  description: string;
  status: BacklogItemStatus;
  priorityRank: number;
  priorityLevel?: PriorityLevel; // Semantic priority (high/medium/low/none)
  subtaskIds: string[];
  // Category (from iOS Reminders lists)
  categoryId?: string;
  // Due date/time (from iOS Reminders)
  dueDate?: string; // "2025-12-15"
  dueDateEnd?: string; // "2025-12-17" for date ranges
  dueTime?: string; // "14:00"
  // Recurring pattern (from iOS Reminders)
  recurringFrequency?: RecurringFrequency;
  recurringInterval?: number; // e.g., every 2 weeks
  recurringRule?: string; // custom rule like "every 3 months on the second Saturday"
  // Tags (from iOS Reminders hashtags)
  tags?: string[]; // ["financial", "health"]
  // Completion tracking
  completedAt?: string; // ISO timestamp when archived/completed
}

// Subtask status
export type SubtaskStatus = 'estimated' | 'scheduled' | 'in_progress' | 'completed' | 'overflow' | 'deferred';

// Time estimate options in minutes
export type TimeEstimate = 30 | 60 | 90 | 120 | 180 | 240;

// A decomposed subtask
export interface Subtask {
  id: string;
  backlogItemId: string;
  title: string;
  definitionOfDone: string;
  estimatedMinutes: number;
  status: SubtaskStatus;
  scheduledBlockId: string | null;
  // Time tracking (for calibration loop)
  actualMinutes?: number; // Logged after completion
  completedAt?: string; // ISO timestamp
  // Progress tracking (for time block boundaries)
  progressNote?: string;
  parentSubtaskId?: string; // Link to original if follow-up
  // LLM generation metadata
  llmGenerated?: boolean;
  llmRationale?: string;
}

// Time block status
export type TimeBlockStatus = 'scheduled' | 'completed' | 'partial';

// A scheduled time block on the calendar
export interface TimeBlock {
  id: string;
  subtaskId: string;
  date: string; // "2025-12-09"
  startTime: string; // "08:00"
  endTime: string;   // "09:00"
  status: TimeBlockStatus;
}

// Day column for week overview (abstract capacity view)
export interface DayColumn {
  id: string; // 'mon', 'tue', etc.
  dayName: string; // 'Monday', 'Tuesday', etc.
  date: string; // "2025-12-09"
  shortDate: string; // "Dec 9"
  capacity: number; // available minutes after whirlwind
  scheduledMinutes: number;
  taskCount: number;
  isToday: boolean;
}

// Weekly plan summary
export interface WeeklyPlan {
  id: string;
  weekStartDate: string;
  status: 'planning' | 'committed';
  totalCapacityMinutes: number;
  scheduledMinutes: number;
  overflowSubtaskIds: string[];
  committedAt?: string; // ISO timestamp when plan was committed
  reflectionNotes?: string;
}

// Overflow resolution options
export type OverflowResolution = 'reschedule' | 'backlog' | 'delete' | 'reduce';

// For tracking overflow item resolutions
export interface OverflowItem {
  subtaskId: string;
  resolution?: OverflowResolution;
}

// Capacity calculation result
export interface CapacityResult {
  totalWorkMinutes: number;
  externalMinutes: number;
  whirlwindMinutes: number;
  availableMinutes: number;
  scheduledMinutes: number;
  remainingMinutes: number;
  isOverCapacity: boolean;
  overflowMinutes: number;
}

// Drag and drop types
export type DragItemType = 'subtask' | 'block';

export interface DragData {
  type: DragItemType;
  subtask?: Subtask;
  block?: TimeBlock;
}

export interface DropTargetData {
  type: 'day' | 'backlog';
  dayId?: string; // 'mon', 'tue', etc.
  date?: string;
}

// Daily review action types (for handling yesterday's incomplete tasks)
export type DailyReviewAction = 'reschedule' | 'defer' | 'delete';

// For tracking incomplete item resolutions
export interface IncompleteItemResolution {
  subtaskId: string;
  action: DailyReviewAction;
  newDate?: string; // Required if action is 'reschedule'
}

// Daily review record (for future persistence)
export interface DailyReview {
  id: string;
  date: string;
  completedSubtaskIds: string[];
  incompleteSubtaskIds: string[];
  overflowActions: IncompleteItemResolution[];
  notes?: string;
  completedAt?: string;
}
