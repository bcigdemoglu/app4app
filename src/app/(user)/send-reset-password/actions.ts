'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { createClient } from '@/app/utils/supabase/actions';

export async function sendResetPasswordEmail(formData: FormData) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const email = formData.get('email') as string;

  const { error: sendResetPasswordEmailError } =
    await supabase.auth.resetPasswordForEmail(email);

  if (sendResetPasswordEmailError) {
    console.error('sendResetPasswordEmailError', sendResetPasswordEmailError);
    redirect('/error');
  }

  redirect('/register-success');
}
