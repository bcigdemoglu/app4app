import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function UpgradePage() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect('/register');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .single();
  if (!profile) {
    redirect('/my-account');
  }

  const { full_name, plan } = profile;
  if (plan && plan.toLowerCase() !== 'free') {
    redirect('/playground');
  }

  return (
    <div>
      <div className='space-y-2 text-center'>
        <h2 className='text-3xl font-extrabold text-zinc-900'>Wait!</h2>
        <p className='text-zinc-500'>
          Hi {full_name}, you are currently on Free Tier.
        </p>
        <p className='text-zinc-500'>
          Please contact info@ilayda.com to purchase or confirm your upgrade.
        </p>
      </div>

      <div className='mt-4 text-center text-sm text-zinc-500'>
        Want to update your profile?{' '}
        <Link
          href='/my-account'
          className='font-medium text-blue-600 hover:text-blue-500'
        >
          Go to your profile.
        </Link>
      </div>
      <div className='mt-4 text-center text-sm text-zinc-500'>
        Already confirmed your upgrade?{' '}
        <Link
          href='/playground'
          className='font-medium text-pink-600 hover:text-pink-500'
        >
          Go to Playground.
        </Link>
      </div>
    </div>
  );
}
