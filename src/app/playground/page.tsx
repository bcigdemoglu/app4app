'use client';

import { PLAYGROUND_REDIRECT_LSK } from '@/lib/data';
import { redirect } from 'next/navigation';
import { useEffect } from 'react';

export default function Page() {
  useEffect(() => {
    redirect(
      localStorage.getItem(PLAYGROUND_REDIRECT_LSK) || '/playground/demo/smart'
    );
  });

  return <></>;
}
