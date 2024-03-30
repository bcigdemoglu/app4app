'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { createClient } from '@/utils/supabase/actions';

export async function updateProfile(formData: FormData) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  const { data: user, error: authError } = await supabase.auth.getUser();

  if (!user) {
    console.error('authError', authError);
    redirect('/error');
  }

  const userProfile = {
    full_name: formData.get('full_name') as string,
    email: user?.user?.email || 'no email found',
    updated_at: new Date().toISOString(),
  };

  const { error: profileError } = await supabase
    .from('profiles')
    .upsert(userProfile);

  if (profileError) {
    console.error('profileError', profileError);
    redirect('/error');
  }

  revalidatePath('/', 'layout');
  redirect('/playground');
}

export async function logout() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { error: signoutError } = await supabase.auth.signOut();

  if (signoutError) {
    console.error('signoutError', signoutError);
    redirect('/error');
  }

  revalidatePath('/', 'layout');
  redirect('/');
}
