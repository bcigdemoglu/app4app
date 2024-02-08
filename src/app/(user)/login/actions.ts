'use server';

import { revalidatePath } from 'next/cache';
import { cookies, headers } from 'next/headers';
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

  const { data: loginData, error: signInWithPasswordError } =
    await supabase.auth.signInWithPassword(credentials);

  if (signInWithPasswordError) {
    console.error('error', signInWithPasswordError);
    redirect('/error');
  }
  console.log('loginData', loginData);

  const { data: profile, error: loginProfileError } = await supabase
    .from('profiles')
    .select('*')
    .single();

  if (loginProfileError) {
    console.error('loginProfileError', loginProfileError);
  }

  if (!profile) {
    revalidatePath('/', 'layout');
    redirect('/my-account');
  } else {
    revalidatePath('/', 'layout');
    redirect('/playground');
  }
}

export async function handleLogInWithGoogle() {
  const origin = headers().get('origin');

  console.log('headers', headers());
  console.log('origin', origin);

  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data: oauthData, error: signInWithOAuthError } =
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${origin}/auth/confirm`,
      },
    });

  if (signInWithOAuthError) {
    console.error('error', signInWithOAuthError);
    redirect('/error');
  }

  console.log('oauthData', oauthData);
  if (oauthData.url) redirect(oauthData.url);
}
