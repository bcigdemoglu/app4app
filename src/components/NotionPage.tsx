'use client';

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
      fullPage={true}
      darkMode={false}
      disableHeader={true}
      components={{ Code: IgnoreCode }}
    />
  ) : (
    <div className='prose p-4 font-semibold text-red-600'>
      {
        'Sorry! Something went wrong loading the lesson. Please refresh the page and try again...'
      }
    </div>
  );
}
