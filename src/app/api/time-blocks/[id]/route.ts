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
    return NextResponse.json({ error: error.message }, { status: 500 });
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
}
