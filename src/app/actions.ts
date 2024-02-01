'use server';

import { NotionAPI } from 'notion-client';

export async function getRecordMap(id: string | null) {
  const pageId = id || 'b57f92a1577e48fcae50a841889968a3';
  const notion = new NotionAPI();
  const recordMap = await notion.getPage(pageId);
  return recordMap;
}

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
