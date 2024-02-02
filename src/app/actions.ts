'use server';

type FormState = { invalidFields: string[] };

export async function updateForm(
  _currentState: FormState,
  formData: FormData
): Promise<FormState> {
  const emptyKeys: string[] = [];
  const formState = { invalidFields: emptyKeys };

  for (const [key, value] of formData.entries()) {
    if (!key.startsWith('$') && value === '') {
      emptyKeys.push(key);
    }
  }

  return formState;
}
