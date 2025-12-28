import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import type { User } from '@supabase/supabase-js';

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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (context !== undefined) {
      return (handler as ParamRouteHandler<T>)(request, user, context);
    }

    return (handler as SimpleRouteHandler)(request, user);
  };
}
