'server-only';

import { Tables } from '@/lib/database.types';
import { User } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { createClient } from './supabase/server';

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
    .maybeSingle();

  return { user, profile };
}
