import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { withAuth, serverError } from '@/lib/api-utils';

export const DELETE = withAuth(async (
  request,
  user,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  const supabase = await createClient();

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
