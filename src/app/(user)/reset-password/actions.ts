'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { createClient } from '@/utils/supabase/actions';

export async function resetPassword(formData: FormData) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const credentials = {
    password: formData.get('password') as string,
  };

  const { error: resetPasswordError } =
    await supabase.auth.updateUser(credentials);

  if (resetPasswordError) {
    console.error('resetPasswordError', resetPasswordError);
    redirect(
      '/error?msg=We%20could%20not%20update%20your%20password.%20Please%20try%20again.'
    );
  }

  revalidatePath('/', 'layout');
  redirect('/my-account');
}
