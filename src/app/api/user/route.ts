import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-utils';
import { UserUpdateSchema } from '@/lib/schemas';
import { ZodError } from 'zod';

export const GET = withAuth(async (request, user) => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Transform snake_case to camelCase for frontend
  return NextResponse.json({
    id: data.id,
    name: data.name,
    workHours: {
      start: data.work_hours_start,
      end: data.work_hours_end,
      days: data.work_days,
    },
    whirlwindPercentage: data.whirlwind_percentage,
    estimationMultiplier: data.estimation_multiplier,
  });
});

export const PUT = withAuth(async (request, user) => {
  const supabase = await createClient();

  let body;
  try {
    body = await request.json();
  } catch (error) {
    return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
  }

  // Validate input with Zod
  try {
    body = UserUpdateSchema.parse(body);
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({
        error: 'Validation failed',
        details: error.issues.map(issue => ({ field: issue.path.join('.'), message: issue.message }))
      }, { status: 400 });
    }
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }

  // Convert camelCase to snake_case for database
  const updateData: Record<string, unknown> = {};
  if (body.name !== undefined) updateData.name = body.name;
  if (body.workHours?.start !== undefined) updateData.work_hours_start = body.workHours.start;
  if (body.workHours?.end !== undefined) updateData.work_hours_end = body.workHours.end;
  if (body.workHours?.days !== undefined) updateData.work_days = body.workHours.days;
  if (body.whirlwindPercentage !== undefined) updateData.whirlwind_percentage = body.whirlwindPercentage;
  if (body.estimationMultiplier !== undefined) updateData.estimation_multiplier = body.estimationMultiplier;

  const { data, error } = await supabase
    .from('profiles')
    .update(updateData)
    .eq('id', user.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    id: data.id,
    name: data.name,
    workHours: {
      start: data.work_hours_start,
      end: data.work_hours_end,
      days: data.work_days,
    },
    whirlwindPercentage: data.whirlwind_percentage,
    estimationMultiplier: data.estimation_multiplier,
  });
});
