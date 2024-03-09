'use client';

import { JsonObject, MDXOutputComponents } from '@/app/lib/types';
import { useEffect, useRef } from 'react';
import { getMdxOutputComponents, toTextFieldId } from './MdxOutputComponents';

export function getMdxInputComponents(
  clearInputs: boolean,
  lessonInputsFromDB: JsonObject | null
): MDXOutputComponents {
  function I_TEXT({
    name,
    placeholder,
  }: {
    name: string;
    placeholder?: string;
  }) {
    const fieldId = toTextFieldId(name);
    const defaultValue = clearInputs
      ? ''
      : localStorage.getItem(`ilayda.${fieldId}`) ??
        (lessonInputsFromDB?.[fieldId] as string) ??
        '';

    const fieldRef = useRef<HTMLTextAreaElement>(null);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      localStorage.setItem(`ilayda.${fieldId}`, e.target.value);
      if (fieldRef.current) {
        const newHeight = fieldRef.current.scrollHeight + 2;
        const currentHeight = parseInt(
          fieldRef.current.style.height.split('px')[0]
        );
        if (newHeight > currentHeight) {
          fieldRef.current.style.height = newHeight + 'px'; // Fit the textarea to its content
        }
      }
    };

    useEffect(() => {
      if (fieldRef.current) {
        const newHeight = fieldRef.current.scrollHeight + 2;
        fieldRef.current.style.height = newHeight + 'px'; // Fit the textarea to its content
      }
    }, [fieldId]);

    return (
      <textarea
        id={fieldId}
        name={fieldId}
        ref={fieldRef}
        onChange={handleChange}
        defaultValue={defaultValue}
        className='mt-1 block w-full rounded-md border border-slate-300 bg-white pl-2 pr-1 font-mono placeholder-zinc-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500'
        placeholder={placeholder ?? 'Type your answer here...'}
        rows={5}
        required
      />
    );
  }

  return {
    ...getMdxOutputComponents(lessonInputsFromDB),
    I_TEXT,
  };
}
