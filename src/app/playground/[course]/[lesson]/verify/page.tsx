import { getMdxDynamicOutputComponents } from '@/components/MdxDynamicOutputComponents';
import { getMdxStaticOutputComponents } from '@/components/MdxStaticOutputComponents';
import NotionPage from '@/components/NotionPage';
import { COURSE_MAP, genMetadata } from '@/lib/data';
import { perf } from '@/utils/debug';
import {
  getLessonInputs,
  getUserProgressForLesson,
} from '@/utils/lessonDataHelpers';
import {
  fetchUserProgressForCourse,
  getFullLessonMDX,
  getRecordMap,
  serializeLessonMDX,
} from '@/utils/lessonHelpers';
import { createClient } from '@/utils/supabase/server';
import { Metadata } from 'next';
import { MDXRemote } from 'next-mdx-remote/rsc';
import dynamic from 'next/dynamic';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';

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

  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    notFound();
  }

  // Once the user is logged in, they must have a profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .single();

  const isAdmin = profile?.plan.toLowerCase() === 'admin';
  if (!user || !isAdmin) {
    notFound();
  }

  const lesson = COURSE_MAP[courseId].lessonMap[lessonId];
  const { notionId } = lesson;
  // Start both serialization operations in parallel
  const recordMapPromise = getRecordMap(notionId);
  const userProgressFromDBPromise = user
    ? fetchUserProgressForCourse(courseId)
    : Promise.resolve(null);

  // Wait for both operations to complete
  const [recordMap, userProgressForCourse] = await perf(
    `/playground/${courseId}/${lessonId}/verify: recordMapAndUserProgress`,
    async () => await Promise.all([recordMapPromise, userProgressFromDBPromise])
  );

  const userProgressForLesson = getUserProgressForLesson(
    userProgressForCourse,
    lessonId
  );

  if (!recordMap) {
    throw new Error('Record map not found');
  }

  const { mdxInput, mdxOutput } = getFullLessonMDX(recordMap);
  const { data: lessonInputsFromDB } = getLessonInputs(
    userProgressForLesson,
    lessonId
  );
  const lessonInputs = JSON.stringify(lessonInputsFromDB);

  const mdxInputSource = await serializeLessonMDX(mdxInput);
  if (!mdxInputSource) {
    throw new Error('MDX input source not found');
  }

  const LessonInputArea = dynamic(
    () => import('@/components/LessonInputArea'),
    { ssr: false }
  );

  return (
    <div className='grid h-svh grid-cols-3 p-10'>
      <div className='h-full flex-grow overflow-auto'>
        <NotionPage recordMap={recordMap}></NotionPage>
      </div>
      <div className='prose h-full overflow-auto'>
        <LessonInputArea
          mdxInputSource={mdxInputSource}
          courseId={courseId}
          lessonId={lessonId}
          lessonInputs={lessonInputs}
          userProgressForCourse={JSON.stringify(userProgressForCourse)}
        />
      </div>
      <div className='prose h-full overflow-auto'>
        <MDXRemote
          source={mdxOutput}
          components={{
            ...getMdxDynamicOutputComponents(lessonInputsFromDB),
            ...getMdxStaticOutputComponents(
              lessonInputsFromDB,
              userProgressForCourse,
              courseId
            ),
          }}
        />
      </div>
    </div>
  );
}
