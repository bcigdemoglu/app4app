'server-only';

import { cookies } from 'next/headers';
import { createClient } from './supabase/server';
import { User } from '@supabase/supabase-js';
import { Tables } from '@/lib/database.types';

export async function getAuthUser(): Promise<User | null> {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data } = await supabase.auth.getUser();

  return data.user;
}

export async function getAuthUserAndProfile(): Promise<{
  user: User | null;
  profile: Tables<'profiles'> | null;
}> {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .single();

  return { user, profile };
}
