'server-only';

import NotionPage from './NotionPage';
import { getRecordMap } from '@/app/actions';

// async function getNotionRecordMap(pageId: string): Promise<any> {
//   try {
//     const res = await fetch('/api/notion', {
//       method: 'GET',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({ pageId }),
//       cache: 'no-store',
//     });
//     const recordMap = await res.json();
//     return recordMap;
//   } catch (err) {
//     return null;
//   }
// }

export default async function NotionPageWrapper({
  pageId,
}: {
  pageId: string;
}) {
  const recordMap = await getRecordMap(pageId);

  return (
    <div className='overflow-auto border bg-white p-4'>
      {recordMap ? (
        <NotionPage recordMap={recordMap}></NotionPage>
      ) : (
        <span>
          {'Notion page appears here... I love you Ilom. '.repeat(100)}
        </span>
      )}
    </div>
  );
}
