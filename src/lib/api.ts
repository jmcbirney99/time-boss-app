import type { BacklogItem, Subtask, TimeBlock, ExternalEvent, User, Category, WeeklyPlan } from '@/types';

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

// Transform database snake_case to TypeScript camelCase
function transformBacklogItem(item: Record<string, unknown>): BacklogItem {
  return {
    id: item.id as string,
    title: item.title as string,
    description: (item.description as string) || '',
    status: item.status as BacklogItem['status'],
    priorityRank: item.priority_rank as number,
    subtaskIds: ((item.subtasks as Array<{ id: string }>) || []).map(s => s.id),
    categoryId: item.category_id as string | undefined,
    dueDate: item.due_date as string | undefined,
    dueTime: item.due_time as string | undefined,
    recurringFrequency: item.recurring_frequency as BacklogItem['recurringFrequency'],
    recurringInterval: item.recurring_interval as number | undefined,
    recurringRule: item.recurring_rule as string | undefined,
    tags: item.tags as string[] | undefined,
  };
}

function transformSubtask(item: Record<string, unknown>): Subtask {
  return {
    id: item.id as string,
    backlogItemId: item.backlog_item_id as string,
    title: item.title as string,
    definitionOfDone: (item.definition_of_done as string) || '',
    estimatedMinutes: item.estimated_minutes as number,
    status: item.status as Subtask['status'],
    scheduledBlockId: null, // Will be set based on time_blocks
    actualMinutes: item.actual_minutes as number | undefined,
    completedAt: item.completed_at as string | undefined,
    progressNote: item.progress_note as string | undefined,
    parentSubtaskId: item.parent_subtask_id as string | undefined,
    llmGenerated: item.llm_generated as boolean | undefined,
    llmRationale: item.llm_rationale as string | undefined,
  };
}

function transformTimeBlock(item: Record<string, unknown>): TimeBlock {
  return {
    id: item.id as string,
    subtaskId: item.subtask_id as string,
    date: item.date as string,
    startTime: item.start_time as string,
    endTime: item.end_time as string,
    status: item.status as TimeBlock['status'],
  };
}

function transformExternalEvent(item: Record<string, unknown>): ExternalEvent {
  return {
    id: item.id as string,
    title: item.title as string,
    date: item.date as string,
    startTime: item.start_time as string,
    endTime: item.end_time as string,
  };
}

function transformCategory(item: Record<string, unknown>): Category {
  return {
    id: item.id as string,
    name: item.name as string,
    color: item.color as string | undefined,
  };
}

function transformWeeklyPlan(item: Record<string, unknown>): WeeklyPlan {
  return {
    id: item.id as string,
    weekStartDate: item.week_start_date as string,
    status: item.status as WeeklyPlan['status'],
    totalCapacityMinutes: 0, // Calculated on frontend
    scheduledMinutes: 0, // Calculated on frontend
    overflowSubtaskIds: [],
    committedAt: item.committed_at as string | undefined,
    reflectionNotes: (item.reflection_notes as { notes?: string })?.notes,
  };
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
