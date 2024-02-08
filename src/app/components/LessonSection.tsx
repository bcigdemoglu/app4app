'use client';

import { updateForm } from '@/app/actions';
import { MDXRemote, MDXRemoteSerializeResult } from 'next-mdx-remote';
import { useEffect, useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { Lesson } from '../lib/data';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowsRotate } from '@fortawesome/free-solid-svg-icons';
import { createClient } from '../utils/supabase/client';
// import { renderToStaticMarkup, renderToString } from 'react-dom/server';

const toTextFieldId = (name: string) => `I_TEXT.${name}`;
function I_TEXT({ name, placeholder }: { name: string; placeholder: string }) {
  const fieldId = toTextFieldId(name);
  const [value, setValue] = useState('');

  useEffect(() => {
    setValue(localStorage.getItem(`ilayda.${fieldId}`) || '');
  }, [name, fieldId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    localStorage.setItem(`ilayda.${fieldId}`, newValue);
    setValue(newValue);
  };

  return (
    <input
      type='text'
      id={fieldId}
      name={fieldId}
      value={value}
      onChange={handleChange}
      // className='rounded-lg bg-yellow-200 pl-2 pr-1 text-blue-800 '
      className='mt-1 rounded-md border border-slate-300 bg-white pl-2 pr-1 placeholder-zinc-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 '
      size={Math.max(name.length, value.length)}
      placeholder={placeholder ?? name}
      required
    />
  );
}

function O_SUPERLONGTEXT() {
  return 'a '.repeat(2000);
}

function O_TEXT({ name }: { name: string }) {
  const fieldId = toTextFieldId(name);
  const [value, setValue] = useState('');

  useEffect(() => {
    setValue(localStorage.getItem(`ilayda.${fieldId}`) || '');
  }, [fieldId]);

  return <>{value}</>;
}

// Output components cannot contain input components.
const mdxOutputComponents = { O_TEXT, O_SUPERLONGTEXT };
// All output components are available to the input components as well.
const mdxInputComponents = {
  ...mdxOutputComponents,
  I_TEXT: I_TEXT.bind(null),
};

const LessonButton = ({
  lesson,
  lessonCompleted,
}: {
  lesson: Lesson;
  lessonCompleted: boolean;
}) => {
  const firstLessonLink = `/playground/1`;
  const prevLesson = lesson.prev;
  const prevLessonLink = `/playground/${prevLesson}`;
  const nextLesson = lesson.next;
  const nextLessonLink = `/playground/${nextLesson}`;

  return (
    <>
      <button
        disabled={!lessonCompleted}
        className='rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700 disabled:bg-blue-300'
      >
        Export
      </button>
      <Link href={prevLessonLink}>
        <button
          className='rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700 disabled:bg-blue-300'
          disabled={!prevLesson}
        >
          Back
        </button>
      </Link>
      {nextLesson ? (
        <Link href={nextLessonLink}>
          <button
            className='rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700 disabled:bg-blue-300'
            disabled={!lessonCompleted}
          >
            Next
          </button>
        </Link>
      ) : (
        <Link href={firstLessonLink}>
          <button className='rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700 disabled:bg-blue-300'>
            Return to beginning
          </button>
        </Link>
      )}
    </>
  );
};

export default function LessonSections({
  lesson,
  mdxInputSource,
  mdxOutputSource,
}: {
  lesson: Lesson;
  mdxInputSource: MDXRemoteSerializeResult;
  mdxOutputSource: MDXRemoteSerializeResult;
}) {
  const supabase = createClient();

  // const [user, setUser] = useState<User | null>(null);
  const { id: lessonId, notionId } = lesson;
  const [loading, setLoading] = useState(true);
  const [inputsReady, setInputsReady] = useState(false);
  const [lessonCompleted, setLessonCompleted] = useState(false);
  const initialFormState = { invalidFields: ['all'] };
  const [formState, formAction] = useFormState(updateForm, initialFormState);
  const status = useFormStatus();
  const outputJsx = (
    <span id='mdxoutput'>
      <MDXRemote {...mdxInputSource} components={mdxInputComponents} />
    </span>
  );

  const resetInputs = () => {
    setInputsReady(false);
    setLessonCompleted(false);
  };

  useEffect(() => {
    supabase.auth.getUser().then(({ data: user }) => {
      console.log(user);
      // setUser(user.user);
    });

    // console.log(JSON.stringify(outputJsx.type.name));

    if (formState.invalidFields.length === 0) {
      setInputsReady(true);
      setLessonCompleted(true);
    }
    setLoading(false);
  }, [formState.invalidFields]);

  return (
    <>
      <form
        action={formAction}
        className='prose flex flex-grow flex-col overflow-auto bg-white text-sm'
      >
        <div className='flex-grow overflow-auto p-4'>
          {loading ? 'Loading playground...' : outputJsx}
        </div>
        <input
          type='hidden'
          readOnly={true}
          name='lesson_id'
          value={lessonId}
        />
        <input
          type='hidden'
          readOnly={true}
          name='notion_id'
          value={notionId}
        />
        <div className='bottom-0 left-0 flex w-full justify-start space-x-2   p-2'>
          <button
            type='submit'
            aria-disabled={status.pending}
            disabled={status.pending}
            className='rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700 disabled:bg-blue-300'
          >
            Submit
          </button>
          <button
            type='reset'
            aria-disabled={status.pending}
            disabled={status.pending}
            onClick={resetInputs}
            className='rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700 disabled:bg-blue-300'
          >
            <FontAwesomeIcon icon={faArrowsRotate} />
          </button>
        </div>
      </form>
      <div className='prose flex flex-grow flex-col overflow-auto bg-sky-50 text-sm'>
        <div className='flex-grow overflow-auto p-4 text-sm'>
          {inputsReady ? (
            <MDXRemote {...mdxOutputSource} components={mdxOutputComponents} />
          ) : (
            <span>
              {
                'Please fill out all fields in playground, then click `SUBMIT` to see the outputs'
              }
            </span>
          )}
        </div>
      </div>

      <footer className='col-span-3 grid grid-cols-3 p-2'>
        <div></div>
        <div className='flex items-center justify-center'>
          <span>{lesson.title}</span>
        </div>
        <div className='flex flex-grow justify-end gap-2'>
          <LessonButton lesson={lesson} lessonCompleted={lessonCompleted} />
        </div>
      </footer>
    </>
  );
}
