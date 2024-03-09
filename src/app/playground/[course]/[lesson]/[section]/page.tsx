import LessonIO from '@/components/LessonIO';
import {
  COURSE_MAP,
  DEMO_LESSON_AI_FEEDBACK,
  AI_MODAL_PARAM,
  CREATOR_MODAL_PARAM,
} from '@/lib/data';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server';
import {
  getRecordMap,
  fetchUserProgressFromDB,
  getLessonInputs,
  getLessonMDX,
  getLessonOutput,
  getAIFeedbackMDX,
} from '@/utils/lessonHelpers';
import AIFeedbackModal from '@/components/AIFeedbackModal';
import CreatorFeedbackModal from '@/components/CreatorFeedbackModal';
import { perf } from '@/utils/debug';

export const metadata = {
  title: "Ilayda's Playground: How to Start a Business",
  description: 'How to start a busines in 2024',
};
interface Props {
  params: { course: string; lesson: string; section: string };
  searchParams: { [AI_MODAL_PARAM]: string; [CREATOR_MODAL_PARAM]: string };
}

export default async function Page({ params, searchParams }: Props) {
  if (
    !COURSE_MAP[params.course] ||
    !COURSE_MAP[params.course].lessonMap[params.lesson] ||
    parseInt(params.section) < 1
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

  // Start both serialization operations in parallel
  const recordMapPromise = getRecordMap(notionId);
  const userProgressFromDBPromise = fetchUserProgressFromDB();

  // Wait for both operations to complete
  const [recordMap, userProgressFromDB] = await perf(
    'Page: recordMapAndUserProgress',
    async () => await Promise.all([recordMapPromise, userProgressFromDBPromise])
  );

  const { mdxInputSource, mdxOutputSource, totalSections } = await getLessonMDX(
    recordMap,
    section
  );

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
    ? `/playground/${courseId}/${prevLesson}`
    : null;
  const nextLesson = lesson.next;
  const nextLessonLink = nextLesson
    ? `/playground/${courseId}/${nextLesson}`
    : null;

  return (
    <main className='grid h-svh grid-cols-3 gap-1 bg-sky-100 text-xs md:text-base'>
      <header className='col-span-3 grid grid-cols-2 p-2'>
        <div className='flex justify-start gap-2'>
          <span className='transform rounded-lg bg-gradient-to-r from-blue-400 to-purple-600 px-4 py-1 text-sm font-bold text-white shadow-md transition-transform duration-300 ease-in-out hover:from-purple-600 hover:to-blue-400 md:text-xl'>
            {'Cloudybook'}
          </span>
        </div>
        <div className='flex justify-end gap-1'>
          <Link href='/my-account'>
            {/* <Image
                src='/ilayda.jpeg'
                alt='Ilayda Buyukdogan Profile'
                className='h-10 w-10 overflow-hidden rounded-full border object-cover'
                width={100}
                height={0}
                sizes='100vw'
              /> */}
            <button className='hidden h-10 items-center justify-center rounded-full bg-purple-500 px-2 font-bold text-white hover:bg-purple-700 md:inline-flex'>
              {profile?.full_name}
            </button>
            <button className='inline-flex h-8 items-center justify-center rounded-full bg-purple-500 px-2 font-bold text-white hover:bg-purple-700 md:hidden'>
              {profile?.full_name.charAt(0)}
            </button>
          </Link>
          <Link href='/my-account'>
            <button className='rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700 disabled:bg-blue-300'>
              My account
            </button>
          </Link>
        </div>
      </header>

      {/* Left, Middle, Right Columns */}
      <LessonIO
        recordMap={recordMap}
        courseId={courseId}
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

      {searchParams[CREATOR_MODAL_PARAM] && <CreatorFeedbackModal />}
      {searchParams[AI_MODAL_PARAM] && (
        <AIFeedbackModal
          aiFeedbackSource={await getAIFeedbackMDX(
            DEMO_LESSON_AI_FEEDBACK[lessonId]?.mdx ??
              'Sorry, no AI feedback available.'
          )}
        />
      )}
    </main>
  );
}

// export function generateStaticParams(): Array<Props['params']> {
//   return Object.keys(LESSON_MAP).map((lessonPage) => ({
//     lesson: lessonPage,
//   }));
// }
