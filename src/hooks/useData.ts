'use client';

import { useState, useEffect, useCallback } from 'react';
import type { BacklogItem, Subtask, TimeBlock, ExternalEvent, User, Category, WeeklyPlan } from '@/types';
import * as api from '@/lib/api';

// Generic data hook with loading, error, and refresh
function useDataFetch<T>(
  fetchFn: () => Promise<T>,
  deps: unknown[] = []
): {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
} {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchFn();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { data, loading, error, refresh };
}

// ============================================================================
// Backlog Hook
// ============================================================================

export function useBacklog() {
  const { data, loading, error, refresh } = useDataFetch<BacklogItem[]>(
    () => api.fetchBacklog(),
    []
  );

  const create = useCallback(async (item: Partial<BacklogItem>) => {
    const newItem = await api.createBacklogItem(item);
    await refresh();
    return newItem;
  }, [refresh]);

  const update = useCallback(async (id: string, updates: Partial<BacklogItem>) => {
    const updated = await api.updateBacklogItem(id, updates);
    await refresh();
    return updated;
  }, [refresh]);

  const remove = useCallback(async (id: string) => {
    await api.deleteBacklogItem(id);
    await refresh();
  }, [refresh]);

  return {
    backlog: data || [],
    loading,
    error,
    refresh,
    create,
    update,
    remove,
  };
}

// ============================================================================
// Subtasks Hook
// ============================================================================

export function useSubtasks(backlogItemId?: string) {
  const { data, loading, error, refresh } = useDataFetch<Subtask[]>(
    () => api.fetchSubtasks(backlogItemId),
    [backlogItemId]
  );

  const create = useCallback(async (subtask: Partial<Subtask>) => {
    const newSubtask = await api.createSubtask(subtask);
    await refresh();
    return newSubtask;
  }, [refresh]);

  const update = useCallback(async (id: string, updates: Partial<Subtask>) => {
    const updated = await api.updateSubtask(id, updates);
    await refresh();
    return updated;
  }, [refresh]);

  const remove = useCallback(async (id: string) => {
    await api.deleteSubtask(id);
    await refresh();
  }, [refresh]);

  return {
    subtasks: data || [],
    loading,
    error,
    refresh,
    create,
    update,
    remove,
  };
}

// ============================================================================
// Time Blocks Hook
// ============================================================================

export function useTimeBlocks(startDate?: string, endDate?: string) {
  const { data, loading, error, refresh } = useDataFetch<TimeBlock[]>(
    () => api.fetchTimeBlocks(startDate, endDate),
    [startDate, endDate]
  );

  const create = useCallback(async (block: Partial<TimeBlock>) => {
    const newBlock = await api.createTimeBlock(block);
    await refresh();
    return newBlock;
  }, [refresh]);

  const update = useCallback(async (id: string, updates: Partial<TimeBlock>) => {
    const updated = await api.updateTimeBlock(id, updates);
    await refresh();
    return updated;
  }, [refresh]);

  const remove = useCallback(async (id: string) => {
    await api.deleteTimeBlock(id);
    await refresh();
  }, [refresh]);

  return {
    timeBlocks: data || [],
    loading,
    error,
    refresh,
    create,
    update,
    remove,
  };
}

// ============================================================================
// External Events Hook
// ============================================================================

export function useExternalEvents(startDate?: string, endDate?: string) {
  const { data, loading, error, refresh } = useDataFetch<ExternalEvent[]>(
    () => api.fetchExternalEvents(startDate, endDate),
    [startDate, endDate]
  );

  const create = useCallback(async (event: Partial<ExternalEvent>) => {
    const newEvent = await api.createExternalEvent(event);
    await refresh();
    return newEvent;
  }, [refresh]);

  const remove = useCallback(async (id: string) => {
    await api.deleteExternalEvent(id);
    await refresh();
  }, [refresh]);

  return {
    events: data || [],
    loading,
    error,
    refresh,
    create,
    remove,
  };
}

// ============================================================================
// Weekly Plan Hook
// ============================================================================

export function useWeeklyPlan(weekStartDate: string) {
  const { data, loading, error, refresh } = useDataFetch<WeeklyPlan | null>(
    () => api.fetchWeeklyPlan(weekStartDate),
    [weekStartDate]
  );

  const upsert = useCallback(async (plan: Partial<WeeklyPlan>) => {
    const updated = await api.upsertWeeklyPlan({
      weekStartDate,
      ...plan,
    });
    await refresh();
    return updated;
  }, [weekStartDate, refresh]);

  return {
    weeklyPlan: data,
    loading,
    error,
    refresh,
    upsert,
  };
}

// ============================================================================
// User Hook
// ============================================================================

export function useUser() {
  const { data, loading, error, refresh } = useDataFetch<User>(
    () => api.fetchUser(),
    []
  );

  const update = useCallback(async (updates: Partial<User>) => {
    const updated = await api.updateUser(updates);
    await refresh();
    return updated;
  }, [refresh]);

  return {
    user: data,
    loading,
    error,
    refresh,
    update,
  };
}

// ============================================================================
// Categories Hook
// ============================================================================

export function useCategories() {
  const { data, loading, error, refresh } = useDataFetch<Category[]>(
    () => api.fetchCategories(),
    []
  );

  const create = useCallback(async (category: Partial<Category>) => {
    const newCategory = await api.createCategory(category);
    await refresh();
    return newCategory;
  }, [refresh]);

  return {
    categories: data || [],
    loading,
    error,
    refresh,
    create,
  };
}

// ============================================================================
// Combined Data Hook (for main page)
// ============================================================================

export function useAppData(weekStartDate: string, weekEndDate: string) {
  const backlog = useBacklog();
  const subtasks = useSubtasks();
  const timeBlocks = useTimeBlocks(weekStartDate, weekEndDate);
  const externalEvents = useExternalEvents(weekStartDate, weekEndDate);
  const user = useUser();
  const weeklyPlan = useWeeklyPlan(weekStartDate);
  const categories = useCategories();

  const loading = backlog.loading || subtasks.loading || timeBlocks.loading ||
                  externalEvents.loading || user.loading || weeklyPlan.loading ||
                  categories.loading;

  const error = backlog.error || subtasks.error || timeBlocks.error ||
                externalEvents.error || user.error || weeklyPlan.error ||
                categories.error;

  const refreshAll = useCallback(async () => {
    await Promise.all([
      backlog.refresh(),
      subtasks.refresh(),
      timeBlocks.refresh(),
      externalEvents.refresh(),
      user.refresh(),
      weeklyPlan.refresh(),
      categories.refresh(),
    ]);
  }, [backlog, subtasks, timeBlocks, externalEvents, user, weeklyPlan, categories]);

  return {
    backlog,
    subtasks,
    timeBlocks,
    externalEvents,
    user,
    weeklyPlan,
    categories,
    loading,
    error,
    refreshAll,
  };
}
