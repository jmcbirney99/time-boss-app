import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';
import type { User, SupabaseClient } from '@supabase/supabase-js';

// Standard error response format
export interface ApiError {
  error: {
    message: string;
    code?: string;
    details?: unknown;
  };
}

// Error helper functions
export function badRequest(message: string, details?: unknown): NextResponse<ApiError> {
  return NextResponse.json(
    {
      error: {
        message,
        code: 'BAD_REQUEST',
        ...(details !== undefined ? { details } : {}),
      },
    },
    { status: 400 }
  );
}

export function unauthorized(message = 'Unauthorized'): NextResponse<ApiError> {
  return NextResponse.json(
    {
      error: {
        message,
        code: 'UNAUTHORIZED',
      },
    },
    { status: 401 }
  );
}

export function notFound(message = 'Resource not found'): NextResponse<ApiError> {
  return NextResponse.json(
    {
      error: {
        message,
        code: 'NOT_FOUND',
      },
    },
    { status: 404 }
  );
}

export function serverError(message = 'Internal server error', details?: unknown): NextResponse<ApiError> {
  return NextResponse.json(
    {
      error: {
        message,
        code: 'INTERNAL_ERROR',
        ...(details !== undefined ? { details } : {}),
      },
    },
    { status: 500 }
  );
}

// Check if we're in dev bypass mode
export function isDevBypass(): boolean {
  const isDev = process.env.NODE_ENV === 'development';
  const bypassAuth = process.env.BYPASS_AUTH === 'true';
  return isDev && bypassAuth;
}

// Get the appropriate Supabase client for the current mode
// In dev bypass mode, returns admin client that bypasses RLS
// In production, returns regular client with RLS
export async function getServerClient(): Promise<SupabaseClient> {
  if (isDevBypass()) {
    return createAdminClient();
  }
  return createClient();
}

// Cache for dev user to avoid repeated database queries
let cachedDevUser: User | null = null;

async function getOrCreateDevUser(): Promise<User> {
  if (cachedDevUser) {
    return cachedDevUser;
  }

  const adminClient = createAdminClient();

  // Try to get an existing user from auth.users
  const { data: users } = await adminClient.auth.admin.listUsers({ perPage: 1 });

  if (users?.users && users.users.length > 0) {
    cachedDevUser = users.users[0];
    console.log(`[DEV] Using existing user: ${cachedDevUser.email}`);
    return cachedDevUser;
  }

  // No users exist - create a dev user
  const { data: newUser, error } = await adminClient.auth.admin.createUser({
    email: 'dev@localhost.test',
    email_confirm: true,
    user_metadata: { name: 'Dev User' },
  });

  if (error || !newUser.user) {
    throw new Error(`Failed to create dev user: ${error?.message}`);
  }

  cachedDevUser = newUser.user;
  console.log(`[DEV] Created dev user: ${cachedDevUser.email}`);
  return cachedDevUser;
}

// Type for route handlers without params
type SimpleRouteHandler = (request: Request, user: User) => Promise<NextResponse>;

// Type for route handlers with params
type ParamRouteHandler<T = unknown> = (
  request: Request,
  user: User,
  context: T
) => Promise<NextResponse>;

// Overloaded function signatures
export function withAuth(handler: SimpleRouteHandler): (request: Request) => Promise<NextResponse>;
export function withAuth<T>(handler: ParamRouteHandler<T>): (request: Request, context: T) => Promise<NextResponse>;

// Implementation
export function withAuth<T = unknown>(
  handler: SimpleRouteHandler | ParamRouteHandler<T>
) {
  return async (request: Request, context?: T) => {
    if (isDevBypass()) {
      const devUser = await getOrCreateDevUser();
      console.log('[DEV] Auth bypassed, using user:', devUser.email);
      if (context !== undefined) {
        return (handler as ParamRouteHandler<T>)(request, devUser, context);
      }
      return (handler as SimpleRouteHandler)(request, devUser);
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return unauthorized();
    }

    if (context !== undefined) {
      return (handler as ParamRouteHandler<T>)(request, user, context);
    }

    return (handler as SimpleRouteHandler)(request, user);
  };
}
