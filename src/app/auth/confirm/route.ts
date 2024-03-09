// Following guide https://supabase.com/docs/guides/auth/server-side/email-based-auth-with-pkce-flow-for-ssr
import { type EmailOtpType } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';

import { createClient } from '@/utils/supabase/actions';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  // "code" for oauth
  const code = searchParams.get('code');
  // "token_hash" for email otp
  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type') as EmailOtpType | null;
  // redirection
  const next = searchParams.get('next') ?? '/';
  const redirectTo = `${origin}${next}`;

  console.log(
    'origin',
    origin,
    'searchParams',
    searchParams,
    'redirectTo',
    redirectTo
  );

  if (token_hash && type) {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    const { error: verifyOtpError } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });
    if (verifyOtpError) {
      console.error('verifyOtpError', verifyOtpError);
    } else {
      return NextResponse.redirect(redirectTo);
    }
  } else if (code) {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    const { error: codeSessionError } =
      await supabase.auth.exchangeCodeForSession(code);
    if (codeSessionError) {
      console.error('codeSessionError', codeSessionError);
    } else {
      return NextResponse.redirect(redirectTo);
    }
  }

  // return the user to an error page with some instructions
  return NextResponse.redirect(
    `${origin}/error?msg=Invalid%20code%20or%20token_hash`
  );
}
