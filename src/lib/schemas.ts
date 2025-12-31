import { z } from 'zod';

// Enums
export const BacklogItemStatusSchema = z.enum(['backlog', 'decomposed', 'archived']);
export const RecurringFrequencySchema = z.enum(['daily', 'weekly', 'monthly', 'yearly', 'custom']);
export const SubtaskStatusSchema = z.enum(['estimated', 'scheduled', 'in_progress', 'completed', 'overflow', 'deferred']);
export const TimeBlockStatusSchema = z.enum(['scheduled', 'completed', 'partial']);

// Category Schema
export const CategoryCreateSchema = z.object({
  name: z.string().min(1, 'Category name is required'),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Color must be a valid hex color').optional(),
});

export const CategorySchema = CategoryCreateSchema.extend({
  id: z.string(),
});

// BacklogItem Schemas
export const BacklogItemCreateSchema = z.object({
  title: z.string().min(1, 'Title is required').max(500, 'Title must be 500 characters or less'),
  description: z.string().max(5000, 'Description must be 5000 characters or less').optional().default(''),
  status: BacklogItemStatusSchema.optional().default('backlog'),
  priorityRank: z.number().int().positive().optional(),
  categoryId: z.string().uuid('Invalid category ID').optional(),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Due date must be in YYYY-MM-DD format').optional(),
  dueTime: z.string().regex(/^\d{2}:\d{2}$/, 'Due time must be in HH:MM format').optional(),
  recurringFrequency: RecurringFrequencySchema.optional(),
  recurringInterval: z.number().int().positive().optional(),
  recurringRule: z.string().max(500).optional(),
  tags: z.array(z.string().min(1)).optional(),
});

export const BacklogItemUpdateSchema = z.object({
  title: z.string().min(1, 'Title is required').max(500, 'Title must be 500 characters or less').optional(),
  description: z.string().max(5000, 'Description must be 5000 characters or less').optional(),
  status: BacklogItemStatusSchema.optional(),
  priorityRank: z.number().int().positive().optional(),
  categoryId: z.string().uuid('Invalid category ID').nullable().optional(),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Due date must be in YYYY-MM-DD format').nullable().optional(),
  dueTime: z.string().regex(/^\d{2}:\d{2}$/, 'Due time must be in HH:MM format').nullable().optional(),
  recurringFrequency: RecurringFrequencySchema.nullable().optional(),
  recurringInterval: z.number().int().positive().nullable().optional(),
  recurringRule: z.string().max(500).nullable().optional(),
  tags: z.array(z.string().min(1)).nullable().optional(),
}).refine((data) => Object.keys(data).length > 0, {
  message: 'At least one field must be provided for update',
});

export const BacklogItemSchema = BacklogItemCreateSchema.extend({
  id: z.string(),
  subtaskIds: z.array(z.string()),
});

// Subtask Schemas
export const SubtaskCreateSchema = z.object({
  backlogItemId: z.string().uuid('Invalid backlog item ID'),
  title: z.string().min(1, 'Title is required').max(500, 'Title must be 500 characters or less'),
  definitionOfDone: z.string().max(2000, 'Definition of done must be 2000 characters or less').optional(),
  estimatedMinutes: z.number().int().positive('Estimated minutes must be a positive number'),
  status: SubtaskStatusSchema.optional().default('estimated'),
  llmGenerated: z.boolean().optional().default(false),
  llmRationale: z.string().max(1000).optional(),
});

export const SubtaskUpdateSchema = z.object({
  title: z.string().min(1, 'Title is required').max(500, 'Title must be 500 characters or less').optional(),
  definitionOfDone: z.string().max(2000, 'Definition of done must be 2000 characters or less').nullable().optional(),
  estimatedMinutes: z.number().int().positive('Estimated minutes must be a positive number').optional(),
  actualMinutes: z.number().int().positive('Actual minutes must be a positive number').nullable().optional(),
  status: SubtaskStatusSchema.optional(),
  llmGenerated: z.boolean().optional(),
  llmRationale: z.string().max(1000).nullable().optional(),
  progressNote: z.string().max(2000).nullable().optional(),
  parentSubtaskId: z.string().uuid().nullable().optional(),
  completedAt: z.string().datetime().nullable().optional(),
}).refine((data) => Object.keys(data).length > 0, {
  message: 'At least one field must be provided for update',
});

export const SubtaskSchema = SubtaskCreateSchema.extend({
  id: z.string(),
  scheduledBlockId: z.string().nullable(),
  actualMinutes: z.number().int().positive().optional(),
  completedAt: z.string().datetime().optional(),
  progressNote: z.string().optional(),
  parentSubtaskId: z.string().optional(),
});

// TimeBlock Schemas
const TimeBlockBaseSchema = z.object({
  subtaskId: z.string().uuid('Invalid subtask ID'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Start time must be in HH:MM format'),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, 'End time must be in HH:MM format'),
  status: TimeBlockStatusSchema.optional().default('scheduled'),
});

export const TimeBlockCreateSchema = TimeBlockBaseSchema.refine((data) => {
  // Validate that endTime is after startTime
  const [startHour, startMin] = data.startTime.split(':').map(Number);
  const [endHour, endMin] = data.endTime.split(':').map(Number);
  const startMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;
  return endMinutes > startMinutes;
}, {
  message: 'End time must be after start time',
  path: ['endTime'],
});

export const TimeBlockUpdateSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format').optional(),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Start time must be in HH:MM format').optional(),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, 'End time must be in HH:MM format').optional(),
  status: TimeBlockStatusSchema.optional(),
}).refine((data) => Object.keys(data).length > 0, {
  message: 'At least one field must be provided for update',
}).refine((data) => {
  // Only validate time order if both times are provided
  if (data.startTime && data.endTime) {
    const [startHour, startMin] = data.startTime.split(':').map(Number);
    const [endHour, endMin] = data.endTime.split(':').map(Number);
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    return endMinutes > startMinutes;
  }
  return true;
}, {
  message: 'End time must be after start time',
  path: ['endTime'],
});

export const TimeBlockSchema = TimeBlockBaseSchema.extend({
  id: z.string(),
});

// ExternalEvent Schemas
const ExternalEventBaseSchema = z.object({
  title: z.string().min(1, 'Title is required').max(500, 'Title must be 500 characters or less'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Start time must be in HH:MM format'),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, 'End time must be in HH:MM format'),
});

export const ExternalEventCreateSchema = ExternalEventBaseSchema.refine((data) => {
  // Validate that endTime is after startTime
  const [startHour, startMin] = data.startTime.split(':').map(Number);
  const [endHour, endMin] = data.endTime.split(':').map(Number);
  const startMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;
  return endMinutes > startMinutes;
}, {
  message: 'End time must be after start time',
  path: ['endTime'],
});

export const ExternalEventSchema = ExternalEventBaseSchema.extend({
  id: z.string(),
});

// WeeklyPlan Schemas
export const WeeklyPlanCreateSchema = z.object({
  weekStartDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Week start date must be in YYYY-MM-DD format'),
  status: z.enum(['planning', 'committed']).optional().default('planning'),
  committedAt: z.string().datetime().nullable().optional(),
  reflectionNotes: z.string().max(5000, 'Reflection notes must be 5000 characters or less').nullable().optional(),
});

export const WeeklyPlanSchema = WeeklyPlanCreateSchema.extend({
  id: z.string(),
  totalCapacityMinutes: z.number(),
  scheduledMinutes: z.number(),
  overflowSubtaskIds: z.array(z.string()),
});

// User/Profile Schemas
export const UserUpdateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200, 'Name must be 200 characters or less').optional(),
  workHours: z.object({
    start: z.string().regex(/^\d{2}:\d{2}$/, 'Work hours start must be in HH:MM format').optional(),
    end: z.string().regex(/^\d{2}:\d{2}$/, 'Work hours end must be in HH:MM format').optional(),
    days: z.array(z.enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'])).optional(),
  }).optional(),
  whirlwindPercentage: z.number().min(0, 'Whirlwind percentage must be at least 0').max(1, 'Whirlwind percentage must be at most 1').optional(),
  estimationMultiplier: z.number().min(0.1, 'Estimation multiplier must be at least 0.1').max(10, 'Estimation multiplier must be at most 10').optional(),
}).refine((data) => {
  // Validate work hours if both start and end are provided
  if (data.workHours?.start && data.workHours?.end) {
    const [startHour, startMin] = data.workHours.start.split(':').map(Number);
    const [endHour, endMin] = data.workHours.end.split(':').map(Number);
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    return endMinutes > startMinutes;
  }
  return true;
}, {
  message: 'Work hours end must be after work hours start',
  path: ['workHours', 'end'],
}).refine((data) => Object.keys(data).length > 0, {
  message: 'At least one field must be provided for update',
});

export const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  workHours: z.object({
    start: z.string(),
    end: z.string(),
    days: z.array(z.string()),
  }),
  whirlwindPercentage: z.number(),
  estimationMultiplier: z.number(),
});

// DailyReview Schema (for future use)
export const DailyReviewCreateSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  completedSubtaskIds: z.array(z.string().uuid()),
  incompleteSubtaskIds: z.array(z.string().uuid()),
  overflowActions: z.array(z.object({
    subtaskId: z.string().uuid(),
    action: z.enum(['reschedule', 'defer', 'delete']),
    newDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  })),
  notes: z.string().max(5000).optional(),
  completedAt: z.string().datetime().optional(),
});

export const DailyReviewSchema = DailyReviewCreateSchema.extend({
  id: z.string(),
});

// Export TypeScript types derived from schemas
export type BacklogItemCreate = z.infer<typeof BacklogItemCreateSchema>;
export type BacklogItemUpdate = z.infer<typeof BacklogItemUpdateSchema>;
export type BacklogItem = z.infer<typeof BacklogItemSchema>;

export type SubtaskCreate = z.infer<typeof SubtaskCreateSchema>;
export type SubtaskUpdate = z.infer<typeof SubtaskUpdateSchema>;
export type Subtask = z.infer<typeof SubtaskSchema>;

export type TimeBlockCreate = z.infer<typeof TimeBlockCreateSchema>;
export type TimeBlockUpdate = z.infer<typeof TimeBlockUpdateSchema>;
export type TimeBlock = z.infer<typeof TimeBlockSchema>;

export type ExternalEventCreate = z.infer<typeof ExternalEventCreateSchema>;
export type ExternalEvent = z.infer<typeof ExternalEventSchema>;

export type CategoryCreate = z.infer<typeof CategoryCreateSchema>;
export type Category = z.infer<typeof CategorySchema>;

export type WeeklyPlanCreate = z.infer<typeof WeeklyPlanCreateSchema>;
export type WeeklyPlan = z.infer<typeof WeeklyPlanSchema>;

export type UserUpdate = z.infer<typeof UserUpdateSchema>;
export type User = z.infer<typeof UserSchema>;

export type DailyReviewCreate = z.infer<typeof DailyReviewCreateSchema>;
export type DailyReview = z.infer<typeof DailyReviewSchema>;
