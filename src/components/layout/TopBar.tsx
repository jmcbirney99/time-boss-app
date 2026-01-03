'use client';

import { OverflowBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { UserMenu } from './UserMenu';
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
  isMobile?: boolean;
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
  isMobile = false,
}: TopBarProps) {
  return (
    <header className="bg-white border-b border-paper-border px-4 md:px-6 py-3 md:py-4">
      <div className="flex items-center justify-between">
        {/* Left: Navigation and week range */}
        <div className="flex items-center gap-3 md:gap-6">
          <nav className="flex items-center gap-2 md:gap-4">
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

          <div className="h-6 w-px bg-paper-border hidden md:block" />

          {/* Week navigation - simplified on mobile */}
          <div className="flex items-center gap-1 md:gap-2">
            <button className="p-1 text-stone-400 hover:text-stone-600 rounded hover:bg-stone-100">
              <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span className={`text-sm font-medium text-stone-900 text-center ${isMobile ? 'min-w-[100px]' : 'min-w-[160px]'}`}>
              {isMobile ? weekDateRange.split(' - ')[0] : weekDateRange}
            </span>
            <button className="p-1 text-stone-400 hover:text-stone-600 rounded hover:bg-stone-100">
              <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Right: Capacity summary + user */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* Capacity stats - hidden on mobile */}
          {!isMobile && (
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
          )}

          {/* Overflow badge - always show if over capacity */}
          {isOverCapacity && (
            <>
              {!isMobile && <div className="h-6 w-px bg-paper-border" />}
              <OverflowBadge minutes={overflowMinutes} />
              {onReviewOverflow && !isMobile && (
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
          {!isMobile && <div className="h-6 w-px bg-paper-border" />}
          {planStatus === 'committed' ? (
            <div className="flex items-center gap-2 md:gap-3">
              <span className="inline-flex items-center gap-1 md:gap-1.5 px-2 md:px-2.5 py-1 bg-sage-100 text-sage-700 text-xs md:text-sm font-medium rounded-full">
                <svg className="w-3.5 h-3.5 md:w-4 md:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {isMobile ? '' : 'Committed'}
              </span>
              {onReplanClick && !isMobile && (
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
                {isMobile ? 'Commit' : 'Commit Plan'}
              </Button>
              {isOverCapacity && !isMobile && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-stone-800 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  Resolve overflow to commit
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-stone-800" />
                </div>
              )}
            </div>
          )}

          {/* User menu */}
          <div className="h-6 w-px bg-paper-border hidden md:block" />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
