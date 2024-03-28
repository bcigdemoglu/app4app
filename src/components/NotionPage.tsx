'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ExtendedRecordMap } from 'notion-types';
import { NotionRenderer } from 'react-notion-x';

// Not not render code
const IgnoreCode = () => {};

export default function NotionPage({
  recordMap,
}: {
  recordMap: ExtendedRecordMap | null;
}) {
  return recordMap ? (
    <NotionRenderer
      recordMap={recordMap}
      fullPage
      darkMode={false}
      disableHeader
      components={{ Code: IgnoreCode, nextImage: Image, nextLink: Link }}
    />
  ) : (
    <div className='prose p-4 font-semibold text-red-600'>
      {
        'Sorry! Something went wrong loading the lesson. Please refresh the page and try again...'
      }
    </div>
  );
}
