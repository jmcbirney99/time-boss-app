import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('backlog_items')
    .select(`
      *,
      subtasks (*)
    `)
    .order('priority_rank');

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

  // Get the max priority_rank for the user
  const { data: maxRankData } = await supabase
    .from('backlog_items')
    .select('priority_rank')
    .order('priority_rank', { ascending: false })
    .limit(1)
    .single();

  const nextRank = (maxRankData?.priority_rank ?? 0) + 1;

  const { data, error } = await supabase
    .from('backlog_items')
    .insert({
      user_id: user.id,
      title: body.title,
      description: body.description || null,
      status: body.status || 'backlog',
      priority_rank: body.priority_rank ?? nextRank,
      category_id: body.categoryId || null,
      due_date: body.dueDate || null,
      due_time: body.dueTime || null,
      recurring_frequency: body.recurringFrequency || null,
      recurring_interval: body.recurringInterval || null,
      recurring_rule: body.recurringRule || null,
      tags: body.tags || null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data, { status: 201 });
}
