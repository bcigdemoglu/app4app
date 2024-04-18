import AIFeedbackModal from '@/components/AIFeedbackModal';
import { CTAButton } from '@/components/CTAModal';
import CourseProgressModal from '@/components/CourseProgressModal';
import CreatorFeedbackModal from '@/components/CreatorFeedbackModal';
import LessonIO from '@/components/LessonIO';
import { getMdxDynamicOutputComponents } from '@/components/MdxDynamicOutputComponents';
import { getMdxStaticOutputComponents } from '@/components/MdxStaticOutputComponents';
import { PreviousLessonOutputs } from '@/components/PreviousLessonOutputs';
import {
  AI_MODAL_PARAM,
  COURSE_MAP,
  CREATOR_MODAL_PARAM,
  DEMO_LESSON_AI_FEEDBACK,
  GUEST_MODE_COOKIE,
  LESSON_END_PARAM,
  LESSON_START_PARAM,
  PROGRESS_MODAL_PARAM,
  genMetadata,
  isDemoCourse,
} from '@/lib/data';
import { cn } from '@/utils/cn';
import { perf } from '@/utils/debug';
import {
  getLessonInputs,
  getLessonOutput,
  getUserProgressForLesson,
} from '@/utils/lessonDataHelpers';
import {
  fetchGuestProgressForCourse,
  fetchUserProgressForCourse,
  getAIFeedbackMDX,
  getLessonMDX,
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
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeSlug from 'rehype-slug';
import remarkGfm from 'remark-gfm';

interface Props {
  params: { course: string; lesson: string; section: string };
  searchParams: {
    [AI_MODAL_PARAM]: string;
    [CREATOR_MODAL_PARAM]: string;
    [PROGRESS_MODAL_PARAM]: string;
    [LESSON_START_PARAM]: string;
    [LESSON_END_PARAM]: string;
  };
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

export function generateMetadata({ params }: Props): Metadata {
  if (!isValidCourse(params.course)) notFound();
  const { title, description } = COURSE_MAP[params.course];
  return genMetadata(title, description);
}

export default async function Page({ params, searchParams }: Props) {
  if (
    !isValidCourse(params.course) ||
    !isValidLesson(params.course, params.lesson) ||
    !isValidSection(params.course, params.lesson, params.section)
  ) {
    notFound();
  }

  // Get IDs from Search Params
  const courseId = params.course;
  const lessonId = params.lesson;
  const sectionId = parseInt(params.section);

  const course = COURSE_MAP[courseId];
  const { access } = course;
  const totalLessons = Object.keys(course.lessonMap).length;
  const lesson = course.lessonMap[lessonId];
  const { notionId } = lesson;

  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  const guestId = cookieStore.get(GUEST_MODE_COOKIE)?.value;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const allowAccess =
    access === 'guest' || // Allow access if guest
    (access === 'preview' && sectionId === 1) || // Allow access if preview and first section
    user !== null; // Allow access if user is logged in

  if (!allowAccess) {
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

  // Start both serialization operations in parallel
  const recordMapPromise = getRecordMap(notionId);
  const userProgressForCoursePromise = user
    ? fetchUserProgressForCourse(courseId)
    : fetchGuestProgressForCourse(courseId);

  // Wait for both operations to complete
  const [recordMap, userProgressForCourse] = await perf(
    `/playground/${courseId}/${lessonId}/${sectionId}: recordMapAndUserProgress`,
    async () =>
      await Promise.all([recordMapPromise, userProgressForCoursePromise])
  );

  const { mdxInput, mdxOutput, totalSections } = getLessonMDX(
    recordMap,
    sectionId
  );

  // Section cannot be greater than totalSections
  if (totalSections && sectionId > totalSections) {
    redirect(`/playground/${courseId}/${lessonId}`);
  }

  const userProgressForLesson = getUserProgressForLesson(
    userProgressForCourse,
    lessonId
  );

  const {
    data: lessonInputsFromDB,
    lastCompletedSection: lastCompletedSectionFromDB,
    modifiedAt: inputModifiedAt,
  } = getLessonInputs(userProgressForLesson, lessonId);
  const { data: lessonOutputfromDB, modifiedAt: outputModifiedAt } =
    getLessonOutput(userProgressForLesson);

  const prevSection = sectionId - 1 > 0 ? sectionId - 1 : null;
  const prevSectionLink = prevSection
    ? `/playground/${courseId}/${lessonId}/${prevSection}`
    : null;
  const nextSection = !totalSections
    ? 1 // Reset to section 1 if no totalSections
    : sectionId === 1 && searchParams[LESSON_START_PARAM]
      ? 1 // Reset to section 1 if starting a new lesson after welcome message
      : sectionId < totalSections
        ? sectionId + 1 // Go to next section if not last section
        : sectionId === totalSections && !searchParams[LESSON_END_PARAM]
          ? `${sectionId}?${LESSON_END_PARAM}=true` // Display end of lesson message if last section
          : null;
  const nextSectionLink = nextSection
    ? `/playground/${courseId}/${lessonId}/${nextSection}`
    : null;
  const prevLesson = lesson.prev;
  const prevLessonLink = prevLesson
    ? `/playground/${courseId}/${prevLesson}`
    : null;
  const nextLesson = lesson.next;
  const nextLessonLink = nextLesson
    ? `/playground/${courseId}/${nextLesson}`
    : null;

  const lessonModifiedAt = lesson.modifiedAt;

  const isNewer = (
    aModifiedAt?: string | null,
    bModifiedAt?: string | null
  ): boolean => !!(aModifiedAt && (!bModifiedAt || aModifiedAt > bModifiedAt));

  const genNewOutput =
    isNewer(inputModifiedAt, outputModifiedAt) ||
    isNewer(lessonModifiedAt, outputModifiedAt);

  const mdxInputSource = await serializeLessonMDX(mdxInput);
  const MdxOutput =
    mdxOutput && genNewOutput ? (
      <MDXRemote
        key={inputModifiedAt}
        source={mdxOutput}
        options={{
          mdxOptions: {
            remarkPlugins: [remarkGfm],
            rehypePlugins: [rehypeSlug, rehypeAutolinkHeadings],
          },
        }}
        components={{
          ...getMdxDynamicOutputComponents(lessonInputsFromDB),
          ...getMdxStaticOutputComponents(
            lessonInputsFromDB,
            userProgressForCourse,
            courseId
          ),
        }}
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
          {user ? ( // If user is logged in
            <>
              <Link href={`?${PROGRESS_MODAL_PARAM}=true`}>
                <button className='rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700 disabled:bg-blue-300'>
                  My Progress
                </button>
              </Link>
              <Link href='/my-account'>
                <button className='rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700 disabled:bg-blue-300'>
                  My account
                </button>
              </Link>
            </>
          ) : (
            // If user is not logged in
            <>
              <Link href='/register'>
                <button className='rounded bg-green-500 px-4 py-2 font-bold text-white hover:bg-green-600 disabled:bg-green-300'>
                  {guestId ? 'Ready? Create account!' : 'Create account'}
                </button>
              </Link>
              {!guestId ? (
                <Link href='/login'>
                  <button
                    className={cn(
                      'rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700 disabled:bg-blue-300',
                      'hidden md:flex' // Hide on mobile
                    )}
                  >
                    Log in
                  </button>
                </Link>
              ) : null}
            </>
          )}
        </div>
      </header>

      {/* Left, Middle, Right Columns */}
      <LessonIO
        recordMap={recordMap}
        course={course}
        lesson={lesson}
        totalLessons={totalLessons}
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
            userProgressForCourse={userProgressForCourse}
          />
        }
        userProgressForCourse={userProgressForCourse}
      />

      {searchParams[CREATOR_MODAL_PARAM] ? <CreatorFeedbackModal /> : null}
      {searchParams[AI_MODAL_PARAM] ? (
        <AIFeedbackModal
          aiFeedbackSource={await getAIFeedbackMDX(
            DEMO_LESSON_AI_FEEDBACK[lessonId]?.mdx ??
              'No AI feedback available for Demo.'
          )}
        />
      ) : null}
      {searchParams[PROGRESS_MODAL_PARAM] ? (
        <CourseProgressModal courseId={courseId} />
      ) : null}
    </main>
  );
}
