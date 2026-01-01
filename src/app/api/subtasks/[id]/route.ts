
import { NextResponse } from 'next/server';
import { withAuth, badRequest, serverError , getServerClient } from '@/lib/api-utils';
import { SubtaskUpdateSchema } from '@/lib/schemas';
import { ZodError } from 'zod';

export const GET = withAuth(async (
  request,
  user,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  const supabase = await getServerClient();

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
    return serverError('Failed to fetch subtask', error.message);
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
    body = SubtaskUpdateSchema.parse(body);
  } catch (error) {
    if (error instanceof ZodError) {
      return badRequest('Validation failed', error.issues.map(issue => ({ field: issue.path.join('.'), message: issue.message })));
    }
    return badRequest('Invalid input');
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
    return serverError('Failed to update subtask', error.message);
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
    .from('subtasks')
    .delete()
    .eq('id', id);

  if (error) {
    return serverError('Failed to delete subtask', error.message);
  }
  return NextResponse.json({ success: true });
});
