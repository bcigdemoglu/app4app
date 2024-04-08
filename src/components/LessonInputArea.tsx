'use client';

import { getMdxInputComponents } from '@/components/MdxInputComponents';
import { MDXRemote, MDXRemoteSerializeResult } from 'next-mdx-remote';
import { getMdxStaticOutputComponents } from './MdxStaticOutputComponents';

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
  console.log('Size of user progress', new Blob([userProgressForCourse]).size);
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
