'server only';

import { cookies } from 'next/headers';
import { createClient } from '@/app/utils/supabase/server';
import {
  JsonObject,
  UserProgressTable,
  verifiedJsonObjectFromDB,
} from '@/app/lib/types';
import { getLessonInputMDX, getLessonOutputMDX } from '@/app/lib/data';
import { ExtendedRecordMap } from 'notion-types';
import { MDXRemoteSerializeResult } from 'next-mdx-remote';
import { serialize } from 'next-mdx-remote/serialize';
import { User } from '@supabase/supabase-js';

export async function getLessonMDX(recordMap: ExtendedRecordMap): Promise<{
  mdxInputSource: MDXRemoteSerializeResult;
  mdxOutputSource: MDXRemoteSerializeResult;
}> {
  // Start both serialization operations in parallel
  const inputMDXPromise = serialize(getLessonInputMDX(recordMap));
  const outputMDXPromise = serialize(getLessonOutputMDX(recordMap));

  // Wait for both operations to complete
  const [mdxInputSource, mdxOutputSource] = await Promise.all([
    inputMDXPromise,
    outputMDXPromise,
  ]);

  return { mdxInputSource, mdxOutputSource };
}

export async function fetchUserProgressFromDB(): Promise<UserProgressTable | null> {
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
    .eq('course_id', 'demo')
    .eq('user_id', user.id)
    .single();

  if (getUserProgressError) {
    console.error('getUserProgressError', getUserProgressError);
  }

  return userProgress;
}

export function getLessonInputs(
  userProgress: UserProgressTable | null,
  lessonId: string,
  user: User
): JsonObject {
  // Get full object or default to empty object
  if (userProgress && userProgress.inputs_by_lesson_id) {
    // Get user progress if there is one in DB
    const inputsByLessonIdFromDB = verifiedJsonObjectFromDB(
      userProgress.inputs_by_lesson_id,
      `FATAL_DB_ERROR: inputs_by_lesson_id is not an object for user ${user.id}!`
    );
    if (inputsByLessonIdFromDB[lessonId]) {
      // Get lesson input if there is one in the DB
      const lessonInputFromDB = verifiedJsonObjectFromDB(
        inputsByLessonIdFromDB[lessonId],
        `FATAL_DB_ERROR: inputs_by_lesson_id.${lessonId} is not an object for user ${user.id}!`
      );
      return lessonInputFromDB['data'] as JsonObject;
    }
  }
  console.log(
    `no lesson input found for lesson ${lessonId} of user ${user.id}`
  );
  return {};
}

export function getLessonOutput(
  userProgress: UserProgressTable | null,
  lessonId: string,
  user: User
): string | null {
  // Get full object or default to null object
  if (userProgress && userProgress.outputs_by_lesson_id) {
    // Get user progress if there is one in DB
    const outputsByLessonIdFromDB = verifiedJsonObjectFromDB(
      userProgress.outputs_by_lesson_id,
      `FATAL_DB_ERROR: output_by_lesson_id is not an object for user ${user.id}!`
    );
    if (outputsByLessonIdFromDB[lessonId]) {
      // Get lesson input if there is one in the DB
      const lessonOutputsFromDB = verifiedJsonObjectFromDB(
        outputsByLessonIdFromDB[lessonId],
        `FATAL_DB_ERROR: outputs_by_lesson_id.${lessonId} is not an object for user ${user.id}!`
      );
      return lessonOutputsFromDB['data'] as string;
    }
  }
  console.log(
    `no lesson output found for lesson ${lessonId} of user ${user.id}`
  );
  return null;
}
