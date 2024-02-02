'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { createClient } from '@/app/utils/supabase/actions';

export async function login(formData: FormData) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const credentials = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  };

  const { error } = await supabase.auth.signInWithPassword(credentials);

  if (error) {
    redirect('/error');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .single();

  if (!profile) {
    revalidatePath('/', 'layout');
    redirect('/my-account');
  } else {
    revalidatePath('/', 'layout');
    redirect('/playground');
  }
}
