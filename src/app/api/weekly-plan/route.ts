import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-utils';
import { WeeklyPlanCreateSchema } from '@/lib/schemas';
import { ZodError } from 'zod';

export const GET = withAuth(async (request, user) => {
  const supabase = await createClient();

  const { searchParams } = new URL(request.url);
  const weekStartDate = searchParams.get('weekStartDate');

  if (!weekStartDate) {
    return NextResponse.json({ error: 'weekStartDate is required' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('weekly_plans')
    .select('*')
    .eq('user_id', user.id)
    .eq('week_start_date', weekStartDate)
    .single();

  if (error && error.code !== 'PGRST116') {
    // PGRST116 = no rows found, which is OK
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data || null);
});

export const POST = withAuth(async (request, user) => {
  const supabase = await createClient();

  let body;
  try {
    body = await request.json();
  } catch (error) {
    return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
  }

  // Validate input with Zod
  try {
    body = WeeklyPlanCreateSchema.parse(body);
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({
        error: 'Validation failed',
        details: error.issues.map(issue => ({ field: issue.path.join('.'), message: issue.message }))
      }, { status: 400 });
    }
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
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
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data, { status: 201 });
});
