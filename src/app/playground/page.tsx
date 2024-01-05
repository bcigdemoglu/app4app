'server-only';

import { Lesson1, Lesson1Output } from '@/app/components/lesson';
import NotionPageWrapper from '@/app/components/NotionPage/NotionPageWrapper';

export const metadata = {
  title: "Ilayda's Playground: How to Start a Business",
  description: 'How to start a busines in 2024',
};

export default function Page() {
  return (
    <main className='grid h-screen grid-cols-3 gap-2 bg-white p-4'>
      {/* Left Column */}
      <NotionPageWrapper
        pageId={'b57f92a1577e48fcae50a841889968a3'}
      ></NotionPageWrapper>

      {/* Middle Column */}
      <Lesson1 />

      {/* Right Column */}
      <Lesson1Output />
    </main>
  );
}
