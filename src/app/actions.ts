'use server';

import { cookies } from 'next/headers';
import { createClient } from '@/app/utils/supabase/actions';
import { redirect } from 'next/navigation';
import { Json } from '@/app/lib/database.types';

type FormState = { invalidFields: string[] };

type JsonObject = { [key: string]: Json };

function isJsonObject(obj?: Json): boolean {
  return typeof obj === 'object' && obj !== null && !Array.isArray(obj);
}

function isSameJson(obj1: Json, obj2: Json): boolean {
  return JSON.stringify(obj1) === JSON.stringify(obj2);
}

function verifiedJsonObjectFromDB(
  obj: Json | undefined,
  errMsg: string
): JsonObject {
  if (!isJsonObject(obj)) {
    throw new Error(errMsg);
  }
  return obj as JsonObject;
}

export async function updateForm(
  _currentState: FormState,
  formData: FormData
): Promise<FormState> {
  const emptyKeys: string[] = [];
  const newLessonInput: JsonObject = {};
  const formState = { invalidFields: emptyKeys };
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
  } else {
    const { data: userProgress, error: getUserProgressError } = await supabase
      .from('user_progress')
      .select('*')
      .single();

    if (getUserProgressError) {
      console.error('getUserProgressError', getUserProgressError);
    }

    // Get full object or default to empty object
    let existingInputsByLessonId: JsonObject = {};
    let existingLessonInput: JsonObject = {};
    if (userProgress) {
      // Get user progress if there is one in DB
      console.log('userProgress', userProgress);
      const inputsByLessonIdFromDB = verifiedJsonObjectFromDB(
        userProgress.inputs_by_lesson_id,
        `FATAL_DB_ERROR: inputs_by_lesson_id is not an object for user ${user.id}!`
      );
      console.log('inputsByLessonIdFromDB', inputsByLessonIdFromDB);
      existingInputsByLessonId = inputsByLessonIdFromDB;
      if (inputsByLessonIdFromDB[lessonId]) {
        // Get lesson input if there is one in the DB
        const lessonInputFromDB = verifiedJsonObjectFromDB(
          inputsByLessonIdFromDB[lessonId],
          `FATAL_DB_ERROR: inputs_by_lesson_id.${lessonId} is not an object for user ${user.id}!`
        );
        console.log('lessonInputFromDB', lessonInputFromDB);
        existingLessonInput = lessonInputFromDB;
      }
    }

    // drop metadata for comparison if present
    delete existingLessonInput?.metadata;
    if (isSameJson(existingLessonInput, newLessonInput)) {
      // Fast check for no change in input fields, do not update DB
      return formState;
    } else {
      // New object, update DB
      const lessonInputWithMetadata = {
        ...newLessonInput,
        metadata: {
          modified_at: new Date().toISOString(),
        },
      };

      const updatedInputsByLessonId = {
        ...existingInputsByLessonId,
        ...{ [lessonId]: lessonInputWithMetadata },
      };
      const { data: updatedUserProgress, error: updateUserProgressError } =
        await supabase
          .from('user_progress')
          .upsert({
            id: user.id,
            inputs_by_lesson_id: updatedInputsByLessonId,
            modified_at: new Date().toISOString(),
          })
          .select();

      if (updateUserProgressError) {
        console.error('updateUserProgressError', updateUserProgressError);
        throw new Error(
          `DB_ERROR: could not update inputs_by_lesson_id for user ${user.id}`
        );
      }
      console.log('updatedUserProgress', updatedUserProgress);
    }
    return formState;
  }
}
