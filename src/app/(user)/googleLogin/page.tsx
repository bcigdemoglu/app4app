'use client';

import Link from 'next/link';
import { redirect, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

export default function Page() {
  const searchParams = useSearchParams();
  const link = searchParams.get('link');

  useEffect(() => {
    const isEmbedded = () => {
      return window !== window.parent || window !== window.top;
    };

    const openInNewTab = (url: string) => {
      window.open(url, '_blank', 'noopener,noreferrer');
    };
    if (link) {
      if (isEmbedded()) {
        openInNewTab(link);
      } else {
        redirect(link);
      }
    }
  }, [link]);

  return (
    <div>
      <div className='space-y-2 text-center'>
        <h2 className='text-3xl font-extrabold text-zinc-900'>
          {"We're waiting!"}
        </h2>
        <p className='text-zinc-500'>
          Please complete your sign in with Google to continue.
        </p>
      </div>

      <div className='mt-4 text-center text-sm text-zinc-500'>
        Already signed in?{' '}
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
