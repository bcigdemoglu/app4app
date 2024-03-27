'use client';

import { useEffect } from 'react';
import { hotjar } from 'react-hotjar';

export default function Hotjar() {
  useEffect(() => {
    hotjar.initialize(3922601, 6);
  }, []);

  return <></>;
}
