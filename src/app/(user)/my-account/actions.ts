'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { createClient } from '@/app/utils/supabase/actions';

export async function updateProfile(formData: FormData) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  const { error: authError } = await supabase.auth.getUser();

  if (authError) {
    redirect('/error');
  }

  const userProfile = {
    firstname: formData.get('firstname') as string,
    lastname: formData.get('lastname') as string,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase.from('profiles').upsert(userProfile);

  if (error) {
    redirect('/error');
  }

  revalidatePath('/', 'layout');
  redirect('/my-account');
}

export async function logout() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { error } = await supabase.auth.signOut();

  if (error) {
    redirect('/error');
  }

  revalidatePath('/', 'layout');
}
