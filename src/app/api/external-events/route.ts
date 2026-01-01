
import { NextResponse } from 'next/server';
import { withAuth, badRequest, serverError , getServerClient } from '@/lib/api-utils';
import { ExternalEventCreateSchema } from '@/lib/schemas';
import { ZodError } from 'zod';

export const GET = withAuth(async (request, user) => {
  const supabase = await getServerClient();

  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');

  let query = supabase
    .from('external_events')
    .select('*')
    .eq('user_id', user.id);

  if (startDate) {
    query = query.gte('date', startDate);
  }
  if (endDate) {
    query = query.lte('date', endDate);
  }

  const { data, error } = await query.order('date').order('start_time');

  if (error) {
    return serverError('Failed to fetch external events', error.message);
  }
  return NextResponse.json(data);
});

export const POST = withAuth(async (request, user) => {
  const supabase = await getServerClient();

  let body;
  try {
    body = await request.json();
  } catch (error) {
    return badRequest('Invalid JSON in request body');
  }

  // Validate input with Zod
  try {
    body = ExternalEventCreateSchema.parse(body);
  } catch (error) {
    if (error instanceof ZodError) {
      return badRequest('Validation failed', error.issues.map(issue => ({ field: issue.path.join('.'), message: issue.message })));
    }
    return badRequest('Invalid input');
  }

  const { data, error } = await supabase
    .from('external_events')
    .insert({
      user_id: user.id,
      title: body.title,
      date: body.date,
      start_time: body.startTime,
      end_time: body.endTime,
    })
    .select()
    .single();

  if (error) {
    return serverError('Failed to create external event', error.message);
  }
  return NextResponse.json(data, { status: 201 });
});
