
import { NextResponse } from 'next/server';
import { withAuth, badRequest, serverError , getServerClient } from '@/lib/api-utils';
import { WeeklyPlanCreateSchema } from '@/lib/schemas';
import { ZodError } from 'zod';

export const GET = withAuth(async (request, user) => {
  const supabase = await getServerClient();

  const { searchParams } = new URL(request.url);
  const weekStartDate = searchParams.get('weekStartDate');

  if (!weekStartDate) {
    return badRequest('weekStartDate query parameter is required');
  }

  const { data, error } = await supabase
    .from('weekly_plans')
    .select('*')
    .eq('user_id', user.id)
    .eq('week_start_date', weekStartDate)
    .single();

  if (error && error.code !== 'PGRST116') {
    // PGRST116 = no rows found, which is OK
    return serverError('Failed to fetch weekly plan', error.message);
  }

  return NextResponse.json(data || null);
});

export const POST = withAuth(async (request, user) => {
  const supabase = await getServerClient();

  let body;
  try {
    body = await request.json();
  } catch (error) {
    return badRequest('Invalid JSON in request body');
  }

  // Validate input with Zod
  try {
    body = WeeklyPlanCreateSchema.parse(body);
  } catch (error) {
    if (error instanceof ZodError) {
      return badRequest('Validation failed', error.issues.map(issue => ({ field: issue.path.join('.'), message: issue.message })));
    }
    return badRequest('Invalid input');
  }

  // Upsert: create or update weekly plan
  const { data, error } = await supabase
    .from('weekly_plans')
    .upsert({
      user_id: user.id,
      week_start_date: body.weekStartDate,
      status: body.status || 'planning',
      committed_at: body.committedAt || null,
      reflection_notes: body.reflectionNotes || null,
    }, {
      onConflict: 'user_id,week_start_date',
    })
    .select()
    .single();

  if (error) {
    return serverError('Failed to save weekly plan', error.message);
  }
  return NextResponse.json(data, { status: 201 });
});
