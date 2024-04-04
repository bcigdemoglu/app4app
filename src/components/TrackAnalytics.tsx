'use client';

import { doNotTrackPath } from '@/lib/data';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function TrackAnalytics({ children }: any) {
  const pathname = usePathname();
  const [allowTracking, setAllowTracking] = useState(false);

  useEffect(() => {
    const isDev = process.env.NODE_ENV === 'development';
    setAllowTracking(!isDev && !doNotTrackPath(pathname));
  }, [pathname]);

  return allowTracking ? children : <></>;
}
