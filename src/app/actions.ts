'use server';

import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/actions';
import { redirect } from 'next/navigation';
import {
  JsonObject,
  verifiedJsonObjectFromDB,
  isSameJson,
  UpdateUserInputFormState,
  ExportedOuputsFromDB,
} from '@/lib/types';
import { revalidatePath } from 'next/cache';

export async function updateUserInputsByLessonId(
  _currentState: UpdateUserInputFormState,
  formData: FormData
): Promise<UpdateUserInputFormState> {
  const newLessonInput: JsonObject = {};
  const courseId = formData.get('course_id') as string;
  const lessonId = formData.get('lesson_id') as string;
  const section = parseInt(formData.get('section') as string);

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
    .eq('course_id', courseId)
    .eq('user_id', user.id)
    .single();

  if (getUserProgressError) {
    console.error('getUserProgressError', getUserProgressError);
  }

  // Get full object or default to empty object
  let existingInputsByLessonId: JsonObject = {};
  let existingLessonInput: JsonObject = {};
  let mergedLessonInput: JsonObject = newLessonInput;
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
      // Update last completed section in DB
      const lessonMetadataFromDB = verifiedJsonObjectFromDB(
        lessonInputWithMetadataFromDB['metadata'],
        `FATAL_DB_ERROR: inputs_by_lesson_id.${lessonId}.metadata is not an object for user ${user.id}!`
      );
      const lastCompletedSectionFromDB = (lessonMetadataFromDB[
        'lastCompletedSection'
      ] ?? 0) as number;
      const lessonInputFromDB = verifiedJsonObjectFromDB(
        lessonInputWithMetadataFromDB['data'],
        `FATAL_DB_ERROR: inputs_by_lesson_id.${lessonId}.data is not an object for user ${user.id}!`
      );
      existingLessonInput = lessonInputFromDB;
      if (isSameJson(existingLessonInput, newLessonInput)) {
        // Fast check for no change in input fields, do not update DB
        return {
          state: 'noupdate',
          data: existingLessonInput,
          lastCompletedSection: lastCompletedSectionFromDB,
        };
      }
      mergedLessonInput = { ...existingLessonInput, ...newLessonInput };
    }
  }

  // New object, update DB
  const lessonInputWithMetadata = {
    data: mergedLessonInput,
    metadata: {
      modified_at: new Date().toISOString(),
      lastCompletedSection: section,
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
      lastCompletedSection: section,
    };
  } else {
    const { data: updatedUserProgress, error: insertUserProgressError } =
      await supabase
        .from('user_progress')
        .insert({
          course_id: courseId,
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
      lastCompletedSection: section,
    };
  }
}

export async function deleteUserDataByLessonId(
  courseId: string,
  lessonId: string
): Promise<boolean> {
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
    .eq('course_id', courseId)
    .eq('user_id', user.id)
    .single();

  if (getUserProgressError) {
    console.error('getUserProgressError', getUserProgressError);
    throw new Error(
      `DB_ERROR: could not get user progress for user ${user.id}`
    );
  }

  if (userProgress && userProgress.inputs_by_lesson_id) {
    const allLessonProgress = userProgress.inputs_by_lesson_id as JsonObject;
    const lessonProgress = allLessonProgress[lessonId] as JsonObject;

    const allLessonOutput = userProgress.outputs_by_lesson_id as JsonObject;
    const lessonOutput = allLessonOutput[lessonId] as JsonObject;

    if (lessonProgress) {
      delete allLessonProgress[lessonId];
    }
    if (lessonOutput) {
      delete allLessonOutput[lessonId];
    }

    const { error: updateUserProgressError } = await supabase
      .from('user_progress')
      .update({
        user_id: user.id,
        inputs_by_lesson_id: allLessonProgress,
        outputs_by_lesson_id: allLessonOutput,
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
    redirect(`/playground/${courseId}/${lessonId}`);
    return true;
  }
  return false;
}

export async function updateUserOutputByLessonId(
  courseId: string,
  lessonId: string,
  outputHTML: string
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
    .eq('course_id', courseId)
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

export async function exportUserOutput(
  outputHTML: string,
  courseId: string,
  lessonId: string,
  isPublic: boolean
): Promise<{ id: string; output: string }> {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .single();

  if (!profile) {
    redirect('/my-account');
  }

  const { data: existingExportedOutput, error: getExportedOutputError } =
    await supabase
      .from('exported_outputs')
      .select('*')
      .eq('course_id', courseId)
      .eq('user_id', user.id)
      .eq('lesson_id', lessonId)
      .single();

  if (getExportedOutputError) {
    console.error('getExportedOutputError', getExportedOutputError);
  }
  if (!existingExportedOutput) {
    const { data: insertedExportedOutput, error: insertExportedOutputError } =
      await supabase
        .from('exported_outputs')
        .insert({
          output: outputHTML,
          course_id: courseId,
          user_id: user.id,
          full_name: profile?.full_name,
          lesson_id: lessonId,
          is_public: isPublic,
          modified_at: new Date().toISOString(),
        })
        .select()
        .single();

    if (insertExportedOutputError) {
      console.error('insertExportedOutputError', insertExportedOutputError);
      throw new Error(
        `DB_ERROR: could not insert insertExportedOutputError for user ${user.id}`
      );
    }
    revalidatePath('/playground');
    const { id, output } = insertedExportedOutput;
    return { id, output };
  } else {
    const { data: updatedExportedOutput, error: updateExportedOutputError } =
      await supabase
        .from('exported_outputs')
        .update({
          output: outputHTML,
          is_public: isPublic,
          modified_at: new Date().toISOString(),
        })
        .eq('id', existingExportedOutput.id)
        .select()
        .single();

    if (updateExportedOutputError) {
      console.error('updateExportedOutputError', updateExportedOutputError);
      throw new Error(
        `DB_ERROR: could not insert updateExportedOutputError for user ${user.id}`
      );
    }
    revalidatePath('/playground');
    const { id, output } = updatedExportedOutput;
    return { id, output };
  }
}

export async function fetchExportedOutput(
  exportedOutputId: string
): Promise<ExportedOuputsFromDB | null> {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: existingExportedOutput, error: getExportedOutputError } =
    await supabase
      .from('exported_outputs')
      .select('*')
      .eq('id', exportedOutputId)
      .single();

  if (getExportedOutputError) {
    console.error('getExportedOutputError', getExportedOutputError);
    return null;
  }

  const { data: updatedExportedOutput, error: getUpdatedOutputError } =
    await supabase
      .from('exported_outputs')
      .update({
        view_count: existingExportedOutput.view_count + 1,
      })
      .eq('id', exportedOutputId)
      .select()
      .single();

  if (getUpdatedOutputError) {
    console.error('getUpdatedOutputError', getUpdatedOutputError);
    return null;
  }

  return updatedExportedOutput;
}
