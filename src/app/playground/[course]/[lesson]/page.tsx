import { COURSE_MAP } from '@/lib/data';
import { perf } from '@/utils/debug';
import {
  fetchLessonUserProgress,
  getLessonInputs,
  getLessonMDX,
  getRecordMap,
} from '@/utils/lessonHelpers';
import { createClient } from '@/utils/supabase/server';
import { Metadata } from 'next';
import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation';

interface Props {
  params: { course: string; lesson: string };
}

function isValidCourse(courseId: string) {
  return COURSE_MAP[courseId];
}

function isValidLesson(courseId: string, lessonId: string) {
  return COURSE_MAP[courseId] && COURSE_MAP[courseId].lessonMap[lessonId];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  if (!isValidCourse(params.course)) notFound();
  return {
    title: COURSE_MAP[params.course].title,
    description: COURSE_MAP[params.course].description,
  };
}

export default async function Page({ params }: Props) {
  const { course: courseId, lesson: lessonId } = params;
  if (!isValidLesson(courseId, lessonId)) notFound();
  const { access } = COURSE_MAP[courseId];

  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (access === 'private' && !user) {
    redirect('/register');
  }

  const STARTING_SECTION = 1;
  let sectionId = STARTING_SECTION;

  if (user) {
    const lesson = COURSE_MAP[courseId].lessonMap[lessonId];
    const { notionId } = lesson;
    // Start both serialization operations in parallel
    const recordMapPromise = getRecordMap(notionId);
    const userProgressFromDBPromise = user
      ? fetchLessonUserProgress(lessonId, courseId, user)
      : Promise.resolve(null);

    // Wait for both operations to complete
    const [recordMap, userProgressFromDB] = await perf(
      `/playground/${courseId}/${lessonId}: recordMapAndUserProgress`,
      async () =>
        await Promise.all([recordMapPromise, userProgressFromDBPromise])
    );

    const { totalSections } = getLessonMDX(recordMap, sectionId);
    const { lastCompletedSection } = getLessonInputs(
      userProgressFromDB,
      lessonId,
      user
    );
    if (totalSections && lastCompletedSection) {
      // if lastCompletedSection > totalSection, return totalSection
      sectionId = Math.min(lastCompletedSection, totalSections);
    }
  }

  redirect(`/playground/${courseId}/${lessonId}/${sectionId}`);
}
