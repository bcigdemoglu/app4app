import AIFeedbackModal from '@/components/AIFeedbackModal';
import CreatorFeedbackModal from '@/components/CreatorFeedbackModal';
import LessonIO from '@/components/LessonIO';
import {
  PreviousLessonOutputs,
  getMdxOutputComponents,
} from '@/components/MdxOutputComponents';
import {
  AI_MODAL_PARAM,
  CALENDLY_BETA_CALL_URL,
  COURSE_MAP,
  CREATOR_MODAL_PARAM,
  DEMO_LESSON_AI_FEEDBACK,
  isDemoCourse,
} from '@/lib/data';
import { perf } from '@/utils/debug';
import {
  fetchLessonUserProgress,
  getAIFeedbackMDX,
  getLessonInputs,
  getLessonMDX,
  getLessonOutput,
  getRecordMap,
  serializeLessonMDX,
} from '@/utils/lessonHelpers';
import { createClient } from '@/utils/supabase/server';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { cookies } from 'next/headers';
import Image from 'next/image';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';

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
    isNaN(parseInt(params.section)) ||
    parseInt(params.section) < 1
  )
    notFound();
  const { access } = COURSE_MAP[params.course];

  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await perf('getUser', () => supabase.auth.getUser());
  if (access === 'private' && !user) {
    redirect('/register');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .single();
  if (access === 'private' && !profile) {
    redirect('/my-account');
  }

  const sectionId = parseInt(params.section);
  const courseId = params.course;
  const lesson = COURSE_MAP[params.course].lessonMap[params.lesson];
  const { notionId, id: lessonId } = lesson;

  // Start both serialization operations in parallel
  const recordMapPromise = getRecordMap(notionId);
  const userProgressFromDBPromise = user
    ? fetchLessonUserProgress(lessonId, courseId, user)
    : Promise.resolve(null);

  // Wait for both operations to complete
  const [recordMap, userProgressFromDB] = await perf(
    'Page: recordMapAndUserProgress',
    async () => await Promise.all([recordMapPromise, userProgressFromDBPromise])
  );

  const { mdxInput, mdxOutput, totalSections } = getLessonMDX(
    recordMap,
    sectionId
  );

  // Section cannot be greater than totalSections, redirect to the last section
  if (sectionId > 1 && sectionId > totalSections)
    redirect(`/playground/${courseId}/${lessonId}`);

  const { mdxInputSource } = await serializeLessonMDX(mdxInput, mdxOutput);

  const {
    data: lessonInputsFromDB,
    lastCompletedSection: lastCompletedSectionFromDB,
    modifiedAt: inputModifiedAt,
  } = getLessonInputs(userProgressFromDB, lessonId, user);
  const { data: lessonOutputfromDB, modifiedAt: outputModifiedAt } =
    getLessonOutput(userProgressFromDB, lessonId, user);

  const prevSection = sectionId - 1 > 0 ? sectionId - 1 : null;
  const prevSectionLink = prevSection
    ? `/playground/${courseId}/${params.lesson}/${prevSection}`
    : null;
  const nextSection =
    totalSections && sectionId + 1 <= totalSections ? sectionId + 1 : null;
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

  const genNewOutput = !!(
    inputModifiedAt &&
    (!outputModifiedAt ||
      (outputModifiedAt && inputModifiedAt > outputModifiedAt))
  );

  const MdxOutput =
    mdxOutput && genNewOutput ? (
      <MDXRemote
        key={inputModifiedAt}
        source={mdxOutput}
        components={getMdxOutputComponents(lessonInputsFromDB)}
      />
    ) : null;

  return (
    <main className='grid h-svh grid-cols-3 gap-1 bg-sky-100 text-xs md:gap-2 md:text-base'>
      <header className='col-span-3 grid h-min grid-cols-2 p-2 pb-0'>
        <div className='flex justify-start gap-2'>
          <span className='flex transform rounded-lg text-sm font-bold text-white md:text-xl'>
            <Image
              src='/cloudybook2.png'
              alt='Cloudy Book'
              width={165}
              height={34}
              className='self-center'
            />
          </span>
        </div>
        <div className='flex justify-end gap-1'>
          {/* <Link href='/my-account'>
            <Image
                src='/ilayda.jpeg'
                alt='Ilayda Buyukdogan Profile'
                className='h-10 w-10 overflow-hidden rounded-full border object-cover'
                width={100}
                height={0}
                sizes='100vw'
              />
            <button className='hidden h-10 items-center justify-center rounded-full bg-purple-500 px-2 font-bold text-white hover:bg-purple-700 md:inline-flex'>
              {profile?.full_name}
            </button>
            <button className='inline-flex h-8 w-8 items-center justify-center rounded-full bg-purple-500 font-bold text-white hover:bg-purple-700 md:hidden'>
              {profile?.full_name.charAt(0)}
            </button>
          </Link> */}
          {isDemoCourse(courseId) ? (
            <Link href={CALENDLY_BETA_CALL_URL}>
              <button className='rounded bg-orange-600 px-4 py-2 font-bold text-white hover:bg-orange-800 disabled:bg-orange-400'>
                Create Yours!
              </button>
            </Link>
          ) : null}
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
        sectionId={sectionId}
        prevSectionLink={prevSectionLink}
        nextSectionLink={nextSectionLink}
        prevLessonLink={prevLessonLink}
        nextLessonLink={nextLessonLink}
        totalSections={totalSections}
        mdxInputSource={mdxInputSource}
        lessonInputsFromDB={lessonInputsFromDB}
        lastCompletedSectionFromDB={lastCompletedSectionFromDB}
        lessonOutputfromDB={lessonOutputfromDB}
        MdxOutput={MdxOutput}
        PreviousLessonOutputs={
          <PreviousLessonOutputs
            courseId={courseId}
            lessonId={lessonId}
            user={user}
          />
        }
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
