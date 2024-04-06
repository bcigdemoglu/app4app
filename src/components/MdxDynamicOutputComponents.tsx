'server-only';

import { JsonObject, toInputTextId } from '@/lib/types';
import { fetchAiResponse } from '@/utils/lessonHelpers';
import { MDXComponents } from 'mdx/types';

export function getMdxDynamicOutputComponents(
  lessonInputsJson: JsonObject | null
): MDXComponents {
  async function O_TEXT_AI({ name, prompt }: { name: string; prompt: string }) {
    const fieldId = toInputTextId(name);
    const inputValue = lessonInputsJson
      ? (lessonInputsJson[fieldId] as string)
      : 'ERROR';
    const aiResponse = await fetchAiResponse(inputValue, prompt);
    // const aiResponse = await Promise.resolve('AI response');
    console.log('aiResponse generated: ', aiResponse);

    return (
      // Respect the newlines in the value
      <span
        key={'outputComponent.' + fieldId}
        className='whitespace-pre-line'
        id={fieldId}
      >
        {aiResponse}
      </span>
    );
  }
  return {
    O_TEXT_AI,
  };
}
