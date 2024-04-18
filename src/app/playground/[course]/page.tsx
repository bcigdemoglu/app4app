import { COURSE_MAP, genMetadata } from '@/lib/data';
import { getUserProgressForLastLesson } from '@/utils/lessonDataHelpers';
import {
  fetchGuestProgressForCourse,
  fetchUserProgressForCourse,
} from '@/utils/lessonHelpers';
import { createClient } from '@/utils/supabase/server';
import { Metadata } from 'next';
import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation';

interface Props {
  params: { course: string };
}

function isValidCourse(courseId: string) {
  return COURSE_MAP[courseId];
}

export function generateMetadata({ params }: Props): Metadata {
  if (!isValidCourse(params.course)) notFound();
  const { title, description } = COURSE_MAP[params.course];
  return genMetadata(title, description);
}

export default async function Page({ params }: Props) {
  const { course: courseId } = params;
  if (!isValidCourse(courseId)) notFound();
  const { access } = COURSE_MAP[courseId];

  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (access === 'private' && !user) {
    redirect('/register');
  }

  const userProgressForCourse = user
    ? await fetchUserProgressForCourse(courseId)
    : await fetchGuestProgressForCourse(courseId);

  if (userProgressForCourse) {
    const lastUserProgress = getUserProgressForLastLesson(
      userProgressForCourse
    );
    if (lastUserProgress) {
      const lessonId = lastUserProgress.lesson_id;
      redirect(`/playground/${courseId}/${lessonId}`);
    }
  }

  const firstLesson = Object.entries(COURSE_MAP[courseId].lessonMap).find(
    (l) => l[1].order === 0
  );
  if (!firstLesson) {
    notFound();
  }
  const firstLessonId = firstLesson[1].id;
  redirect(`/playground/${courseId}/${firstLessonId}`);
}
