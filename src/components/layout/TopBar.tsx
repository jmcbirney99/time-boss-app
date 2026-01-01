'use client';

import { OverflowBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

interface TopBarProps {
  weekDateRange: string;
  totalCapacity: string;
  scheduled: string;
  remaining: string;
  isOverCapacity: boolean;
  overflowMinutes?: number;
  onReviewOverflow?: () => void;
  planStatus?: 'planning' | 'committed';
  onCommitClick?: () => void;
  onReplanClick?: () => void;
}

export function TopBar({
  weekDateRange,
  totalCapacity,
  scheduled,
  remaining,
  isOverCapacity,
  overflowMinutes = 0,
  onReviewOverflow,
  planStatus = 'planning',
  onCommitClick,
  onReplanClick,
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

          {/* Commit/Committed section */}
          <div className="h-6 w-px bg-paper-border" />
          {planStatus === 'committed' ? (
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-sage-100 text-sage-700 text-sm font-medium rounded-full">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Committed
              </span>
              {onReplanClick && (
                <button
                  onClick={onReplanClick}
                  className="text-sm font-medium text-stone-500 hover:text-stone-700 hover:underline"
                >
                  Re-plan
                </button>
              )}
            </div>
          ) : (
            <div className="relative group">
              <Button
                size="sm"
                onClick={isOverCapacity ? undefined : onCommitClick}
                aria-disabled={isOverCapacity}
                className={isOverCapacity ? 'opacity-50 cursor-not-allowed' : ''}
              >
                Commit Plan
              </Button>
              {isOverCapacity && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-stone-800 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  Resolve overflow to commit
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-stone-800" />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
