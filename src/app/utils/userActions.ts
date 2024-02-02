'use server';

import { cookies } from 'next/headers';
import { createClient } from './supabase/actions';
import { User } from '@supabase/supabase-js';

export async function getAuthUser(): Promise<User | null> {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data } = await supabase.auth.getUser();

  return data.user;
}
