import { COURSE_MAP } from '@/lib/data';
import { Lesson, UserProgressForCourseFromDB } from '@/lib/types';
import {
  getLessonInputs,
  getUserProgressForLesson,
} from '@/utils/lessonDataHelpers';
import {
  fetchUserProgressForCourse,
  getLessonMDX,
  getRecordMap,
} from '@/utils/lessonHelpers';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { redirect } from 'next/navigation';

async function getLessonTotalSections(lesson: Lesson) {
  // Start both serialization operations in parallel
  const recordMap = await getRecordMap(lesson.notionId);

  const { totalSections } = getLessonMDX(recordMap, 1);
  // create an array from 0 to totalSections
  return Array.from({ length: totalSections || 0 }, (_, i) => i + 1);
}

function LessonSectionInfo({
  userProgressForCourse,
  courseId,
  lesson,
  section,
}: {
  userProgressForCourse: UserProgressForCourseFromDB | null;
  courseId: string;
  lesson: Lesson;
  section: number;
}) {
  const sectionCompleted = isLessonSectionCompleted(
    userProgressForCourse,
    lesson.id,
    section
  );

  const sectionContent = `${section} ${sectionCompleted ? '✅' : '❌'}`;

  return sectionCompleted ? (
    <Link
      className='text-nowrap'
      href={`/playground/${courseId}/${lesson.id}/${section}`}
    >
      {sectionContent}
    </Link>
  ) : (
    <div className='text-nowrap'>{sectionContent}</div>
  );
}

function isLessonSectionCompleted(
  userProgressForCourse: UserProgressForCourseFromDB | null,
  lessonId: string,
  section: number
): boolean {
  if (!userProgressForCourse) return false;

  const userProgressForLesson = getUserProgressForLesson(
    userProgressForCourse,
    lessonId
  );
  const { lastCompletedSection } = getLessonInputs(
    userProgressForLesson,
    lessonId
  );

  if (!lastCompletedSection) return false;
  return section <= lastCompletedSection;
}

function isLessonCompleted(
  userProgressForCourse: UserProgressForCourseFromDB | null,
  lessonId: string,
  totalSection: number
): boolean {
  if (!userProgressForCourse) return false;

  const userProgressForLesson = getUserProgressForLesson(
    userProgressForCourse,
    lessonId
  );
  const { lastCompletedSection } = getLessonInputs(
    userProgressForLesson,
    lessonId
  );

  if (!lastCompletedSection) return false;
  return totalSection <= lastCompletedSection;
}

export default async function SyllabuskModal({
  courseId,
}: {
  courseId: string;
}) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { access, title, lessonMap } = COURSE_MAP[courseId];

  const allowAccess =
    !!(access === 'public') || // Allow access if public
    !!user; // Allow access if user is logged in

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

  const userProgressForCourse = user
    ? await fetchUserProgressForCourse(courseId)
    : null;

  const lessonSectionData: Record<string, number[]> = {};
  for (const lesson of Object.values(lessonMap)) {
    lessonSectionData[lesson.id] = await getLessonTotalSections(lesson);
  }

  return (
    <dialog className='fixed left-0 top-0 z-50 flex h-full w-full items-center justify-center overflow-auto bg-black bg-opacity-50 backdrop-blur-sm'>
      <div className='m-auto rounded-lg bg-white p-8 shadow-lg'>
        <div className='prose flex flex-col items-center space-y-4 prose-a:no-underline'>
          <Link href={`/playground/${courseId}`}>
            <h2 className='m-0 p-0'>Syllabus for {title}</h2>
          </Link>
          <ul>
            {Object.values(lessonMap).map((lesson) => (
              <li key={lesson.id} className='m-0 flex flex-col p-0'>
                <Link
                  className='m-0 p-0'
                  href={`/playground/${courseId}/${lesson.id}`}
                >
                  {`${lesson.title}`}{' '}
                  {isLessonCompleted(
                    userProgressForCourse,
                    lesson.id,
                    lessonSectionData[lesson.id].length
                  )
                    ? '(completed)'
                    : ''}
                </Link>
                <div className='m-0 flex flex-wrap gap-2 p-0 pl-4'>
                  {lessonSectionData[lesson.id].map((section) => (
                    <LessonSectionInfo
                      key={section}
                      userProgressForCourse={userProgressForCourse}
                      courseId={courseId}
                      lesson={lesson}
                      section={section}
                    />
                  ))}
                </div>
              </li>
            ))}
          </ul>
          <Link className='self-center' href={'/playground'}>
            <button
              type='button'
              className='rounded bg-blue-500 p-2 text-white'
            >
              Return to playground
            </button>
          </Link>
        </div>
      </div>
    </dialog>
  );
}
