import { NextResponse } from 'next/server';
import { withAuth, badRequest, notFound, serverError, getServerClient } from '@/lib/api-utils';
import { SubtaskCreateSchema } from '@/lib/schemas';
import { ZodError } from 'zod';

export const GET = withAuth(async (request, user) => {
  const supabase = await getServerClient();

  const { searchParams } = new URL(request.url);
  const backlogItemId = searchParams.get('backlogItemId');

  let query = supabase
    .from('subtasks')
    .select(`
      *,
      backlog_items!inner (user_id)
    `)
    .eq('backlog_items.user_id', user.id);

  if (backlogItemId) {
    query = query.eq('backlog_item_id', backlogItemId);
  }

  const { data, error } = await query;

  if (error) {
    return serverError('Failed to fetch subtasks', error.message);
  }
  return NextResponse.json(data);
});

export const POST = withAuth(async (request, user) => {
  const supabase = await getServerClient();

  let body;
  try {
    body = await request.json();
  } catch {
    return badRequest('Invalid JSON in request body');
  }

  // Validate input with Zod
  try {
    body = SubtaskCreateSchema.parse(body);
  } catch (err) {
    if (err instanceof ZodError) {
      return badRequest('Validation failed', err.issues.map(issue => ({ field: issue.path.join('.'), message: issue.message })));
    }
    return badRequest('Invalid input');
  }

  // Verify the backlog item belongs to the user
  const { data: backlogItem } = await supabase
    .from('backlog_items')
    .select('id')
    .eq('id', body.backlogItemId)
    .eq('user_id', user.id)
    .single();

  if (!backlogItem) {
    return notFound('Backlog item not found');
  }

  const { data, error } = await supabase
    .from('subtasks')
    .insert({
      backlog_item_id: body.backlogItemId,
      title: body.title,
      definition_of_done: body.definitionOfDone || null,
      estimated_minutes: body.estimatedMinutes,
      status: body.status || 'estimated',
      llm_generated: body.llmGenerated || false,
      llm_rationale: body.llmRationale || null,
    })
    .select()
    .single();

  if (error) {
    return serverError('Failed to create subtask', error.message);
  }
  return NextResponse.json(data, { status: 201 });
});
