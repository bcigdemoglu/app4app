'use server';

import { createClient } from '@/utils/supabase/actions';
import { revalidatePath } from 'next/cache';
import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';

export async function login(formData: FormData) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const credentials = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  };

  const { error: signInWithPasswordError } =
    await supabase.auth.signInWithPassword(credentials);

  if (signInWithPasswordError) {
    if (signInWithPasswordError.message === 'Email not confirmed') {
      redirect('/register-success');
    } else {
      console.error(
        `signInWithPasswordError for email ${credentials.email}`,
        signInWithPasswordError
      );
      redirect(`/register?email=${credentials.email}`);
    }
  }

  const { data: profile, error: loginProfileError } = await supabase
    .from('profiles')
    .select('*')
    .maybeSingle();

  if (loginProfileError) {
    console.error(
      `loginProfileError for email: ${credentials.email}`,
      loginProfileError
    );
  }

  if (!profile) {
    revalidatePath('/', 'layout');
    redirect(`/my-account`);
  } else {
    revalidatePath('/', 'layout');
    redirect('/playground');
  }
}

export async function handleLogInWithGoogle() {
  const origin = headers().get('origin');

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

  if (oauthData.url) redirect(oauthData.url);
}
