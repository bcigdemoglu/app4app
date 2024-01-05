'use client';

import { useEffect } from 'react';
import { hotjar } from 'react-hotjar';

export default function Hotjar() {
  useEffect(() => {
    if (window.location.href.includes('ilayda.com')) {
      hotjar.initialize(3813067, 6);
    }
  }, []);

  return <></>;
}
