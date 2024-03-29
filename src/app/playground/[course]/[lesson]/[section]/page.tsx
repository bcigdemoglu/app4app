import AIFeedbackModal from '@/components/AIFeedbackModal';
import { CTAButton } from '@/components/CTAModal';
import CreatorFeedbackModal from '@/components/CreatorFeedbackModal';
import LessonIO from '@/components/LessonIO';
import {
  PreviousLessonOutputs,
  getMdxOutputComponents,
} from '@/components/MdxOutputComponents';
import {
  AI_MODAL_PARAM,
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
import { Metadata } from 'next';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { cookies } from 'next/headers';
import Image from 'next/image';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';

interface Props {
  params: { course: string; lesson: string; section: string };
  searchParams: { [AI_MODAL_PARAM]: string; [CREATOR_MODAL_PARAM]: string };
}

function isValidCourse(courseId: string) {
  return COURSE_MAP[courseId];
}

function isValidLesson(courseId: string, lessonId: string) {
  return COURSE_MAP[courseId] && COURSE_MAP[courseId].lessonMap[lessonId];
}

function isValidSection(courseId: string, lessonId: string, sectionId: string) {
  return (
    COURSE_MAP[courseId] &&
    COURSE_MAP[courseId].lessonMap[lessonId] &&
    !isNaN(parseInt(sectionId)) &&
    parseInt(sectionId) >= 1
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  if (!isValidCourse(params.course)) notFound();
  return {
    title: COURSE_MAP[params.course].title,
    description: COURSE_MAP[params.course].description,
  };
}

export default async function Page({ params, searchParams }: Props) {
  if (
    !isValidCourse(params.course) ||
    !isValidLesson(params.course, params.lesson) ||
    !isValidSection(params.course, params.lesson, params.section)
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

  if (user) {
    // Once the user is logged in, they must have a profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .single();

    if (!profile) {
      redirect('/my-account');
    }
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

  // Section cannot be greater than totalSections
  if (totalSections && sectionId > totalSections) {
    redirect(`/playground/${courseId}/${lessonId}`);
  }

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
              src='/cloudybook_blue_black.png'
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
          {isDemoCourse(courseId) ? <CTAButton /> : null}
          {user ? (
            <Link href='/my-account'>
              <button className='rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700 disabled:bg-blue-300'>
                My account
              </button>
            </Link>
          ) : (
            <>
              <Link href='/register'>
                <button className='rounded bg-green-500 px-4 py-2 font-bold text-white hover:bg-green-600 disabled:bg-green-300'>
                  Create new account
                </button>
              </Link>
              <Link href='/login'>
                <button className='rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700 disabled:bg-blue-300'>
                  Log in
                </button>
              </Link>
            </>
          )}
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

      {searchParams[CREATOR_MODAL_PARAM] ? <CreatorFeedbackModal /> : null}
      {searchParams[AI_MODAL_PARAM] ? (
        <AIFeedbackModal
          aiFeedbackSource={await getAIFeedbackMDX(
            DEMO_LESSON_AI_FEEDBACK[lessonId]?.mdx ??
              'Sorry, no AI feedback available.'
          )}
        />
      ) : null}
      {/* {isDemoCourse(courseId) ? <CTAModal /> : null} */}
    </main>
  );
}
