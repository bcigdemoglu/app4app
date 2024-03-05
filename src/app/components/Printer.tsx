'use client';

import { useEffect } from 'react';

export default function Printer() {
  useEffect(() => {
    window.print();
  }, []);

  return <></>;
}
