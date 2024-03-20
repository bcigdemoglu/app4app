import {
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
  const inputMDXPromise = serialize(mdxInput);
  const outputMDXPromise = serialize(mdxOutput);

  // Wait for both operations to complete
  const [mdxInputSource, mdxOutputSource] = await Promise.all([
    inputMDXPromise,
    outputMDXPromise,
  ]);

  return { mdxInputSource, mdxOutputSource };
}

export async function fetchUserProgressFromDB(
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
