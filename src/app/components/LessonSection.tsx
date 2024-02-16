'use client';

import {
  updateUserInputsByLessonId,
  updateUserOutputByLessonId as updateUserOutputsByLessonId,
} from '@/app/actions';
import { MDXRemote, MDXRemoteSerializeResult } from 'next-mdx-remote';
import { useEffect, useRef, useState, useTransition } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { JsonObject, Lesson, UpdateUserInputFormState } from '@/app/lib/types';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowsRotate } from '@fortawesome/free-solid-svg-icons';
import { renderToStaticMarkup } from 'react-dom/server';
import { getMdxInputComponents } from '@/app/components/MdxInputComponents';
import { getMdxOutputComponents } from './MdxOutputComponents';

const LessonButtons = ({
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

const CleanOutputMessage = () => {
  return (
    <span>
      {
        'Please fill out all fields in playground, then click "SUBMIT" button to see the outputs'
      }
    </span>
  );
};

const FormButtons = ({
  lessonCompleted,
  isPendingOutputGeneration,
  resetForm: resetInputs,
}: {
  lessonCompleted: boolean;
  isPendingOutputGeneration: boolean;
  resetForm: () => void;
}) => {
  const status = useFormStatus();

  return (
    <>
      <div className='bottom-0 left-0 flex w-full justify-start space-x-2   p-2'>
        <button
          type='submit'
          aria-disabled={status.pending}
          disabled={status.pending || isPendingOutputGeneration}
          className='rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700 disabled:bg-blue-300'
        >
          Submit
        </button>
        <button
          type='reset'
          value='reset'
          aria-disabled={status.pending}
          disabled={status.pending || !lessonCompleted}
          onClick={resetInputs}
          className='rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700 disabled:bg-blue-300'
        >
          <FontAwesomeIcon icon={faArrowsRotate} />
        </button>
      </div>
    </>
  );
};

export default function LessonSections({
  lesson,
  mdxInputSource,
  mdxOutputSource,
  lessonInputsFromDB,
  lessonOutputfromDB,
}: {
  lesson: Lesson;
  mdxInputSource: MDXRemoteSerializeResult;
  mdxOutputSource: MDXRemoteSerializeResult;
  lessonInputsFromDB: JsonObject | null;
  lessonOutputfromDB: string | null;
}) {
  const { id: lessonId, notionId } = lesson;
  const [loading, setLoading] = useState(true);
  const [lessonCompleted, setLessonCompleted] = useState(
    lessonOutputfromDB !== null
  );
  const [formState, formAction] = useFormState(updateUserInputsByLessonId, {
    state: 'pending',
  } as UpdateUserInputFormState);
  const formRef = useRef<HTMLFormElement>(null);
  const [isPendingOutputGeneration, startTransition] = useTransition();
  const [outputHTML, setOutputHTML] = useState(lessonOutputfromDB);
  const [clearInputs, setClearInputs] = useState(false);
  const lessonInputs = JSON.stringify(
    formState.data ?? lessonInputsFromDB ?? {}
  );
  const mdxInputComponents = getMdxInputComponents(
    clearInputs,
    JSON.parse(lessonInputs)
  );

  const resetForm = () => {
    setClearInputs(true);
  };

  useEffect(() => {
    if (formState.state === 'success' || formState.state === 'noupdate') {
      setClearInputs(false);
      const lessonInputsJSON = JSON.parse(lessonInputs);
      startTransition(async () => {
        const generatedOutputHTML = renderToStaticMarkup(
          <MDXRemote
            {...mdxOutputSource}
            components={getMdxOutputComponents(lessonInputsJSON)}
          />
        );
        const updatedOutputHTML = await updateUserOutputsByLessonId(
          generatedOutputHTML,
          lessonId
        );
        setOutputHTML(updatedOutputHTML);
        setLessonCompleted(true);
      });
    }
    setLoading(false);
  }, [formState.state, lessonInputs, mdxOutputSource, lessonId]);

  return (
    <>
      <form
        action={formAction}
        ref={formRef}
        className='prose flex flex-grow flex-col overflow-auto bg-white text-sm'
      >
        <div className='flex-grow overflow-auto p-4'>
          {loading ? (
            'Loading playground...'
          ) : (
            <MDXRemote {...mdxInputSource} components={mdxInputComponents} />
          )}
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
          <FormButtons
            lessonCompleted={lessonCompleted}
            resetForm={resetForm}
            isPendingOutputGeneration={isPendingOutputGeneration}
          />
        </div>
      </form>
      <div className='prose flex flex-grow flex-col overflow-auto bg-sky-50 text-sm'>
        <div className='flex-grow overflow-auto p-4 text-sm'>
          {isPendingOutputGeneration ? (
            'Generating awesome results!!!'
          ) : outputHTML ? (
            <div dangerouslySetInnerHTML={{ __html: outputHTML }} />
          ) : (
            <CleanOutputMessage />
          )}
        </div>
      </div>

      <footer className='col-span-3 grid grid-cols-3 p-2'>
        <div></div>
        <div className='flex items-center justify-center'>
          <span>{lesson.title}</span>
        </div>
        <div className='flex flex-grow justify-end gap-2'>
          <LessonButtons lesson={lesson} lessonCompleted={lessonCompleted} />
        </div>
      </footer>
    </>
  );
}
