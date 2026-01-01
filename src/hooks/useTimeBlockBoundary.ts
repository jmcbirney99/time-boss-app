'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { TimeBlock } from '@/types';
import { timeToMinutes, formatDateKey } from '@/lib/dateUtils';

interface TimeBlockBoundaryState {
  activeBlock: TimeBlock | null;       // Currently active block
  endedBlock: TimeBlock | null;        // Block that just ended (triggers modal)
  minutesRemaining: number | null;     // Countdown within active block
}

interface UseTimeBlockBoundaryReturn extends TimeBlockBoundaryState {
  clearEndedBlock: () => void;
}

/**
 * Hook to detect when time blocks start and end.
 * Runs an interval every 30 seconds to check block boundaries.
 */
export function useTimeBlockBoundary(
  todayBlocks: TimeBlock[]
): UseTimeBlockBoundaryReturn {
  const [activeBlock, setActiveBlock] = useState<TimeBlock | null>(null);
  const [endedBlock, setEndedBlock] = useState<TimeBlock | null>(null);
  const [minutesRemaining, setMinutesRemaining] = useState<number | null>(null);

  // Track the previous active block to detect transitions
  const previousActiveBlockRef = useRef<TimeBlock | null>(null);

  // Track blocks that have already triggered the ended modal
  const handledBlockIdsRef = useRef<Set<string>>(new Set());

  const findActiveBlock = useCallback((blocks: TimeBlock[], now: Date): TimeBlock | null => {
    const todayDateKey = formatDateKey(now);
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    // Find block where: now >= startTime AND now < endTime (for today's date)
    return blocks.find((block) => {
      if (block.date !== todayDateKey) return false;
      if (block.status === 'completed') return false;

      const startMinutes = timeToMinutes(block.startTime);
      const endMinutes = timeToMinutes(block.endTime);

      return currentMinutes >= startMinutes && currentMinutes < endMinutes;
    }) || null;
  }, []);

  const calculateMinutesRemaining = useCallback((block: TimeBlock, now: Date): number => {
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const endMinutes = timeToMinutes(block.endTime);
    return Math.max(0, endMinutes - currentMinutes);
  }, []);

  const checkBoundaries = useCallback(() => {
    const now = new Date();
    const currentActive = findActiveBlock(todayBlocks, now);
    const previousActive = previousActiveBlockRef.current;

    // Check if previous active block has ended (and hasn't been handled yet)
    if (
      previousActive &&
      !currentActive &&
      previousActive.status !== 'completed' &&
      !handledBlockIdsRef.current.has(previousActive.id)
    ) {
      // The previous block has ended - trigger the modal
      setEndedBlock(previousActive);
      handledBlockIdsRef.current.add(previousActive.id);
    }

    // Update active block
    setActiveBlock(currentActive);
    previousActiveBlockRef.current = currentActive;

    // Update minutes remaining
    if (currentActive) {
      setMinutesRemaining(calculateMinutesRemaining(currentActive, now));
    } else {
      setMinutesRemaining(null);
    }
  }, [todayBlocks, findActiveBlock, calculateMinutesRemaining]);

  // Run check immediately on mount and when blocks change
  useEffect(() => {
    checkBoundaries();
  }, [checkBoundaries]);

  // Set up interval to check every 30 seconds
  useEffect(() => {
    const intervalId = setInterval(checkBoundaries, 30 * 1000);
    return () => clearInterval(intervalId);
  }, [checkBoundaries]);

  const clearEndedBlock = useCallback(() => {
    setEndedBlock(null);
  }, []);

  return {
    activeBlock,
    endedBlock,
    minutesRemaining,
    clearEndedBlock,
  };
}
