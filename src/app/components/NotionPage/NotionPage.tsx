'use client';

import { NotionRenderer } from 'react-notion-x';

export default function NotionPage({ recordMap }: { recordMap: any }) {
  return (
    <div>
      {recordMap ? (
        <NotionRenderer
          recordMap={recordMap}
          fullPage={true}
          darkMode={false}
        />
      ) : (
        <span>
          {'Notion page appears here... I love you Ilom. '.repeat(100)}
        </span>
      )}
    </div>
  );
}
