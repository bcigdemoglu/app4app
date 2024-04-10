'use client';

import { useEffect } from 'react';
import { hotjar } from 'react-hotjar';

export default function Hotjar() {
  useEffect(() => {
    hotjar.initialize({ id: 3922601, sv: 6 });
  }, []);

  return <></>;
}
