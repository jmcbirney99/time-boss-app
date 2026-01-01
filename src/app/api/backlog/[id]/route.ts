
import { NextResponse } from 'next/server';
import { withAuth, badRequest, serverError , getServerClient } from '@/lib/api-utils';
import { BacklogItemUpdateSchema } from '@/lib/schemas';
import { ZodError } from 'zod';

export const GET = withAuth(async (
  request,
  user,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  const supabase = await getServerClient();

  const { data, error } = await supabase
    .from('backlog_items')
    .select(`
      *,
      subtasks (*)
    `)
    .eq('id', id)
    .single();

  if (error) {
    return serverError('Failed to fetch backlog item', error.message);
  }
  return NextResponse.json(data);
});

export const PUT = withAuth(async (
  request,
  user,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  const supabase = await getServerClient();

  let body;
  try {
    body = await request.json();
  } catch (error) {
    return badRequest('Invalid JSON in request body');
  }

  // Validate input with Zod
  try {
    body = BacklogItemUpdateSchema.parse(body);
  } catch (error) {
    if (error instanceof ZodError) {
      return badRequest('Validation failed', error.issues.map(issue => ({ field: issue.path.join('.'), message: issue.message })));
    }
    return badRequest('Invalid input');
  }

  // Convert camelCase to snake_case for database
  const updateData: Record<string, unknown> = {};
  if (body.title !== undefined) updateData.title = body.title;
  if (body.description !== undefined) updateData.description = body.description;
  if (body.status !== undefined) updateData.status = body.status;
  if (body.priorityRank !== undefined) updateData.priority_rank = body.priorityRank;
  if (body.categoryId !== undefined) updateData.category_id = body.categoryId;
  if (body.dueDate !== undefined) updateData.due_date = body.dueDate;
  if (body.dueTime !== undefined) updateData.due_time = body.dueTime;
  if (body.recurringFrequency !== undefined) updateData.recurring_frequency = body.recurringFrequency;
  if (body.recurringInterval !== undefined) updateData.recurring_interval = body.recurringInterval;
  if (body.recurringRule !== undefined) updateData.recurring_rule = body.recurringRule;
  if (body.tags !== undefined) updateData.tags = body.tags;

  const { data, error } = await supabase
    .from('backlog_items')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return serverError('Failed to update backlog item', error.message);
  }
  return NextResponse.json(data);
});

export const DELETE = withAuth(async (
  request,
  user,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  const supabase = await getServerClient();

  const { error } = await supabase
    .from('backlog_items')
    .delete()
    .eq('id', id);

  if (error) {
    return serverError('Failed to delete backlog item', error.message);
  }
  return NextResponse.json({ success: true });
});
