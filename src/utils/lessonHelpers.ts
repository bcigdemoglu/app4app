'server-only';

import {
  getLessonInputAtSectionMDX,
  getLessonInputUpToSectionMDX,
  getLessonOutputUpToSectionMDX,
  getLessonTotalSections,
} from '@/lib/data';
import {
  UserProgressForCourseFromDB,
  UserProgressForLessonFromDB,
} from '@/lib/types';
import { createClient } from '@/utils/supabase/server';
import { MDXRemoteSerializeResult } from 'next-mdx-remote';
import { serialize } from 'next-mdx-remote/serialize';
import { cookies } from 'next/headers';
import { NotionAPI } from 'notion-client';
import { ExtendedRecordMap } from 'notion-types';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeSlug from 'rehype-slug';
import remarkGfm from 'remark-gfm';
import { perf } from './debug';

export async function getRecordMap(
  id: string
): Promise<ExtendedRecordMap | null> {
  return perf('getRecordMap', async () => {
    const pageId = id;
    const notion = new NotionAPI();
    try {
      const recordMap = await notion.getPage(pageId);
      return recordMap;
    } catch (error) {
      console.error('getRecordMap error', error);
      return null;
    }
  });
}

export async function getAIFeedbackMDX(
  aifeedback: string
): Promise<MDXRemoteSerializeResult> {
  return serialize(aifeedback);
}

export function getLessonMDX(
  recordMap: ExtendedRecordMap | null,
  section: number
): {
  mdxInput: string | null;
  mdxOutput: string | null;
  totalSections: number | null;
} {
  if (!recordMap) {
    return {
      totalSections: null,
      mdxInput: null,
      mdxOutput: null,
    };
  }
  return {
    totalSections: getLessonTotalSections(recordMap),
    mdxInput: getLessonInputAtSectionMDX(recordMap, section),
    mdxOutput: getLessonOutputUpToSectionMDX(recordMap, section),
  };
}

export function getFullLessonMDX(recordMap: ExtendedRecordMap): {
  mdxInput: string;
  mdxOutput: string;
  totalSections: number;
} {
  const totalSections = getLessonTotalSections(recordMap);
  return {
    totalSections,
    mdxInput: getLessonInputUpToSectionMDX(recordMap, totalSections, true),
    mdxOutput: getLessonOutputUpToSectionMDX(recordMap, totalSections, true),
  };
}

export async function serializeLessonMDX(
  lessonMdx: string | null
): Promise<MDXRemoteSerializeResult | null> {
  if (!lessonMdx) {
    return null;
  }

  // Start both serialization operations in parallel
  const mdxSource = await serialize(lessonMdx, {
    mdxOptions: {
      remarkPlugins: [remarkGfm],
      rehypePlugins: [rehypeSlug, rehypeAutolinkHeadings],
    },
  });

  return mdxSource;
}

export async function fetchUserProgressForLesson(
  lessonId: string,
  courseId: string
): Promise<UserProgressForLessonFromDB | null> {
  return perf('fetchUserProgressFromDB', async () => {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('Unauthorized user for fetchUserProgressFromDB');
    }

    const { data: userProgress, error: getUserProgressError } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', user.id)
      .eq('lesson_id', lessonId)
      .eq('course_id', courseId)
      .maybeSingle();

    if (getUserProgressError) {
      console.error('getUserProgressError', getUserProgressError);
    }

    return userProgress;
  });
}

export async function fetchUserProgressForCourse(
  courseId: string
): Promise<UserProgressForCourseFromDB | null> {
  return perf('fetchUserProgressForCourse', async () => {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('Unauthorized user for fetchUserProgressForCourse');
    }

    const { data: userProgressList, error: getUserProgressError } =
      await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('course_id', courseId);

    if (getUserProgressError) {
      console.error('getUserProgressError', getUserProgressError);
    }

    if (!userProgressList) {
      return null;
    }

    const userProgressForCourse: UserProgressForCourseFromDB = {};
    for (const userProgress of userProgressList) {
      userProgressForCourse[userProgress.lesson_id] = userProgress;
    }

    return userProgressForCourse;
  });
}

export async function fetchAiResponse(
  input: string,
  prompt: string
): Promise<string> {
  const response = await fetch(
    'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
      },
      body: JSON.stringify({ inputs: `<s>[INST] ${prompt} ${input} [/INST]` }),
    }
  );
  const aiResponse = (await response.json()) as [{ generated_text: string }];
  if (
    aiResponse &&
    aiResponse.length > 0 &&
    typeof aiResponse[0] === 'object' &&
    aiResponse[0].generated_text &&
    aiResponse[0].generated_text.split('[/INST]').length > 1
  ) {
    return aiResponse[0].generated_text.split('[/INST]')[1].trim();
  } else {
    return `ERROR AI Response: ${aiResponse}`;
  }
}
