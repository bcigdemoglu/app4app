'use server';

import { createClient } from '@/utils/supabase/actions';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { handleUserIdentitiesFromEmail } from '../login/actions';

export async function register(formData: FormData) {
  const email = formData.get('email') as string;
  // Returns the user if they already signed up with email
  // Otherwise redirects to OAuth Provider (currently Google)
  const userExists = await handleUserIdentitiesFromEmail(email);

  if (userExists) {
    // User already exists, so we just log them in
    redirect(`/login?email=${email}`);
  }

  if (!formData.get('password')) {
    // If password field is empty, recreate form
    redirect(`/register?email=${email}`);
  }

  const signUpCredentials = {
    email,
    password: formData.get('password') as string,
    options: {
      data: {
        full_name: formData.get('full_name') as string,
      },
    },
  };

  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { error: registerError } =
    await supabase.auth.signUp(signUpCredentials);

  if (registerError) {
    console.error('registerError', registerError);
    redirect('/error');
  }

  revalidatePath('/', 'layout');
  redirect('/register-success');
}
