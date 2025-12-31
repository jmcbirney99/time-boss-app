import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import type { User } from '@supabase/supabase-js';

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
        ...(details && { details }),
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
        ...(details && { details }),
      },
    },
    { status: 500 }
  );
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
