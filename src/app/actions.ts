'use server';

import { COURSE_MAP, GUEST_MODE_COOKIE } from '@/lib/data';
import { JsonObject, UpdateUserInputFormState, isSameJson } from '@/lib/types';
import { createClient } from '@/utils/supabase/actions';
import { SupabaseClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';
import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import requestIp from 'request-ip';
import { v4 as uuidv4 } from 'uuid';

/**
 * Fetches the user or guest id and the user progress table based on the course id.
 *
 * @throws Redirects to '/login' page if user is not logged in.
 */
async function fetchDBAccessForUser<UserDBTable, GuestDBTable>(
  courseId: string,
  userDBTable: UserDBTable,
  guestDBTable: GuestDBTable
): Promise<{
  userOrGuestDbTable: UserDBTable | GuestDBTable;
  userOrGuestId: string;
  supabase: SupabaseClient;
}> {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const guestId = cookieStore.get(GUEST_MODE_COOKIE)?.value;

  const { access } = COURSE_MAP[courseId];
  const allowSubmit = (access === 'guest' && !!guestId) || user;

  if (user || allowSubmit) {
    const userOrGuestDbTable = user ? userDBTable : guestDBTable;
    const userId = user ? user.id : guestId;

    if (!userId) {
      // Should not happen
      console.error('No user id found but still allowed DB access!');
      redirect('/register');
    }

    return { userOrGuestDbTable, userOrGuestId: userId, supabase };
  }

  redirect('/register');
}

async function fetchDBAccessForUserProgress(courseId: string): Promise<{
  userProgressDbTable: 'user_progress' | 'guest_user_progress';
  userOrGuestId: string;
  supabase: SupabaseClient;
}> {
  const {
    userOrGuestDbTable: userProgressDbTable,
    userOrGuestId,
    supabase,
  } = await fetchDBAccessForUser<'user_progress', 'guest_user_progress'>(
    courseId,
    'user_progress',
    'guest_user_progress'
  );
  return { userProgressDbTable, userOrGuestId, supabase };
}

async function fetchDBAccessForExportedOutput(courseId: string): Promise<{
  exportedOutputsTable: 'exported_outputs' | 'guest_exported_outputs';
  userOrGuestId: string;
  supabase: SupabaseClient;
}> {
  const {
    userOrGuestDbTable: exportedOutputsTable,
    userOrGuestId,
    supabase,
  } = await fetchDBAccessForUser<'exported_outputs', 'guest_exported_outputs'>(
    courseId,
    'exported_outputs',
    'guest_exported_outputs'
  );
  return { exportedOutputsTable, userOrGuestId, supabase };
}

export async function updateUserInputsByLessonId(
  _currentState: UpdateUserInputFormState,
  formData: FormData
): Promise<UpdateUserInputFormState> {
  const newLessonInput: JsonObject = {};
  const courseId = formData.get('course_id') as string;
  const lessonId = formData.get('lesson_id') as string;
  const section = parseInt(formData.get('section') as string);

  const { userProgressDbTable, userOrGuestId, supabase } =
    await fetchDBAccessForUserProgress(courseId);

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

  try {
    // Fetch user progress with error handling
    const { data: userProgress, error: getUserProgressError } = await supabase
      .from(userProgressDbTable)
      .select('*')
      .eq('user_id', userOrGuestId)
      .eq('lesson_id', lessonId)
      .eq('course_id', courseId)
      .maybeSingle();

    if (getUserProgressError) {
      throw getUserProgressError; // Re-throw for centralized error handling
    }

    // Early return if data is unchanged
    if (userProgress && userProgress.inputs_json) {
      const existingInputs = userProgress.inputs_json as JsonObject;

      const lastCompletedSection =
        ((existingInputs.metadata as JsonObject)
          ?.lastCompletedSection as number) ?? null;

      if (isSameJson(existingInputs.data, newLessonInput)) {
        return {
          state: 'noupdate',
          data: existingInputs.data as JsonObject,
          lastCompletedSection,
        };
      }
    }

    const mergedLessonInput =
      userProgress && userProgress.inputs_json
        ? {
            ...((userProgress.inputs_json as JsonObject).data as JsonObject),
            ...newLessonInput,
          }
        : newLessonInput;

    // Data to be saved (consolidated)
    const lessonInputWithMetadata = {
      data: mergedLessonInput,
      metadata: {
        modified_at: new Date().toISOString(),
        lastCompletedSection: section,
      },
    };

    // Update or insert based on userProgress
    const { data: updatedUserProgress, error: upsertUserProgressError } =
      await supabase
        .from(userProgressDbTable)
        .upsert({
          // Upsert for cleaner logic
          user_id: userOrGuestId,
          lesson_id: lessonId,
          course_id: courseId,
          inputs_json: lessonInputWithMetadata,
          modified_at: new Date().toISOString(),
        })
        .select()
        .single();

    if (upsertUserProgressError) {
      console.error(
        `upsertUserProgressError: Failed to update/insert progress for user ${userOrGuestId}`,
        upsertUserProgressError
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
  const { userProgressDbTable, userOrGuestId, supabase } =
    await fetchDBAccessForUserProgress(courseId);

  const { error: deleteUserProgressError } = await supabase
    .from(userProgressDbTable)
    .delete()
    .eq('user_id', userOrGuestId)
    .eq('lesson_id', lessonId)
    .eq('course_id', courseId);

  if (deleteUserProgressError) {
    console.error('deleteUserProgressError', deleteUserProgressError);
    throw new Error(
      `DB_ERROR: could not delete user progress for user ${userOrGuestId} lesson ${lessonId} course ${courseId}!`
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
  const { userProgressDbTable, userOrGuestId, supabase } =
    await fetchDBAccessForUserProgress(courseId);

  const { data: userProgress, error: getUserProgressError } = await supabase
    .from(userProgressDbTable)
    .select('*')
    .eq('user_id', userOrGuestId)
    .eq('lesson_id', lessonId)
    .eq('course_id', courseId)
    .single();

  if (getUserProgressError) {
    console.error('getUserProgressError', getUserProgressError);
  }
  if (!userProgress) {
    throw new Error(
      `FATAL_DB_ERROR: no user_progress found for user ${userOrGuestId} of lesson ${lessonId} to update output!`
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
      .from(userProgressDbTable)
      .update({
        outputs_json: lessonOutputWithMetadata,
        modified_at: new Date().toISOString(),
      })
      .eq('user_id', userOrGuestId)
      .eq('lesson_id', lessonId)
      .eq('course_id', courseId)
      .select()
      .single();

  if (updateUserProgressError) {
    console.error('updateUserProgressError', updateUserProgressError);
    throw new Error(
      `DB_ERROR: could not update outputs_json for user ${userOrGuestId} of lesson ${lessonId}`
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
  const { exportedOutputsTable, userOrGuestId, supabase } =
    await fetchDBAccessForExportedOutput(courseId);

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .maybeSingle();

  const { data: existingExportedOutput, error: getExportedOutputError } =
    await supabase
      .from(exportedOutputsTable)
      .select('*')
      .eq('course_id', courseId)
      .eq('user_id', userOrGuestId)
      .eq('lesson_id', lessonId)
      .maybeSingle();

  if (getExportedOutputError) {
    console.error('getExportedOutputError', getExportedOutputError);
  }
  if (!existingExportedOutput) {
    const { data: insertedExportedOutput, error: insertExportedOutputError } =
      await supabase
        .from(exportedOutputsTable)
        .insert({
          output: outputHTML,
          course_id: courseId,
          lesson_id: lessonId,
          user_id: userOrGuestId,
          full_name: profile?.full_name ?? 'Guest User',
          is_public: isPublic,
          modified_at: new Date().toISOString(),
        })
        .select()
        .single();

    if (insertExportedOutputError) {
      console.error('insertExportedOutputError', insertExportedOutputError);
      throw new Error(
        `DB_ERROR: could not insert insertExportedOutputError for user ${userOrGuestId}`
      );
    }
    revalidatePath('/playground');
    const { id, output } = insertedExportedOutput;
    return { id, output };
  } else {
    const { data: updatedExportedOutput, error: updateExportedOutputError } =
      await supabase
        .from(exportedOutputsTable)
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
        `DB_ERROR: could not insert updateExportedOutputError for user ${userOrGuestId}`
      );
    }
    revalidatePath('/playground');
    const { id, output } = updatedExportedOutput;
    return { id, output };
  }
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

export async function activateGuestMode() {
  const cookieStore = cookies();

  const existingGuestId = cookieStore.get(GUEST_MODE_COOKIE);
  if (existingGuestId) {
    console.error('Guest mode already activated', existingGuestId.value);
    redirect('/playground');
  }

  const newGuestId = uuidv4();
  // Set the cookie
  cookieStore.set(GUEST_MODE_COOKIE, newGuestId, { httpOnly: true });

  const metadata = Object.fromEntries(headers().entries());
  const ip = requestIp.getClientIp({ headers: metadata });

  const supabase = createClient(cookieStore);
  const { error: guestModeError } = await supabase
    .from('guest_mode')
    .insert([{ guest_id: newGuestId, ip, metadata }])
    .single();

  if (guestModeError) {
    console.error('guestModeError', guestModeError);
    redirect('/register');
  }

  console.debug('Guest mode activated', newGuestId);
  redirect('/playground');
}
