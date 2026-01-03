'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { signOut } from '@/lib/auth';
import Link from 'next/link';

export function UserMenu() {
  const { user, loading } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close on Escape and handle keyboard navigation
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out failed:', error);
      setIsSigningOut(false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setIsOpen(!isOpen);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-stone-200 animate-pulse" />
        <div className="hidden md:block w-20 h-4 bg-stone-200 rounded animate-pulse" />
      </div>
    );
  }

  // Logged out state
  if (!user) {
    return (
      <Link
        href="/login"
        className="px-3 py-1.5 md:px-4 md:py-2 text-sm font-medium text-white bg-sage-600 rounded-lg hover:bg-sage-700 transition-colors"
      >
        Sign In
      </Link>
    );
  }

  // Logged in state
  const initial = user.email?.charAt(0).toUpperCase() || '?';
  const email = user.email || 'User';

  return (
    <div className="relative" ref={menuRef}>
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        className="flex items-center gap-2 rounded-full focus:outline-none focus:ring-2 focus:ring-sage-500 focus:ring-offset-2 hover:opacity-80 transition-opacity"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label="User menu"
      >
        <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-sage-500 flex items-center justify-center text-white text-xs md:text-sm font-medium">
          {initial}
        </div>
        <span className="hidden md:block text-sm text-stone-600 max-w-[150px] truncate" title={email}>
          {email}
        </span>
        <svg
          className="hidden md:block w-4 h-4 text-stone-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-stone-200 py-1 z-40"
          role="menu"
          aria-label="User menu"
        >
          <div className="px-4 py-2 border-b border-stone-100">
            <p className="text-sm font-medium text-stone-900 truncate">{email}</p>
          </div>
          <button
            onClick={handleSignOut}
            disabled={isSigningOut}
            className="w-full text-left px-4 py-2 text-sm text-stone-700 hover:bg-stone-100 disabled:opacity-50 focus:outline-none focus:bg-stone-100"
            role="menuitem"
          >
            {isSigningOut ? 'Signing out...' : 'Sign Out'}
          </button>
        </div>
      )}
    </div>
  );
}
