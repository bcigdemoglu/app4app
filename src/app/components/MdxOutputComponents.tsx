import { JsonObject, MDXOutputComponents } from '@/app/lib/types';

export const toTextFieldId = (name: string) => `I_TEXT.${name}`;

export function getMdxOutputComponents(
  lessonInputsFromDB: JsonObject | null
): MDXOutputComponents {
  function O_TEXT({ name }: { name: string }): JSX.Element {
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
  return {
    O_TEXT,
  };
}
