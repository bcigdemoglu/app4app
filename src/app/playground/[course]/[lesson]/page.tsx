import { COURSE_MAP, LESSON_START_PARAM, genMetadata } from '@/lib/data';
import { perf } from '@/utils/debug';
import {
  getLessonInputs,
  getUserProgressForLesson,
} from '@/utils/lessonDataHelpers';
import {
  fetchGuestProgressForCourse,
  fetchUserProgressForCourse,
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

export function generateMetadata({ params }: Props): Metadata {
  if (!isValidCourse(params.course)) notFound();
  const { title, description } = COURSE_MAP[params.course];
  return genMetadata(title, description);
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
    const userProgressForCoursePromise = user
      ? fetchUserProgressForCourse(courseId)
      : fetchGuestProgressForCourse(courseId);

    // Wait for both operations to complete
    const [recordMap, userProgressForCourse] = await perf(
      `/playground/${courseId}/${lessonId}: recordMapAndUserProgress`,
      async () =>
        await Promise.all([recordMapPromise, userProgressForCoursePromise])
    );

    const userProgressForLesson = getUserProgressForLesson(
      userProgressForCourse,
      lessonId
    );

    const { totalSections } = getLessonMDX(recordMap, sectionId);
    const { lastCompletedSection } = getLessonInputs(
      userProgressForLesson,
      lessonId
    );
    if (totalSections && lastCompletedSection) {
      // if lastCompletedSection > totalSection, return totalSection
      sectionId = Math.min(lastCompletedSection, totalSections);
    }
  }

  if (sectionId === STARTING_SECTION) {
    // Display welcome message on first section
    redirect(
      `/playground/${courseId}/${lessonId}/${sectionId}?${LESSON_START_PARAM}=true`
    );
  } else {
    redirect(`/playground/${courseId}/${lessonId}/${sectionId}`);
  }
}
