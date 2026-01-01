import { NextResponse } from 'next/server';
import { withAuth, serverError, getServerClient } from '@/lib/api-utils';
import type { User } from '@supabase/supabase-js';

export const DELETE = withAuth(async (
  _request: Request,
  user: User,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  const supabase = await getServerClient();

  const { error } = await supabase
    .from('external_events')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    return serverError('Failed to delete external event', error.message);
  }
  return NextResponse.json({ success: true });
});
