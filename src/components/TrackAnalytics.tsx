'use client';

import { doNotTrackPath } from '@/lib/data';
import { isDev } from '@/utils/debug';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function TrackAnalytics({ children }: any) {
  const pathname = usePathname();
  const [allowTracking, setAllowTracking] = useState(false);

  useEffect(() => {
    setAllowTracking(!isDev() && !doNotTrackPath(pathname));
  }, [pathname]);

  return allowTracking ? children : <></>;
}
