// Color palette - sage green theme (calm, meditative)
export const COLORS = {
  task: '#84A98C',      // Sage green - scheduled tasks
  external: '#9CA3AF',  // Warm gray - external calendar events
  overflow: '#F4A89A',  // Coral - overflow warnings
  complete: '#6B8B73',  // Dark sage - completed items
  whirlwind: '#D6D4D1', // Light warm gray for whirlwind stripes
} as const;

// Time estimate options for subtasks
export const TIME_ESTIMATES = [
  { value: 30, label: '30m' },
  { value: 60, label: '1h' },
  { value: 90, label: '1.5h' },
  { value: 120, label: '2h' },
  { value: 180, label: '3h' },
  { value: 240, label: '4h' },
] as const;

// Work hours configuration
export const WORK_HOURS = {
  start: 8,  // 8am
  end: 17,   // 5pm
  totalHours: 9,
} as const;

// Days of the week (Mon-Fri)
export const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] as const;
export const FULL_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] as const;

// Calendar display settings
export const CALENDAR = {
  slotHeight: 60, // pixels per hour
  hoursPerDay: 9,
} as const;

// Status badge variants - sage green theme
export const STATUS_COLORS = {
  backlog: 'bg-stone-100 text-stone-700',
  decomposed: 'bg-sage-100 text-sage-700',
  archived: 'bg-stone-200 text-stone-500',
  scheduled: 'bg-sage-100 text-sage-700',
  completed: 'bg-sage-200 text-sage-800',
  estimated: 'bg-amber-50 text-amber-700',
  overflow: 'bg-coral-50 text-coral-500',
} as const;
