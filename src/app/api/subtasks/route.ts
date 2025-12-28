import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-utils';
import { SubtaskCreateSchema } from '@/lib/schemas';
import { ZodError } from 'zod';

export const GET = withAuth(async (request, user) => {
  const supabase = await createClient();

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
    body = SubtaskCreateSchema.parse(body);
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({
        error: 'Validation failed',
        details: error.issues.map(issue => ({ field: issue.path.join('.'), message: issue.message }))
      }, { status: 400 });
    }
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }

  // Verify the backlog item belongs to the user
  const { data: backlogItem } = await supabase
    .from('backlog_items')
    .select('id')
    .eq('id', body.backlogItemId)
    .eq('user_id', user.id)
    .single();

  if (!backlogItem) {
    return NextResponse.json({ error: 'Backlog item not found' }, { status: 404 });
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
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data, { status: 201 });
});
