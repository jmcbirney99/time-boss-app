
import { NextResponse } from 'next/server';
import { withAuth, badRequest, serverError , getServerClient } from '@/lib/api-utils';
import { CategoryCreateSchema } from '@/lib/schemas';
import { ZodError } from 'zod';

export const GET = withAuth(async (request, user) => {
  const supabase = await getServerClient();

  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('user_id', user.id)
    .order('name');

  if (error) {
    return serverError('Failed to fetch categories', error.message);
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
    body = CategoryCreateSchema.parse(body);
  } catch (error) {
    if (error instanceof ZodError) {
      return badRequest('Validation failed', error.issues.map(issue => ({ field: issue.path.join('.'), message: issue.message })));
    }
    return badRequest('Invalid input');
  }

  const { data, error } = await supabase
    .from('categories')
    .insert({
      user_id: user.id,
      name: body.name,
      color: body.color || null,
    })
    .select()
    .single();

  if (error) {
    return serverError('Failed to create category', error.message);
  }
  return NextResponse.json(data, { status: 201 });
});
