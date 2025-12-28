import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const weekStartDate = searchParams.get('weekStartDate');

  if (!weekStartDate) {
    return NextResponse.json({ error: 'weekStartDate is required' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('weekly_plans')
    .select('*')
    .eq('user_id', user.id)
    .eq('week_start_date', weekStartDate)
    .single();

  if (error && error.code !== 'PGRST116') {
    // PGRST116 = no rows found, which is OK
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data || null);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();

  // Upsert: create or update weekly plan
  const { data, error } = await supabase
    .from('weekly_plans')
    .upsert({
      user_id: user.id,
      week_start_date: body.weekStartDate,
      status: body.status || 'planning',
      committed_at: body.committedAt || null,
      reflection_notes: body.reflectionNotes || null,
    }, {
      onConflict: 'user_id,week_start_date',
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data, { status: 201 });
}
