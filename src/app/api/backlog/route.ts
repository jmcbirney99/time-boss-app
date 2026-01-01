import { NextResponse } from 'next/server';
import { withAuth, badRequest, serverError, getServerClient } from '@/lib/api-utils';
import { BacklogItemCreateSchema } from '@/lib/schemas';
import { ZodError } from 'zod';

export const GET = withAuth(async (request, user) => {
  const supabase = await getServerClient();

  const { data, error } = await supabase
    .from('backlog_items')
    .select(`
      *,
      subtasks (*)
    `)
    .order('priority_rank');

  if (error) {
    return serverError('Failed to fetch backlog items', error.message);
  }
  return NextResponse.json(data);
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
    body = BacklogItemCreateSchema.parse(body);
  } catch (error) {
    if (error instanceof ZodError) {
      return badRequest('Validation failed', error.issues.map(issue => ({ field: issue.path.join('.'), message: issue.message })));
    }
    return badRequest('Invalid input');
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
    return serverError('Failed to create backlog item', error.message);
  }
  return NextResponse.json(data, { status: 201 });
});
