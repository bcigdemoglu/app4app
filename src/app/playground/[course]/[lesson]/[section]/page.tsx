import LessonIO from '@/app/components/LessonIO';
import { COURSE_MAP } from '@/app/lib/data';
import { notFound, redirect } from 'next/navigation';
import { getRecordMap } from './actions';
import NotionPage from '@/app/components/NotionPage';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { createClient } from '@/app/utils/supabase/server';
import {
  fetchUserProgressFromDB,
  getLessonInputs,
  getLessonMDX,
  getLessonOutput,
} from '@/app/utils/lessonHelpers';

export const metadata = {
  title: "Ilayda's Playground: How to Start a Business",
  description: 'How to start a busines in 2024',
};

interface Props {
  params: { course: string; lesson: string; section: string };
}

export default async function Page({ params }: Props) {
  if (
    !COURSE_MAP[params.course] ||
    !COURSE_MAP[params.course].lessonMap[params.lesson] ||
    isNaN(parseInt(params.section))
  )
    notFound();

  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect('/register');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .single();
  if (!profile) {
    redirect('/my-account');
  } else if (!profile.plan) {
    redirect('/upgrade');
  }

  const section = parseInt(params.section);
  const courseId = params.course;
  const lesson = COURSE_MAP[params.course].lessonMap[params.lesson];
  const { notionId, id: lessonId } = lesson;
  const recordMap = await getRecordMap(notionId);
  const { mdxInputSource, mdxOutputSource, totalSections } = await getLessonMDX(
    recordMap,
    section
  );

  const userProgressFromDB = await fetchUserProgressFromDB();
  const {
    data: lessonInputsFromDB,
    lastCompletedSection: lastCompletedSectionFromDB,
  } = getLessonInputs(userProgressFromDB, lessonId, user);
  const lessonOutputfromDB = getLessonOutput(
    userProgressFromDB,
    lessonId,
    user
  );

  const prevSection = section - 1 > 0 ? section - 1 : null;
  const prevSectionLink = prevSection
    ? `/playground/${courseId}/${params.lesson}/${prevSection}`
    : null;
  const nextSection = section + 1 <= totalSections ? section + 1 : null;
  const nextSectionLink = nextSection
    ? `/playground/${courseId}/${params.lesson}/${nextSection}`
    : null;
  const prevLesson = lesson.prev;
  const prevLessonLink = prevLesson
    ? `/playground/${courseId}/${prevLesson}/1`
    : null;
  const nextLesson = lesson.next;
  const nextLessonLink = nextLesson
    ? `/playground/${courseId}/${nextLesson}/1`
    : null;

  return (
    <main className='grid h-screen grid-cols-3 gap-1 bg-sky-100'>
      <header className='col-span-3 grid grid-cols-2 p-2'>
        <div className='flex justify-start gap-2'>
          <span className='transform rounded-lg bg-gradient-to-r from-blue-400 to-purple-600 px-4 py-1 text-xl font-bold text-white shadow-md transition-transform duration-300 ease-in-out hover:from-purple-600 hover:to-blue-400'>
            {"ilayda's playground"}
          </span>
        </div>
        <div className='flex justify-end gap-1'>
          <Link href='/my-account'>
            <button className=' '>
              {/* <Image
                src='/ilayda.jpeg'
                alt='Ilayda Buyukdogan Profile'
                className='h-10 w-10 overflow-hidden rounded-full border object-cover'
                width={100}
                height={0}
                sizes='100vw'
              /> */}
              <span className='inline-flex h-10 items-center justify-center rounded-full bg-purple-500 px-2'>
                <span className='font-bold text-white'>
                  {profile?.full_name}
                </span>
              </span>
            </button>
          </Link>
          <Link href='/my-account'>
            <button className='rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700 disabled:bg-blue-300'>
              My account
            </button>
          </Link>
        </div>
      </header>

      {/* Left Column */}
      <NotionPage recordMap={recordMap}></NotionPage>

      {/* Middle Column and Right Columns */}
      <LessonIO
        lesson={lesson}
        section={section}
        prevSectionLink={prevSectionLink}
        nextSectionLink={nextSectionLink}
        prevLessonLink={prevLessonLink}
        nextLessonLink={nextLessonLink}
        totalSections={totalSections}
        mdxInputSource={mdxInputSource}
        mdxOutputSource={mdxOutputSource}
        lessonInputsFromDB={lessonInputsFromDB}
        lastCompletedSectionFromDB={lastCompletedSectionFromDB}
        lessonOutputfromDB={lessonOutputfromDB}
      />
    </main>
  );
}

// export function generateStaticParams(): Array<Props['params']> {
//   return Object.keys(LESSON_MAP).map((lessonPage) => ({
//     lesson: lessonPage,
//   }));
// }
