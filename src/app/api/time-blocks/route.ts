
import { NextResponse } from 'next/server';
import { withAuth, badRequest, notFound, serverError , getServerClient } from '@/lib/api-utils';
import { TimeBlockCreateSchema } from '@/lib/schemas';
import { ZodError } from 'zod';

export const GET = withAuth(async (request, user) => {
  const supabase = await getServerClient();

  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');

  let query = supabase
    .from('time_blocks')
    .select(`
      *,
      subtasks!inner (
        *,
        backlog_items!inner (user_id, title)
      )
    `)
    .eq('subtasks.backlog_items.user_id', user.id);

  if (startDate) {
    query = query.gte('date', startDate);
  }
  if (endDate) {
    query = query.lte('date', endDate);
  }

  const { data, error } = await query.order('date').order('start_time');

  if (error) {
    return serverError('Failed to fetch time blocks', error.message);
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
    body = TimeBlockCreateSchema.parse(body);
  } catch (error) {
    if (error instanceof ZodError) {
      return badRequest('Validation failed', error.issues.map(issue => ({ field: issue.path.join('.'), message: issue.message })));
    }
    return badRequest('Invalid input');
  }

  // Verify the subtask belongs to a backlog item owned by the user
  const { data: subtask } = await supabase
    .from('subtasks')
    .select(`
      id,
      backlog_items!inner (user_id)
    `)
    .eq('id', body.subtaskId)
    .eq('backlog_items.user_id', user.id)
    .single();

  if (!subtask) {
    return notFound('Subtask not found');
  }

  const { data, error } = await supabase
    .from('time_blocks')
    .insert({
      subtask_id: body.subtaskId,
      date: body.date,
      start_time: body.startTime,
      end_time: body.endTime,
      status: body.status || 'scheduled',
    })
    .select()
    .single();

  if (error) {
    return serverError('Failed to create time block', error.message);
  }

  // Update subtask status to scheduled
  await supabase
    .from('subtasks')
    .update({ status: 'scheduled' })
    .eq('id', body.subtaskId);

  return NextResponse.json(data, { status: 201 });
});
