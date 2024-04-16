'use client';

import { getMdxInputComponents } from '@/components/MdxInputComponents';
import { getMdxStaticOutputComponents } from '@/components/MdxStaticOutputComponents';
import { JsonObject, UserProgressForCourseFromDB } from '@/lib/types';
import { isDev } from '@/utils/debug';
import { MDXRemote, MDXRemoteSerializeResult } from 'next-mdx-remote';

export default function LessonInputArea({
  mdxInputSource,
  clearInputs,
  setClearInputs,
  courseId,
  lessonId,
  lessonInputs,
  userProgressForCourse,
}: {
  mdxInputSource: MDXRemoteSerializeResult | null;
  courseId: string;
  lessonId: string;
  lessonInputs: JsonObject | null;
  userProgressForCourse: UserProgressForCourseFromDB | null;
  clearInputs?: boolean;
  setClearInputs?: (clear: boolean) => void;
}) {
  if (isDev(process.env.NODE_ENV)) {
    console.debug(
      `Size of userProgressForCourse: ${new Blob([JSON.stringify(userProgressForCourse)]).size} bytes`
    );
  }
  if (!mdxInputSource) {
    return null;
  }
  return (
    <MDXRemote
      {...mdxInputSource}
      components={{
        ...getMdxInputComponents(
          clearInputs ?? false,
          setClearInputs ?? (() => {}),
          courseId,
          lessonId,
          lessonInputs
        ),
        ...getMdxStaticOutputComponents(
          lessonInputs,
          userProgressForCourse,
          courseId
        ),
      }}
    />
  );
}
