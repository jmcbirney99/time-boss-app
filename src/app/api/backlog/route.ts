import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-utils';
import { BacklogItemCreateSchema } from '@/lib/schemas';
import { ZodError } from 'zod';

export const GET = withAuth(async (request, user) => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('backlog_items')
    .select(`
      *,
      subtasks (*)
    `)
    .order('priority_rank');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
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
    body = BacklogItemCreateSchema.parse(body);
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({
        error: 'Validation failed',
        details: error.issues.map(issue => ({ field: issue.path.join('.'), message: issue.message }))
      }, { status: 400 });
    }
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }

  // Get the max priority_rank for the user
  const { data: maxRankData } = await supabase
    .from('backlog_items')
    .select('priority_rank')
    .order('priority_rank', { ascending: false })
    .limit(1)
    .single();

  const nextRank = (maxRankData?.priority_rank ?? 0) + 1;

  const { data, error } = await supabase
    .from('backlog_items')
    .insert({
      user_id: user.id,
      title: body.title,
      description: body.description || null,
      status: body.status || 'backlog',
      priority_rank: body.priorityRank ?? nextRank,
      category_id: body.categoryId || null,
      due_date: body.dueDate || null,
      due_time: body.dueTime || null,
      recurring_frequency: body.recurringFrequency || null,
      recurring_interval: body.recurringInterval || null,
      recurring_rule: body.recurringRule || null,
      tags: body.tags || null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data, { status: 201 });
});
