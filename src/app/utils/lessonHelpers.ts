'server only';

import { cookies } from 'next/headers';
import { createClient } from '@/app/utils/supabase/server';
import {
  JsonObject,
  UserProgressTable,
  verifiedJsonObjectFromDB,
} from '@/app/lib/types';
import {
  getLessonInputMDX,
  getLessonOutputMDX,
  getLessonTotalSections,
} from '@/app/lib/data';
import { ExtendedRecordMap } from 'notion-types';
import { MDXRemoteSerializeResult } from 'next-mdx-remote';
import { serialize } from 'next-mdx-remote/serialize';
import { User } from '@supabase/supabase-js';

export async function getAIFeedbackMDX(
  aifeedback: string
): Promise<MDXRemoteSerializeResult> {
  return serialize(aifeedback);
}

export async function getLessonMDX(
  recordMap: ExtendedRecordMap,
  section: number
): Promise<{
  mdxInputSource: MDXRemoteSerializeResult;
  mdxOutputSource: MDXRemoteSerializeResult;
  totalSections: number;
}> {
  const totalSections = getLessonTotalSections(recordMap);

  // Start both serialization operations in parallel
  const inputMDXPromise = serialize(getLessonInputMDX(recordMap, section));
  const outputMDXPromise = serialize(getLessonOutputMDX(recordMap, section));

  // Wait for both operations to complete
  const [mdxInputSource, mdxOutputSource] = await Promise.all([
    inputMDXPromise,
    outputMDXPromise,
  ]);

  return { mdxInputSource, mdxOutputSource, totalSections };
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

interface LessonInput {
  data: JsonObject | null;
  lastCompletedSection: number;
}

export function getLessonInputs(
  userProgress: UserProgressTable | null,
  lessonId: string,
  user: User
): LessonInput {
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
      const lastCompletedSection =
        ((lessonInputFromDB['metadata'] as JsonObject)[
          'lastCompletedSection'
        ] as number) || 0;
      return {
        data: lessonInputFromDB['data'] as JsonObject,
        lastCompletedSection,
      };
    }
  }
  console.log(
    `no lesson input found for lesson ${lessonId} of user ${user.id}`
  );
  return { data: {}, lastCompletedSection: 0 };
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
