'use client';

import { NotionRenderer } from 'react-notion-x';
import { ExtendedRecordMap } from 'notion-types';

// Not not render code
const IgnoreCode = () => {};

export default function NotionPage({
  recordMap,
}: {
  recordMap: ExtendedRecordMap;
}) {
  return (
    <div className='flex flex-col overflow-auto bg-white'>
      <div className='flex-grow overflow-auto '>
        {recordMap ? (
          <NotionRenderer
            recordMap={recordMap}
            fullPage={true}
            darkMode={false}
            disableHeader={true}
            components={{ Code: IgnoreCode }}
          />
        ) : (
          <span>{'Lesson inaccessible, please refresh'.repeat(100)}</span>
        )}
      </div>
    </div>
  );
}
