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
  lessonCompleted,
  prevLessonLink,
  nextLessonLink,
}: {
  lessonCompleted: boolean;
  prevLessonLink: string | null;
  nextLessonLink: string | null;
}) => {
  return (
    <>
      <button
        disabled={!lessonCompleted}
        className='rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700 disabled:bg-blue-300'
      >
        Export
      </button>
      {prevLessonLink && (
        <Link href={prevLessonLink}>
          <button
            className='rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700 disabled:bg-blue-300'
            disabled={!prevLessonLink}
          >
            Previous Lesson
          </button>
        </Link>
      )}
      {nextLessonLink && (
        <Link href={nextLessonLink}>
          <button
            className='rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700 disabled:bg-blue-300'
            disabled={!lessonCompleted}
          >
            Next Lesson
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
  prevSectionLink,
  nextSectionLink,
  sectionCompleted,
  isPendingOutputGeneration,
  resetForm,
}: {
  prevSectionLink: string | null;
  nextSectionLink: string | null;
  sectionCompleted: boolean;
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
          disabled={
            status.pending || isPendingOutputGeneration || !sectionCompleted
          }
          onClick={resetForm}
          className='rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700 disabled:bg-blue-300'
        >
          <FontAwesomeIcon icon={faArrowsRotate} />
        </button>

        {prevSectionLink && (
          <Link href={prevSectionLink}>
            <button
              aria-disabled={status.pending}
              disabled={status.pending || isPendingOutputGeneration}
              className='rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700 disabled:bg-blue-300'
            >
              Previous Section
            </button>
          </Link>
        )}
        {nextSectionLink && (
          <Link href={nextSectionLink}>
            <button
              aria-disabled={status.pending}
              disabled={
                status.pending || isPendingOutputGeneration || !sectionCompleted
              }
              className='rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700 disabled:bg-blue-300'
            >
              Next Section
            </button>
          </Link>
        )}
      </div>
    </>
  );
};

export default function LessonIO({
  lesson,
  section,
  prevSectionLink,
  nextSectionLink,
  prevLessonLink,
  nextLessonLink,
  totalSections,
  mdxInputSource,
  mdxOutputSource,
  lessonInputsFromDB,
  lessonOutputfromDB,
  lastCompletedSectionFromDB,
}: {
  lesson: Lesson;
  section: number;
  prevSectionLink: string | null;
  nextSectionLink: string | null;
  prevLessonLink: string | null;
  nextLessonLink: string | null;
  totalSections: number;
  mdxInputSource: MDXRemoteSerializeResult;
  mdxOutputSource: MDXRemoteSerializeResult;
  lessonInputsFromDB: JsonObject | null;
  lessonOutputfromDB: string | null;
  lastCompletedSectionFromDB: number;
}) {
  const { id: lessonId, notionId } = lesson;
  const [loading, setLoading] = useState(true);
  const [sectionCompleted, setSectionCompleted] = useState(
    lessonOutputfromDB !== null && section <= lastCompletedSectionFromDB
  );
  const [lessonCompleted, setLessonCompleted] = useState(
    lessonOutputfromDB !== null && section === totalSections
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
        setSectionCompleted(true);
        // If all sections are completed, set lesson completed
        setLessonCompleted(section === totalSections);
      });
    }
    setLoading(false);
  }, [
    formState.state,
    lessonInputs,
    mdxOutputSource,
    lessonId,
    section,
    totalSections,
  ]);

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
        <input type='hidden' readOnly={true} name='section' value={section} />
        <input
          type='hidden'
          readOnly={true}
          name='notion_id'
          value={notionId}
        />
        <div className='bottom-0 left-0 flex w-full justify-start space-x-2   p-2'>
          <FormButtons
            prevSectionLink={prevSectionLink}
            nextSectionLink={nextSectionLink}
            sectionCompleted={sectionCompleted}
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
          <LessonButtons
            lessonCompleted={lessonCompleted}
            prevLessonLink={prevLessonLink}
            nextLessonLink={nextLessonLink}
          />
        </div>
      </footer>
    </>
  );
}
