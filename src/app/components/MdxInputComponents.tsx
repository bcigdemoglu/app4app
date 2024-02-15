'use client';

import { JsonObject, MDXOutputComponents } from '@/app/lib/types';
import { useEffect, useRef, useState } from 'react';
import { getMdxOutputComponents, toTextFieldId } from './MdxOutputComponents';

export function getMdxInputComponents(
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
    const defaultValue = lessonInputsFromDB
      ? (lessonInputsFromDB[fieldId] as string) || ''
      : '';
    const fieldRef = useRef<HTMLTextAreaElement>(null);
    const [value, setValue] = useState(defaultValue);

    // useEffect(() => {
    //   setValue(localStorage.getItem(`ilayda.${fieldId}`) || '');
    // }, [name, fieldId]);

    // const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    //   const newValue = e.target.value;
    //   localStorage.setItem(`ilayda.${fieldId}`, newValue);
    //   setValue(newValue);
    //   setInputSize(e.target.value.length || name.length);
    // };
    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value;
      localStorage.setItem(`ilayda.${fieldId}`, newValue);
      setValue(newValue);
    };

    useEffect(() => {
      if (fieldRef.current) {
        fieldRef.current.style.height = fieldRef.current.scrollHeight + 'px'; // Fit the textarea to its content
      }
      // const lineBreaks = value.split('\n').length;
      // setRows(lineBreaks >= 1 ? lineBreaks : 1);
    }, [value]);

    return (
      <textarea
        id={fieldId}
        name={fieldId}
        value={value}
        ref={fieldRef}
        onChange={handleChange}
        className='mt-1 block w-full rounded-md border border-slate-300 bg-white pl-2 pr-1 font-mono placeholder-zinc-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500'
        placeholder={placeholder ?? name}
        rows={1}
        required
        wrap='hard'
      />
    );
  }

  return {
    ...getMdxOutputComponents(lessonInputsFromDB),
    I_TEXT,
  };
}
