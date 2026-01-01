import { NextResponse } from 'next/server';
import { withAuth, badRequest, serverError, getServerClient } from '@/lib/api-utils';
import { TimeBlockUpdateSchema } from '@/lib/schemas';
import { ZodError } from 'zod';
import type { User } from '@supabase/supabase-js';

export const GET = withAuth(async (
  _request: Request,
  user: User,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  const supabase = await getServerClient();

  const { data, error } = await supabase
    .from('time_blocks')
    .select(`
      *,
      subtasks!inner (
        *,
        backlog_items!inner (user_id, title)
      )
    `)
    .eq('id', id)
    .eq('subtasks.backlog_items.user_id', user.id)
    .single();

  if (error) {
    return serverError('Failed to fetch time block', error.message);
  }
  return NextResponse.json(data);
});

export const PUT = withAuth(async (
  request: Request,
  user: User,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  const supabase = await getServerClient();

  let body;
  try {
    body = await request.json();
  } catch {
    return badRequest('Invalid JSON in request body');
  }

  // Validate input with Zod
  try {
    body = TimeBlockUpdateSchema.parse(body);
  } catch (err) {
    if (err instanceof ZodError) {
      return badRequest('Validation failed', err.issues.map(issue => ({ field: issue.path.join('.'), message: issue.message })));
    }
    return badRequest('Invalid input');
  }

  // Convert camelCase to snake_case for database
  const updateData: Record<string, unknown> = {};
  if (body.date !== undefined) updateData.date = body.date;
  if (body.startTime !== undefined) updateData.start_time = body.startTime;
  if (body.endTime !== undefined) updateData.end_time = body.endTime;
  if (body.status !== undefined) updateData.status = body.status;

  const { data, error } = await supabase
    .from('time_blocks')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return serverError('Failed to update time block', error.message);
  }
  return NextResponse.json(data);
});

export const DELETE = withAuth(async (
  _request: Request,
  user: User,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  const supabase = await getServerClient();

  // Get the subtask ID before deleting
  const { data: block } = await supabase
    .from('time_blocks')
    .select('subtask_id')
    .eq('id', id)
    .single();

  const { error } = await supabase
    .from('time_blocks')
    .delete()
    .eq('id', id);

  if (error) {
    return serverError('Failed to delete time block', error.message);
  }

  // If the subtask has no more time blocks, revert status to estimated
  if (block) {
    const { data: remainingBlocks } = await supabase
      .from('time_blocks')
      .select('id')
      .eq('subtask_id', block.subtask_id);

    if (!remainingBlocks || remainingBlocks.length === 0) {
      await supabase
        .from('subtasks')
        .update({ status: 'estimated' })
        .eq('id', block.subtask_id);
    }
  }

  return NextResponse.json({ success: true });
});
