import LessonSections from '@/app/components/LessonSection';
import { LESSON_MAP, getLessonMDX } from '@/app/lib/data';
import { notFound } from 'next/navigation';
import { getRecordMap } from '@/app/actions';
import NotionPage from '@/app/components/NotionPage';
import Image from 'next/image';

export const metadata = {
  title: "Ilayda's Playground: How to Start a Business",
  description: 'How to start a busines in 2024',
};

export function generateStaticParams(): Array<Props['params']> {
  return Object.keys(LESSON_MAP).map((lessonPage) => ({
    lesson: lessonPage,
  }));
}

interface Props {
  params: { lesson: string };
}

export default async function Page({ params }: Props) {
  if (
    typeof params.lesson !== 'string' ||
    isNaN(parseInt(params.lesson)) ||
    !LESSON_MAP[parseInt(params.lesson)]
  )
    notFound();

  const lesson = LESSON_MAP[parseInt(params.lesson)];
  const notionId = lesson.id;
  const recordMap = await getRecordMap(notionId);

  const { mdxInputSource, mdxOutputSource } = await getLessonMDX(recordMap);

  return (
    <main className='grid h-screen grid-cols-3 gap-1 bg-sky-100'>
      <header className='col-span-3 grid grid-cols-2 p-2'>
        <div className='flex justify-start gap-2'>
          <span className='transform rounded-lg bg-gradient-to-r from-blue-400 to-purple-600 px-4 py-1 text-xl font-bold text-white shadow-md transition-transform duration-300 ease-in-out hover:from-purple-600 hover:to-blue-400'>
            {"ilayda's playground"}
          </span>
        </div>
        <div className='flex justify-end gap-1'>
          <button className=' '>
            <Image
              src='/ilayda.jpeg'
              alt='Ilayda Buyukdogan Profile'
              className='h-10 w-10 overflow-hidden rounded-full border object-cover'
              width={100}
              height={0}
              sizes='100vw'
            />
          </button>
          <button className='rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700 disabled:bg-blue-300'>
            My account
          </button>
        </div>
      </header>

      {/* Left Column */}
      <NotionPage recordMap={recordMap}></NotionPage>

      {/* Middle Column and Right Columns */}
      <LessonSections
        mdxInputSource={mdxInputSource}
        mdxOutputSource={mdxOutputSource}
        lesson={lesson}
      />
    </main>
  );
}
