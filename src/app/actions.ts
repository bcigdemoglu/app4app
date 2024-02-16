'use server';

import { cookies } from 'next/headers';
import { createClient } from '@/app/utils/supabase/actions';
import { redirect } from 'next/navigation';
import {
  JsonObject,
  verifiedJsonObjectFromDB,
  isSameJson,
  UpdateUserInputFormState,
} from '@/app/lib/types';
import { revalidatePath } from 'next/cache';
export async function updateUserInputsByLessonId(
  _currentState: UpdateUserInputFormState,
  formData: FormData
): Promise<UpdateUserInputFormState> {
  const newLessonInput: JsonObject = {};
  const lessonId = formData.get('lesson_id') as string;

  for (const [key, value] of formData.entries()) {
    if (
      !key.startsWith('$') &&
      (typeof value === 'number' ||
        typeof value === 'boolean' ||
        typeof value === 'string')
    ) {
      newLessonInput[key] = value;
    }
  }

  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
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

  // Get full object or default to empty object
  let existingInputsByLessonId: JsonObject = {};
  let existingLessonInput: JsonObject = {};
  if (userProgress && userProgress.inputs_by_lesson_id) {
    // Get user progress if there is one in DB
    const inputsByLessonIdFromDB = verifiedJsonObjectFromDB(
      userProgress.inputs_by_lesson_id,
      `FATAL_DB_ERROR: inputs_by_lesson_id is not an object for user ${user.id}!`
    );
    existingInputsByLessonId = inputsByLessonIdFromDB;
    if (inputsByLessonIdFromDB[lessonId]) {
      // Get lesson input if there is one in the DB
      const lessonInputWithMetadataFromDB = verifiedJsonObjectFromDB(
        inputsByLessonIdFromDB[lessonId],
        `FATAL_DB_ERROR: inputs_by_lesson_id.${lessonId} is not an object for user ${user.id}!`
      );
      const lessonInputFromDB = verifiedJsonObjectFromDB(
        lessonInputWithMetadataFromDB['data'],
        `FATAL_DB_ERROR: inputs_by_lesson_id.${lessonId}.data is not an object for user ${user.id}!`
      );
      existingLessonInput = lessonInputFromDB;
    }
    if (isSameJson(existingLessonInput, newLessonInput)) {
      // Fast check for no change in input fields, do not update DB
      return { state: 'noupdate', data: existingLessonInput };
    }
  }

  // New object, update DB
  const lessonInputWithMetadata = {
    data: newLessonInput,
    metadata: {
      modified_at: new Date().toISOString(),
    },
  };

  const updatedInputsByLessonId = {
    ...existingInputsByLessonId,
    ...{ [lessonId]: lessonInputWithMetadata },
  };

  if (userProgress) {
    const { data: updatedUserProgress, error: updateUserProgressError } =
      await supabase
        .from('user_progress')
        .update({
          user_id: user.id,
          inputs_by_lesson_id: updatedInputsByLessonId,
          modified_at: new Date().toISOString(),
        })
        .eq('id', userProgress.id)
        .select()
        .single();

    if (updateUserProgressError) {
      console.error('updateUserProgressError', updateUserProgressError);
      throw new Error(
        `DB_ERROR: could not update inputs_by_lesson_id for user ${user.id}`
      );
    }
    revalidatePath('/playground');
    const updatedData = (
      (updatedUserProgress.inputs_by_lesson_id as JsonObject)[
        lessonId
      ] as JsonObject
    )['data'] as JsonObject;
    return {
      state: 'success',
      data: updatedData,
    };
  } else {
    const { data: updatedUserProgress, error: insertUserProgressError } =
      await supabase
        .from('user_progress')
        .insert({
          course_id: 'demo',
          user_id: user.id,
          inputs_by_lesson_id: updatedInputsByLessonId,
          modified_at: new Date().toISOString(),
        })
        .select()
        .single();

    if (insertUserProgressError) {
      console.error('insertUserProgressError', insertUserProgressError);
      throw new Error(
        `DB_ERROR: could not insert inputs_by_lesson_id for user ${user.id}`
      );
    }
    revalidatePath('/playground');
    const updatedData = (
      (updatedUserProgress.inputs_by_lesson_id as JsonObject)[
        lessonId
      ] as JsonObject
    )['data'] as JsonObject;
    return {
      state: 'success',
      data: updatedData,
    };
  }
}

export async function updateUserOutputByLessonId(
  outputHTML: string,
  lessonId: string
): Promise<string> {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
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
  if (!userProgress) {
    throw new Error(
      `FATAL_DB_ERROR: no user_progress found for user ${user.id} to update output!`
    );
  }

  const outputsByLessonIdFromDB =
    (userProgress.outputs_by_lesson_id as JsonObject) || {};

  const lessonOutputFromDB = (
    outputsByLessonIdFromDB[lessonId] as JsonObject
  )?.['data'] as string;

  if (lessonOutputFromDB === outputHTML) {
    // Fast check for no change in output, do not update DB
    return outputHTML;
  }

  const lessonOutputWithMetadata = {
    data: outputHTML,
    metadata: {
      modified_at: new Date().toISOString(),
    },
  };

  const updatedOutputsByLessonId = {
    ...outputsByLessonIdFromDB,
    ...{ [lessonId]: lessonOutputWithMetadata },
  };

  const { data: updatedUserProgress, error: updateUserProgressError } =
    await supabase
      .from('user_progress')
      .update({
        id: userProgress.id,
        user_id: user.id,
        outputs_by_lesson_id: updatedOutputsByLessonId,
        modified_at: new Date().toISOString(),
      })
      .eq('id', userProgress.id)
      .select()
      .single();

  if (updateUserProgressError) {
    console.error('updateUserProgressError', updateUserProgressError);
    throw new Error(
      `DB_ERROR: could not update outputs_by_lesson_id for user ${user.id}`
    );
  }
  revalidatePath('/playground');
  const updatedData = (
    (updatedUserProgress.outputs_by_lesson_id as JsonObject)[
      lessonId
    ] as JsonObject
  )['data'] as string;
  return updatedData;
}
