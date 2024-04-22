'use server';

import { createAdminClient, createClient } from '@/utils/supabase/actions';
import { revalidatePath } from 'next/cache';
import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';

export async function login(formData: FormData) {
  // type-casting here for convenience
  // in practice, you should validate your inputs
  const credentials = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  };

  // Redirect to OAuth if user email already exists
  const userExists = await handleUserIdentitiesFromEmail(credentials.email);

  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { error: signInWithPasswordError } =
    await supabase.auth.signInWithPassword(credentials);

  if (signInWithPasswordError) {
    if (signInWithPasswordError.message === 'Email not confirmed') {
      redirect('/register-success');
    } else if (
      userExists &&
      signInWithPasswordError.message == 'Invalid login credentials'
    ) {
      console.error(
        `Wrong password for email ${credentials.email}`,
        signInWithPasswordError
      );
      redirect(`/login?email=${credentials.email}&invalid=true`);
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

  if (oauthData.url) {
    redirect(`/googleLogin?link=${encodeURIComponent(oauthData.url)}`);
  }
}

export async function handleUserIdentitiesFromEmail(email: string) {
  const cookieStore = cookies();
  const supabase = createAdminClient(cookieStore);

  const {
    data: { user: alreadyLoggedInUser },
  } = await supabase.auth.getUser();

  if (alreadyLoggedInUser) {
    redirect('/playground');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('email', email)
    .maybeSingle();

  if (!profile) {
    return null;
  }

  const userId = profile.id;
  const {
    data: { user },
  } = await supabase.auth.admin.getUserById(userId);

  if (!user) {
    throw new Error(
      `FATAL: Cannot access supabase admin to check email ${email}`
    );
  }

  if (user.identities?.find((identity) => identity.provider === 'google')) {
    return handleLogInWithGoogle();
  }

  return user;
}
