'use client';

import { getMdxInputComponents } from '@/components/MdxInputComponents';
import { getMdxStaticOutputComponents } from '@/components/MdxStaticOutputComponents';
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
  mdxInputSource: MDXRemoteSerializeResult;
  courseId: string;
  lessonId: string;
  lessonInputs: string;
  userProgressForCourse: string;
  clearInputs?: boolean;
  setClearInputs?: (clear: boolean) => void;
}) {
  if (isDev(process.env.NODE_ENV)) {
    console.debug(
      `Size of userProgressForCourse: ${new Blob([userProgressForCourse]).size} bytes`
    );
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
          JSON.parse(lessonInputs)
        ),
        ...getMdxStaticOutputComponents(
          JSON.parse(lessonInputs),
          JSON.parse(userProgressForCourse),
          courseId
        ),
      }}
    />
  );
}
