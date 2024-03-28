import { COURSE_MAP } from '@/lib/data';
import {
  fetchLessonUserProgress,
  getLessonInputs,
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
    const userProgressFromDB = await fetchLessonUserProgress(
      lessonId,
      courseId,
      user
    );
    const { lastCompletedSection } = getLessonInputs(
      userProgressFromDB,
      lessonId,
      user
    );
    if (lastCompletedSection) {
      sectionId = lastCompletedSection;
    }
  }

  /// TODO IF lastCompletedSection > totalSection, return to totalSection!!!!!!!!
  /// TODO IF lastCompletedSection > totalSection, return to totalSection!!!!!!!!
  /// TODO IF lastCompletedSection > totalSection, return to totalSection!!!!!!!!
  /// TODO IF lastCompletedSection > totalSection, return to totalSection!!!!!!!!

  redirect(`/playground/${courseId}/${lessonId}/${sectionId}`);
}
