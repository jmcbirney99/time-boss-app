import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

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
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();

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
}
