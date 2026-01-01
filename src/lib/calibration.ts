import type { Subtask } from '@/types';

/**
 * Calibration utilities for learning from actual time vs estimated time.
 *
 * These functions help users understand how accurate their estimates are
 * and provide insights to improve future planning.
 */

/**
 * Get completed subtasks that have both estimated and actual times recorded.
 * These are the tasks we can learn from.
 */
export function getCompletedTasksWithTimes(subtasks: Subtask[]): Subtask[] {
  return subtasks.filter(
    (s) =>
      s.status === 'completed' &&
      s.actualMinutes !== undefined &&
      s.actualMinutes > 0 &&
      s.estimatedMinutes > 0
  );
}

/**
 * Calculate a rolling average ratio of actual/estimated time from recent tasks.
 *
 * @param subtasks - All subtasks to analyze
 * @param windowSize - Number of most recent completed tasks to consider (default: 20)
 * @returns Multiplier value (e.g., 1.25 means tasks take 25% longer than estimated)
 */
export function calculateCalibrationMultiplier(
  subtasks: Subtask[],
  windowSize: number = 20
): number {
  const completed = getCompletedTasksWithTimes(subtasks);

  if (completed.length === 0) {
    return 1.0;
  }

  // Sort by completedAt to get most recent first, then take the window
  const sorted = [...completed].sort((a, b) => {
    const aTime = a.completedAt ? new Date(a.completedAt).getTime() : 0;
    const bTime = b.completedAt ? new Date(b.completedAt).getTime() : 0;
    return bTime - aTime; // Most recent first
  });

  const recent = sorted.slice(0, windowSize);

  // Calculate ratio for each task (actual / estimated)
  const ratios = recent.map((s) => s.actualMinutes! / s.estimatedMinutes);

  // Calculate average ratio
  const avgRatio = ratios.reduce((sum, r) => sum + r, 0) / ratios.length;

  // Round to 2 decimal places
  return Math.round(avgRatio * 100) / 100;
}

/**
 * Get a human-readable insight about estimation accuracy.
 *
 * @param multiplier - The calibration multiplier value
 * @returns A friendly message describing estimation patterns
 */
export function getCalibrationInsight(multiplier: number): string {
  if (multiplier > 1.1) {
    const pct = Math.round((multiplier - 1) * 100);
    return `Your tasks typically take ${pct}% longer than estimated`;
  } else if (multiplier < 0.9) {
    const pct = Math.round((1 - multiplier) * 100);
    return `You tend to finish ${pct}% faster than estimated`;
  } else {
    return 'Your estimates are accurate (within 10%)';
  }
}

/**
 * Apply calibration to an estimated time to get a more realistic duration.
 *
 * @param estimatedMinutes - The original estimate
 * @param multiplier - The calibration multiplier
 * @returns Adjusted estimate rounded to nearest 5 minutes
 */
export function applyCalibration(
  estimatedMinutes: number,
  multiplier: number
): number {
  const adjusted = estimatedMinutes * multiplier;
  // Round to nearest 5 minutes for cleaner display
  return Math.round(adjusted / 5) * 5;
}

/**
 * Get statistics about estimation accuracy.
 *
 * @param subtasks - All subtasks to analyze
 * @returns Object with statistics about estimation patterns
 */
export function getCalibrationStats(subtasks: Subtask[]): {
  completedCount: number;
  multiplier: number;
  insight: string;
  hasEnoughData: boolean;
  averageAccuracy: number; // Percentage of estimates that were accurate (within 10%)
} {
  const completed = getCompletedTasksWithTimes(subtasks);
  const multiplier = calculateCalibrationMultiplier(subtasks);
  const insight = getCalibrationInsight(multiplier);

  // Consider we have enough data after 3+ completed tasks with times
  const hasEnoughData = completed.length >= 3;

  // Calculate how many estimates were accurate (within 10% of actual)
  const accurateCount = completed.filter((s) => {
    const ratio = s.actualMinutes! / s.estimatedMinutes;
    return ratio >= 0.9 && ratio <= 1.1;
  }).length;

  const averageAccuracy = completed.length > 0
    ? Math.round((accurateCount / completed.length) * 100)
    : 0;

  return {
    completedCount: completed.length,
    multiplier,
    insight,
    hasEnoughData,
    averageAccuracy,
  };
}
