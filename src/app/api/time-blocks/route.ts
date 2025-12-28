import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

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
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();

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
    return NextResponse.json({ error: 'Subtask not found' }, { status: 404 });
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
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Update subtask status to scheduled
  await supabase
    .from('subtasks')
    .update({ status: 'scheduled' })
    .eq('id', body.subtaskId);

  return NextResponse.json(data, { status: 201 });
}
