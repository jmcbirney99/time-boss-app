import {
  BacklogItemSchema,
  SubtaskSchema,
  TimeBlockSchema,
  ExternalEventSchema,
  CategorySchema,
  WeeklyPlanSchema,
  type BacklogItem,
  type Subtask,
  type TimeBlock,
  type ExternalEvent,
  type Category,
  type WeeklyPlan,
} from '@/lib/schemas';
import type { User } from '@/types';

// Helper function for API calls
async function fetchApi<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `HTTP ${res.status}`);
  }

  return res.json();
}

// Helper to convert null to undefined (Zod optional expects undefined, not null)
function nullToUndefined<T>(value: T | null | undefined): T | undefined {
  return value === null ? undefined : value;
}

// Transform database snake_case to TypeScript camelCase with Zod validation
function transformBacklogItem(item: Record<string, unknown>): BacklogItem {
  const transformed = {
    id: item.id,
    title: item.title,
    description: item.description || '',
    status: item.status,
    priorityRank: nullToUndefined(item.priority_rank as number | null),
    priorityLevel: nullToUndefined(item.priority_level as string | null),
    subtaskIds: ((item.subtasks as Array<{ id: string }> | undefined) || []).map(s => s.id),
    categoryId: nullToUndefined(item.category_id as string | null),
    dueDate: nullToUndefined(item.due_date as string | null),
    dueDateEnd: nullToUndefined(item.due_date_end as string | null),
    dueTime: nullToUndefined(item.due_time as string | null),
    recurringFrequency: nullToUndefined(item.recurring_frequency as string | null),
    recurringInterval: nullToUndefined(item.recurring_interval as number | null),
    recurringRule: nullToUndefined(item.recurring_rule as string | null),
    tags: nullToUndefined(item.tags as string[] | null),
    completedAt: nullToUndefined(item.completed_at as string | null),
  };

  return BacklogItemSchema.parse(transformed);
}

function transformSubtask(item: Record<string, unknown>): Subtask {
  const transformed = {
    id: item.id,
    backlogItemId: item.backlog_item_id,
    title: item.title,
    definitionOfDone: item.definition_of_done || '',
    estimatedMinutes: item.estimated_minutes,
    status: item.status,
    scheduledBlockId: null, // Will be set based on time_blocks
    actualMinutes: item.actual_minutes,
    completedAt: item.completed_at,
    progressNote: item.progress_note,
    parentSubtaskId: item.parent_subtask_id,
    llmGenerated: item.llm_generated,
    llmRationale: item.llm_rationale,
  };

  return SubtaskSchema.parse(transformed);
}

function transformTimeBlock(item: Record<string, unknown>): TimeBlock {
  const transformed = {
    id: item.id,
    subtaskId: item.subtask_id,
    date: item.date,
    startTime: item.start_time,
    endTime: item.end_time,
    status: item.status,
  };

  return TimeBlockSchema.parse(transformed);
}

function transformExternalEvent(item: Record<string, unknown>): ExternalEvent {
  const transformed = {
    id: item.id,
    title: item.title,
    date: item.date,
    startTime: item.start_time,
    endTime: item.end_time,
  };

  return ExternalEventSchema.parse(transformed);
}

function transformCategory(item: Record<string, unknown>): Category {
  const transformed = {
    id: item.id,
    name: item.name,
    color: item.color,
  };

  return CategorySchema.parse(transformed);
}

function transformWeeklyPlan(item: Record<string, unknown>): WeeklyPlan {
  const transformed = {
    id: item.id,
    weekStartDate: item.week_start_date,
    status: item.status,
    totalCapacityMinutes: 0, // Calculated on frontend
    scheduledMinutes: 0, // Calculated on frontend
    overflowSubtaskIds: [],
    committedAt: nullToUndefined(item.committed_at as string | null),
    reflectionNotes: nullToUndefined((item.reflection_notes as { notes?: string } | null)?.notes),
  };

  return WeeklyPlanSchema.parse(transformed);
}

// ============================================================================
// Backlog API
// ============================================================================

export async function fetchBacklog(): Promise<BacklogItem[]> {
  const data = await fetchApi<Array<Record<string, unknown>>>('/api/backlog');
  return data.map(transformBacklogItem);
}

export async function fetchBacklogItem(id: string): Promise<BacklogItem> {
  const data = await fetchApi<Record<string, unknown>>(`/api/backlog/${id}`);
  return transformBacklogItem(data);
}

export async function createBacklogItem(item: Partial<BacklogItem>): Promise<BacklogItem> {
  const data = await fetchApi<Record<string, unknown>>('/api/backlog', {
    method: 'POST',
    body: JSON.stringify(item),
  });
  return transformBacklogItem(data);
}

export async function updateBacklogItem(id: string, updates: Partial<BacklogItem>): Promise<BacklogItem> {
  const data = await fetchApi<Record<string, unknown>>(`/api/backlog/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
  return transformBacklogItem(data);
}

export async function deleteBacklogItem(id: string): Promise<void> {
  await fetchApi(`/api/backlog/${id}`, { method: 'DELETE' });
}

// ============================================================================
// Subtasks API
// ============================================================================

export async function fetchSubtasks(backlogItemId?: string): Promise<Subtask[]> {
  const url = backlogItemId
    ? `/api/subtasks?backlogItemId=${backlogItemId}`
    : '/api/subtasks';
  const data = await fetchApi<Array<Record<string, unknown>>>(url);
  return data.map(transformSubtask);
}

export async function createSubtask(subtask: Partial<Subtask>): Promise<Subtask> {
  const data = await fetchApi<Record<string, unknown>>('/api/subtasks', {
    method: 'POST',
    body: JSON.stringify(subtask),
  });
  return transformSubtask(data);
}

export async function updateSubtask(id: string, updates: Partial<Subtask>): Promise<Subtask> {
  const data = await fetchApi<Record<string, unknown>>(`/api/subtasks/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
  return transformSubtask(data);
}

export async function deleteSubtask(id: string): Promise<void> {
  await fetchApi(`/api/subtasks/${id}`, { method: 'DELETE' });
}

// ============================================================================
// Time Blocks API
// ============================================================================

export async function fetchTimeBlocks(startDate?: string, endDate?: string): Promise<TimeBlock[]> {
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  const url = `/api/time-blocks${params.toString() ? `?${params}` : ''}`;
  const data = await fetchApi<Array<Record<string, unknown>>>(url);
  return data.map(transformTimeBlock);
}

export async function createTimeBlock(block: Partial<TimeBlock>): Promise<TimeBlock> {
  const data = await fetchApi<Record<string, unknown>>('/api/time-blocks', {
    method: 'POST',
    body: JSON.stringify(block),
  });
  return transformTimeBlock(data);
}

export async function updateTimeBlock(id: string, updates: Partial<TimeBlock>): Promise<TimeBlock> {
  const data = await fetchApi<Record<string, unknown>>(`/api/time-blocks/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
  return transformTimeBlock(data);
}

export async function deleteTimeBlock(id: string): Promise<void> {
  await fetchApi(`/api/time-blocks/${id}`, { method: 'DELETE' });
}

// ============================================================================
// External Events API
// ============================================================================

export async function fetchExternalEvents(startDate?: string, endDate?: string): Promise<ExternalEvent[]> {
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  const url = `/api/external-events${params.toString() ? `?${params}` : ''}`;
  const data = await fetchApi<Array<Record<string, unknown>>>(url);
  return data.map(transformExternalEvent);
}

export async function createExternalEvent(event: Partial<ExternalEvent>): Promise<ExternalEvent> {
  const data = await fetchApi<Record<string, unknown>>('/api/external-events', {
    method: 'POST',
    body: JSON.stringify(event),
  });
  return transformExternalEvent(data);
}

export async function deleteExternalEvent(id: string): Promise<void> {
  await fetchApi(`/api/external-events/${id}`, { method: 'DELETE' });
}

// ============================================================================
// Weekly Plan API
// ============================================================================

export async function fetchWeeklyPlan(weekStartDate: string): Promise<WeeklyPlan | null> {
  const data = await fetchApi<Record<string, unknown> | null>(
    `/api/weekly-plan?weekStartDate=${weekStartDate}`
  );
  return data ? transformWeeklyPlan(data) : null;
}

export async function upsertWeeklyPlan(plan: Partial<WeeklyPlan>): Promise<WeeklyPlan> {
  const data = await fetchApi<Record<string, unknown>>('/api/weekly-plan', {
    method: 'POST',
    body: JSON.stringify(plan),
  });
  return transformWeeklyPlan(data);
}

// ============================================================================
// User/Profile API
// ============================================================================

export async function fetchUser(): Promise<User> {
  return fetchApi<User>('/api/user');
}

export async function updateUser(updates: Partial<User>): Promise<User> {
  return fetchApi<User>('/api/user', {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
}

// ============================================================================
// Categories API
// ============================================================================

export async function fetchCategories(): Promise<Category[]> {
  const data = await fetchApi<Array<Record<string, unknown>>>('/api/categories');
  return data.map(transformCategory);
}

export async function createCategory(category: Partial<Category>): Promise<Category> {
  const data = await fetchApi<Record<string, unknown>>('/api/categories', {
    method: 'POST',
    body: JSON.stringify(category),
  });
  return transformCategory(data);
}
