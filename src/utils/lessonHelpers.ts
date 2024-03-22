'server-only';

import {
  COURSE_MAP,
  getLessonInputMDX,
  getLessonOutputMDX,
  getLessonTotalSections,
} from '@/lib/data';
import {
  JsonObject,
  UserProgressFromDB,
  verifiedJsonObjectFromDB,
} from '@/lib/types';
import { createClient } from '@/utils/supabase/server';
import { User } from '@supabase/supabase-js';
import { MDXRemoteSerializeResult } from 'next-mdx-remote';
import { serialize } from 'next-mdx-remote/serialize';
import { cookies } from 'next/headers';
import { NotionAPI } from 'notion-client';
import { ExtendedRecordMap } from 'notion-types';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeSlug from 'rehype-slug';
import remarkGfm from 'remark-gfm';
import { perf } from './debug';

export async function getRecordMap(id: string) {
  return perf('getRecordMap', async () => {
    const pageId = id;
    const notion = new NotionAPI();
    const recordMap = await notion.getPage(pageId);
    return recordMap;
  });
}

export async function getAIFeedbackMDX(
  aifeedback: string
): Promise<MDXRemoteSerializeResult> {
  return serialize(aifeedback);
}

export function getLessonMDX(
  recordMap: ExtendedRecordMap,
  section: number
): {
  mdxInput: string;
  mdxOutput: string;
  totalSections: number;
} {
  return {
    totalSections: getLessonTotalSections(recordMap),
    mdxInput: getLessonInputMDX(recordMap, section),
    mdxOutput: getLessonOutputMDX(recordMap, section),
  };
}

export async function serializeLessonMDX(
  mdxInput: string,
  mdxOutput: string
): Promise<{
  mdxInputSource: MDXRemoteSerializeResult;
  mdxOutputSource: MDXRemoteSerializeResult;
}> {
  // Start both serialization operations in parallel
  const inputMDXPromise = serialize(mdxInput, {
    mdxOptions: {
      remarkPlugins: [remarkGfm],
      rehypePlugins: [rehypeSlug, rehypeAutolinkHeadings],
    },
  });
  const outputMDXPromise = serialize(mdxOutput, {
    mdxOptions: {
      remarkPlugins: [remarkGfm],
      rehypePlugins: [rehypeSlug, rehypeAutolinkHeadings],
    },
  });

  // Wait for both operations to complete
  const [mdxInputSource, mdxOutputSource] = await Promise.all([
    inputMDXPromise,
    outputMDXPromise,
  ]);

  return { mdxInputSource, mdxOutputSource };
}

export async function fetchLessonUserProgress(
  lessonId: string,
  courseId: string
): Promise<UserProgressFromDB | null> {
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

interface LessonInput {
  data: JsonObject | null;
  lastCompletedSection: number | null;
  modifiedAt: string | null;
}

export function getLessonInputs(
  userProgress: UserProgressFromDB | null,
  lessonId: string,
  user: User
): LessonInput {
  // Get full object or default to empty object
  if (userProgress && userProgress.inputs_json) {
    // Get user progress if there is one in DB
    const inputsFromDB = verifiedJsonObjectFromDB(
      userProgress.inputs_json,
      `FATAL_DB_ERROR: inputs_json is not an object for user ${user.id} of lesson ${lessonId}!`
    );
    const metadata = inputsFromDB['metadata'] as JsonObject;
    const lastCompletedSection = metadata['lastCompletedSection'] as number;
    const modifiedAt = metadata['modified_at'] as string;
    return {
      data: inputsFromDB['data'] as JsonObject,
      lastCompletedSection,
      modifiedAt,
    };
  }
  console.log(
    `no lesson input found for lesson ${lessonId} of user ${user.id}`
  );
  return { data: null, lastCompletedSection: null, modifiedAt: null };
}

export function getLessonOutput(
  userProgress: UserProgressFromDB | null,
  lessonId: string,
  user: User
): { data: string | null; modifiedAt: string | null } {
  // Get full object or default to null object
  if (userProgress && userProgress.outputs_json) {
    // Get user progress if there is one in DB
    const outputsFromDB = verifiedJsonObjectFromDB(
      userProgress.outputs_json,
      `FATAL_DB_ERROR: outputs_json is not an object for user ${user.id} of lesson ${lessonId}!`
    );
    const data = outputsFromDB['data'] as string;
    const metadata = outputsFromDB['metadata'] as JsonObject;
    const modifiedAt = metadata['modified_at'] as string;
    return { data, modifiedAt };
  }
  console.log(
    `no lesson output found for lesson ${lessonId} of user ${user.id}`
  );
  return { data: null, modifiedAt: null };
}

export function getLessonOrder(courseId: string, lessonId: string): number {
  return COURSE_MAP[courseId].lessonMap[lessonId].order;
}

export function getLessonOrderFromUserProgress(
  userProgress: UserProgressFromDB
): number {
  return getLessonOrder(userProgress.course_id, userProgress.lesson_id);
}

export async function fetchUserProgressForCourse(
  courseId: string
): Promise<UserProgressFromDB[] | null> {
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

    // Order the outputs by Lesson Order
    userProgressList?.sort((a: UserProgressFromDB, b: UserProgressFromDB) => {
      return (
        getLessonOrderFromUserProgress(a) - getLessonOrderFromUserProgress(b)
      );
    });

    return userProgressList;
  });
}

export async function fetchUserProgressForCourseUpToLesson(
  courseId: string,
  lessonId: string
): Promise<UserProgressFromDB[] | null> {
  const allUserProgress = await fetchUserProgressForCourse(courseId);
  if (!allUserProgress) return null;

  const maxLessonOrder = COURSE_MAP[courseId].lessonMap[lessonId].order;

  return allUserProgress.filter(
    (userProgress) =>
      getLessonOrderFromUserProgress(userProgress) < maxLessonOrder
  );
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
