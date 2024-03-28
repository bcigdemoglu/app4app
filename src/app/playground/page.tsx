'use client';

import { redirect } from 'next/navigation';
import { useEffect } from 'react';

export default function Page() {
  useEffect(() => {
    redirect(localStorage.getItem('redirectTo') || '/playground/demo/smart');
  });

  return <></>;
}
