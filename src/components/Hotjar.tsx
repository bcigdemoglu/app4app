'use client';

import { collectPathAnalytics } from '@/lib/data';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { hotjar } from 'react-hotjar';

export default function Hotjar() {
  const pathname = usePathname();

  useEffect(() => {
    if (collectPathAnalytics(pathname)) {
      hotjar.initialize(3922601, 6);
    }
  }, [pathname]);

  return <></>;
}
