'use client';

import { OverflowBadge } from '@/components/ui/Badge';
import Link from 'next/link';

interface TopBarProps {
  weekDateRange: string;
  totalCapacity: string;
  scheduled: string;
  remaining: string;
  isOverCapacity: boolean;
  overflowMinutes?: number;
  onReviewOverflow?: () => void;
}

export function TopBar({
  weekDateRange,
  totalCapacity,
  scheduled,
  remaining,
  isOverCapacity,
  overflowMinutes = 0,
  onReviewOverflow,
}: TopBarProps) {
  return (
    <header className="bg-white border-b border-paper-border px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left: Navigation and week range */}
        <div className="flex items-center gap-6">
          <nav className="flex items-center gap-4">
            <Link
              href="/"
              className="text-sm font-medium text-stone-900 hover:text-sage-600"
            >
              Week
            </Link>
            <Link
              href="/today"
              className="text-sm font-medium text-stone-500 hover:text-sage-600"
            >
              Today
            </Link>
          </nav>

          <div className="h-6 w-px bg-paper-border" />

          {/* Week navigation */}
          <div className="flex items-center gap-2">
            <button className="p-1 text-stone-400 hover:text-stone-600 rounded hover:bg-stone-100">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="text-sm font-medium text-stone-900 min-w-[160px] text-center">
              {weekDateRange}
            </span>
            <button className="p-1 text-stone-400 hover:text-stone-600 rounded hover:bg-stone-100">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Right: Capacity summary */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-6 text-sm">
            <div>
              <span className="text-stone-500">Capacity:</span>{' '}
              <span className="font-medium text-stone-900">{totalCapacity}</span>
            </div>
            <div>
              <span className="text-stone-500">Scheduled:</span>{' '}
              <span className="font-medium text-stone-900">{scheduled}</span>
            </div>
            <div>
              <span className="text-stone-500">Remaining:</span>{' '}
              <span className={`font-medium ${isOverCapacity ? 'text-coral-500' : 'text-sage-600'}`}>
                {isOverCapacity ? `-${remaining}` : remaining}
              </span>
            </div>
          </div>

          {isOverCapacity && (
            <>
              <div className="h-6 w-px bg-paper-border" />
              <OverflowBadge minutes={overflowMinutes} />
              {onReviewOverflow && (
                <button
                  onClick={onReviewOverflow}
                  className="text-sm font-medium text-coral-500 hover:text-coral-400 hover:underline"
                >
                  Review
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
}
