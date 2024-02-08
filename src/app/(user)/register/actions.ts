'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { createClient } from '@/app/utils/supabase/actions';

export async function register(formData: FormData) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const credentials = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    options: {
      data: {
        full_name: formData.get('full_name') as string,
      },
    },
  };

  const { error: registerError } = await supabase.auth.signUp(credentials);

  if (registerError) {
    console.error('registerError', registerError);
    redirect('/error');
  }

  revalidatePath('/', 'layout');
  redirect('/register-success');
}
