import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

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
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();

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
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { error } = await supabase
    .from('subtasks')
    .delete()
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
