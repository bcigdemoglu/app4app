import { COURSE_MAP } from '@/lib/data';
import {
  fetchUserProgressFromDB,
  getLessonInputs,
} from '@/utils/lessonHelpers';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation';

interface Props {
  params: { course: string; lesson: string };
}

function isValidLesson(courseId: string, lessonId: string) {
  return COURSE_MAP[courseId] && COURSE_MAP[courseId].lessonMap[lessonId];
}

export default async function Page({ params }: Props) {
  const { course: courseId, lesson: lessonId } = params;
  if (!isValidLesson(courseId, lessonId)) notFound();

  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect('/register');
  }

  const userProgressFromDB = await fetchUserProgressFromDB();
  const { lastCompletedSection: lastCompletedSectionFromDB } = getLessonInputs(
    userProgressFromDB,
    lessonId,
    user
  );

  const defaultSectionId = 1;
  const sectionId = lastCompletedSectionFromDB ?? defaultSectionId;

  redirect(`/playground/${courseId}/${lessonId}/${sectionId}`);
}
