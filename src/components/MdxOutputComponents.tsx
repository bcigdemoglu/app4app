'server-only';

import { fetchAiResponse } from '@/app/actions';
import { JsonObject } from '@/lib/types';
import { MDXComponents } from 'mdx/types';

export const toTextFieldId = (name: string) => `I_TEXT.${name}`;

export function getMdxOutputComponents(
  lessonInputsFromDB: JsonObject | null
): MDXComponents {
  function O_TEXT({ name }: { name: string }) {
    const fieldId = toTextFieldId(name);
    const value = lessonInputsFromDB
      ? (lessonInputsFromDB[fieldId] as string)
      : 'ERROR';
    return (
      // Respect the newlines in the value
      <span className='whitespace-pre-line' id={fieldId}>
        {value}
      </span>
    );
  }
  async function O_TEXT_AI({ name, prompt }: { name: string; prompt: string }) {
    const fieldId = toTextFieldId(name);
    const inputValue = lessonInputsFromDB
      ? (lessonInputsFromDB[fieldId] as string)
      : 'ERROR';
    const aiResponse = await fetchAiResponse(inputValue, prompt);
    // const aiResponse = await Promise.resolve('AI response');
    console.log('aiResponse', aiResponse);

    return (
      // Respect the newlines in the value
      <span className='whitespace-pre-line' id={fieldId}>
        {aiResponse}
      </span>
    );
  }
  return {
    O_TEXT,
    O_TEXT_AI,
  };
}
