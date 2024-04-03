'use client';

import { getMdxInputComponents } from '@/components/MdxInputComponents';
import { MDXRemote, MDXRemoteSerializeResult } from 'next-mdx-remote';

export default function LessonInputArea({
  mdxInputSource,
  clearInputs,
  setClearInputs,
  courseId,
  lessonId,
  lessonInputs,
}: {
  mdxInputSource: MDXRemoteSerializeResult;
  courseId: string;
  lessonId: string;
  lessonInputs: string;
  clearInputs?: boolean;
  setClearInputs?: (clear: boolean) => void;
}) {
  return (
    <MDXRemote
      {...mdxInputSource}
      components={getMdxInputComponents(
        clearInputs ?? false,
        setClearInputs ?? (() => {}),
        courseId,
        lessonId,
        JSON.parse(lessonInputs)
      )}
    />
  );
}
