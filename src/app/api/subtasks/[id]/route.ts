import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-utils';
import { SubtaskUpdateSchema } from '@/lib/schemas';
import { ZodError } from 'zod';

export const GET = withAuth(async (
  request,
  user,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('subtasks')
    .select(`
      *,
      backlog_items!inner (user_id),
      time_blocks (*)
    `)
    .eq('id', id)
    .eq('backlog_items.user_id', user.id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
});

export const PUT = withAuth(async (
  request,
  user,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  const supabase = await createClient();

  let body;
  try {
    body = await request.json();
  } catch (error) {
    return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
  }

  // Validate input with Zod
  try {
    body = SubtaskUpdateSchema.parse(body);
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
  if (body.title !== undefined) updateData.title = body.title;
  if (body.definitionOfDone !== undefined) updateData.definition_of_done = body.definitionOfDone;
  if (body.estimatedMinutes !== undefined) updateData.estimated_minutes = body.estimatedMinutes;
  if (body.actualMinutes !== undefined) updateData.actual_minutes = body.actualMinutes;
  if (body.status !== undefined) updateData.status = body.status;
  if (body.llmGenerated !== undefined) updateData.llm_generated = body.llmGenerated;
  if (body.llmRationale !== undefined) updateData.llm_rationale = body.llmRationale;
  if (body.progressNote !== undefined) updateData.progress_note = body.progressNote;
  if (body.parentSubtaskId !== undefined) updateData.parent_subtask_id = body.parentSubtaskId;
  if (body.completedAt !== undefined) updateData.completed_at = body.completedAt;

  const { data, error } = await supabase
    .from('subtasks')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
});

export const DELETE = withAuth(async (
  request,
  user,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  const supabase = await createClient();

  const { error } = await supabase
    .from('subtasks')
    .delete()
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true });
});
