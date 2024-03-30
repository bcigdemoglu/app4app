'use server';

import {
  ExportedOuputsFromDB,
  JsonObject,
  UpdateUserInputFormState,
  isSameJson,
  verifiedJsonObjectFromDB,
} from '@/lib/types';
import { createClient } from '@/utils/supabase/actions';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

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

  // Once the user is logged in, they must have a profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .maybeSingle();

  if (!profile) {
    redirect('/my-account');
  }

  try {
    // Fetch user progress with error handling
    const { data: userProgress, error: getUserProgressError } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', user.id)
      .eq('lesson_id', lessonId)
      .eq('course_id', courseId)
      .maybeSingle();

    if (getUserProgressError) {
      throw getUserProgressError; // Re-throw for centralized error handling
    }

    // Early return if data is unchanged
    if (userProgress && userProgress.inputs_json) {
      const existingInputs = verifiedJsonObjectFromDB(
        userProgress.inputs_json,
        // More specific error message
        `FATAL_DB_ERROR: inputs_json corrupt for user ${user.id}, lesson ${lessonId}`
      ) as JsonObject;

      const lastCompletedSection =
        ((existingInputs.metadata as JsonObject)
          ?.lastCompletedSection as number) ?? 0;

      if (isSameJson(existingInputs.data, newLessonInput)) {
        return {
          state: 'noupdate',
          data: existingInputs.data as JsonObject,
          lastCompletedSection,
        };
      }
    }

    // Data to be saved (consolidated)
    const lessonInputWithMetadata = {
      data:
        userProgress && userProgress.inputs_json
          ? {
              ...((userProgress.inputs_json as JsonObject).data as JsonObject),
              ...newLessonInput,
            }
          : newLessonInput,
      metadata: {
        modified_at: new Date().toISOString(),
        lastCompletedSection: section,
      },
    };

    // Update or insert based on userProgress
    const { data: updatedUserProgress, error } = await supabase
      .from('user_progress')
      .upsert({
        // Upsert for cleaner logic
        user_id: user.id,
        lesson_id: lessonId,
        course_id: courseId,
        inputs_json: lessonInputWithMetadata,
        modified_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error(
        `DB_ERROR: Failed to update/insert progress for user ${user.id}`,
        error
      );
      redirect('/error');
    }

    revalidatePath('/playground'); // Assuming you have a helper for this

    return {
      state: 'success',
      data: (updatedUserProgress.inputs_json as JsonObject).data as JsonObject,
      lastCompletedSection: section,
    };
  } catch (error) {
    console.error('Error updating user progress:', error);
    // Consider returning an error state instead of throwing directly from here
    throw error; // ...or re-throw if you want it handled elsewhere
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

  const { error: deleteUserProgressError } = await supabase
    .from('user_progress')
    .delete()
    .eq('user_id', user.id)
    .eq('lesson_id', lessonId)
    .eq('course_id', courseId);

  if (deleteUserProgressError) {
    console.error('deleteUserProgressError', deleteUserProgressError);
    throw new Error(
      `DB_ERROR: could not delete user progress for user ${user.id} lesson ${lessonId} course ${courseId}!`
    );
  }

  revalidatePath('/playground');
  redirect(`/playground/${courseId}/${lessonId}`);
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
    .eq('user_id', user.id)
    .eq('lesson_id', lessonId)
    .eq('course_id', courseId)
    .single();

  if (getUserProgressError) {
    console.error('getUserProgressError', getUserProgressError);
  }
  if (!userProgress) {
    throw new Error(
      `FATAL_DB_ERROR: no user_progress found for user ${user.id} of lesson ${lessonId} to update output!`
    );
  }

  const outputsFromDB = (userProgress.outputs_json as JsonObject) || {};

  const lessonOutputFromDB = outputsFromDB['data'] as string;

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
  const { data: updatedUserProgress, error: updateUserProgressError } =
    await supabase
      .from('user_progress')
      .update({
        outputs_json: lessonOutputWithMetadata,
        modified_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)
      .eq('lesson_id', lessonId)
      .eq('course_id', courseId)
      .select()
      .single();

  if (updateUserProgressError) {
    console.error('updateUserProgressError', updateUserProgressError);
    throw new Error(
      `DB_ERROR: could not update outputs_json for user ${user.id} of lesson ${lessonId}`
    );
  }
  revalidatePath('/playground');
  const updatedData = (updatedUserProgress.outputs_json as JsonObject)[
    'data'
  ] as string;
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
    .maybeSingle();

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
      .maybeSingle();

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
          lesson_id: lessonId,
          user_id: user.id,
          full_name: profile?.full_name,
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

export async function collectWidgetStat(
  inputJson: JsonObject,
  medataJson: JsonObject
): Promise<boolean> {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { error: insertDataError } = await supabase
    .from('calculator_widget')
    .insert({
      inputs: inputJson,
      metadata: medataJson,
    })
    .single();

  if (insertDataError) {
    console.error('insertDataError', insertDataError);
  }

  return true;
}
