'use client';

import { doNotTrackPath } from '@/lib/data';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { hotjar } from 'react-hotjar';

export default function Hotjar() {
  const pathname = usePathname();

  useEffect(() => {
    if (doNotTrackPath(pathname)) {
      return;
    }
    hotjar.initialize(3922601, 6);
  }, [pathname]);

  return <></>;
}
