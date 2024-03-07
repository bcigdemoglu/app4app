'use client';

import {
  exportUserOutput,
  updateUserInputsByLessonId,
  updateUserOutputByLessonId as updateUserOutputsByLessonId,
} from '@/app/actions';
import { MDXRemote, MDXRemoteSerializeResult } from 'next-mdx-remote';
import { useEffect, useMemo, useRef, useState, useTransition } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { JsonObject, Lesson, UpdateUserInputFormState } from '@/app/lib/types';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowsRotate } from '@fortawesome/free-solid-svg-icons';
import { renderToStaticMarkup } from 'react-dom/server';
import { getMdxInputComponents } from '@/app/components/MdxInputComponents';
import { getMdxOutputComponents } from './MdxOutputComponents';
import dynamic from 'next/dynamic';
import { AI_MODAL_PARAM, CREATOR_MODAL_PARAM } from '@/app/lib/data';
import { useRouter } from 'next/navigation';

const DynamicConfetti = dynamic(() =>
  import('@/app/components/Confetti').then((m) => m.Confetti)
);

const FeedbackButtons = ({ lessonCompleted }: { lessonCompleted: boolean }) => {
  return (
    <>
      <Link href={`?${CREATOR_MODAL_PARAM}=true`}>
        <button className='rounded bg-green-500 px-4 py-2 font-bold text-white hover:bg-green-700 disabled:bg-green-300'>
          Share Course Feedback 📣
        </button>
      </Link>
      <Link href={`?${AI_MODAL_PARAM}=true`}>
        <button
          disabled={!lessonCompleted}
          className='rounded bg-purple-500 px-4 py-2 font-bold text-white hover:bg-purple-700 disabled:bg-purple-300'
        >
          Ask AI Coach 🤖
        </button>
      </Link>
    </>
  );
};

const LessonButtons = ({
  prevSectionLink,
  sectionCompleted,
  nextSectionLink,
  prevLessonLink,
  lessonCompleted,
  nextLessonLink,
  onExportOutput,
}: {
  prevSectionLink: string | null;
  nextSectionLink: string | null;
  sectionCompleted: boolean;
  prevLessonLink: string | null;
  nextLessonLink: string | null;
  lessonCompleted: boolean;
  onExportOutput: () => void;
}) => {
  return (
    <>
      <button
        disabled={!lessonCompleted}
        onClick={onExportOutput}
        className='rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700 disabled:bg-blue-300'
      >
        Export & Share
      </button>
      {prevSectionLink && (
        <Link href={prevSectionLink}>
          <button className='rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700 disabled:bg-blue-300'>
            Back
          </button>
        </Link>
      )}
      {!prevSectionLink && prevLessonLink && (
        <Link href={prevLessonLink}>
          <button
            className='rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700 disabled:bg-blue-300'
            disabled={!prevLessonLink}
          >
            Back
          </button>
        </Link>
      )}
      {nextSectionLink && (
        <Link href={nextSectionLink}>
          <button
            disabled={!sectionCompleted}
            className='rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700 disabled:bg-blue-300'
          >
            Next Section
          </button>
        </Link>
      )}
      {!nextSectionLink && nextLessonLink && (
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
  sectionCompleted,
  isPendingOutputGeneration,
  resetForm,
}: {
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
      </div>
    </>
  );
};

export default function LessonIO({
  courseId,
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
  courseId: string;
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
    lessonOutputfromDB !== null && lastCompletedSectionFromDB === totalSections
  );
  const [completionConfetti, setCompletionConfetti] = useState(false);
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
  const [isExporting, startExportTransition] = useTransition();
  const router = useRouter();

  function onExportOutput() {
    startExportTransition(async () => {
      if (outputHTML) {
        console.log('Exporting output...');
        const { id: exportedOutputId } = await exportUserOutput(
          outputHTML,
          courseId,
          lessonId,
          true
        );
        console.log('Exported output...', isExporting);
        // Construct the URL

        router.push(`/playground/output/${exportedOutputId}`);

        // const domain = window.location.hostname;
        // const port = window.location.port;
        // const url = new URL(
        //   `/playground/output/${exportedOutputId}`,
        //   `https://${domain}:${port}`
        // );
        // const newWindow = window.open(url, '_blank');
        // console.log('Opened new window...', newWindow);
      }
    });
  }

  const mdxInputComponents = getMdxInputComponents(
    clearInputs,
    JSON.parse(lessonInputs)
  );

  const resetForm = () => {
    setClearInputs(true);
  };

  // console.log('Rendering all: formState.state', formState.state);

  useEffect(() => {
    if (formState.state === 'success' || formState.state === 'noupdate') {
      // console.log('Creating generatedOutputHTML...', formState.state);
      const lessonInputsJSON = JSON.parse(lessonInputs);
      const generatedOutputHTML = renderToStaticMarkup(
        <MDXRemote
          compiledSource={mdxOutputSource.compiledSource}
          scope={mdxOutputSource.scope}
          frontmatter={mdxOutputSource.frontmatter}
          components={getMdxOutputComponents(lessonInputsJSON)}
        />
      );
      setOutputHTML(generatedOutputHTML);
    }
  }, [
    formState.state,
    mdxOutputSource.compiledSource,
    mdxOutputSource.scope,
    mdxOutputSource.frontmatter,
    lessonInputs,
  ]);

  useEffect(() => {
    if (
      (formState.state === 'success' || formState.state === 'noupdate') &&
      outputHTML
    ) {
      // console.log('Sending form data...');
      setClearInputs(false);
      startTransition(async () => {
        await updateUserOutputsByLessonId(outputHTML, lessonId);
        setSectionCompleted(true);
        if (section === totalSections) {
          // If all sections are completed, set lesson completed
          setLessonCompleted(true);
          // If first time completing lesson, set confetti
          setCompletionConfetti(true);
        }
      });
    }
    setLoading(false);
  }, [formState.state, outputHTML, lessonId, section, totalSections]);

  return (
    <>
      <form
        action={formAction}
        ref={formRef}
        className='flex flex-grow flex-col overflow-auto bg-white text-sm'
      >
        <div className='prose flex-grow overflow-auto p-4'>
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
        <input
          type='hidden'
          readOnly={true}
          name='ai_feedback'
          value={lessonInputs}
        />
        {/* <Line
          percent={(section / totalSections) * 100}
          strokeWidth={3}
          trailWidth={3}
          strokeLinecap='round'
          strokeColor='green'
        /> */}
        <div className='w-full rounded-full bg-gray-200'>
          <div
            className='rounded-full bg-green-600 p-0.5 text-center  font-medium leading-none text-white'
            style={{ width: `${(section / totalSections) * 100}%` }}
          >
            {section} / {totalSections}
          </div>
        </div>
        <div className='bottom-0 left-0 flex w-full justify-start space-x-2 p-2'>
          <FormButtons
            sectionCompleted={sectionCompleted}
            resetForm={resetForm}
            isPendingOutputGeneration={isPendingOutputGeneration}
          />
        </div>
      </form>
      <div className='relative flex flex-grow flex-col overflow-auto bg-sky-50 text-sm'>
        {!isPendingOutputGeneration && outputHTML && completionConfetti && (
          <DynamicConfetti />
        )}
        <div className='flex-grow overflow-auto p-4 text-sm'>
          {isPendingOutputGeneration ? (
            'Generating awesome results!!!'
          ) : outputHTML ? (
            <div>
              <div
                className='prose'
                dangerouslySetInnerHTML={{ __html: outputHTML }}
              />
            </div>
          ) : (
            <CleanOutputMessage />
          )}
        </div>
      </div>

      <footer className='col-span-3 grid grid-cols-5 p-2'>
        <div className='col-span-2 flex flex-grow justify-start gap-2'>
          <FeedbackButtons lessonCompleted={lessonCompleted} />
        </div>
        <div className='flex items-center justify-center gap-1'>
          {lessonCompleted ? <span>✅</span> : <span>🟦</span>}
          <span>{lesson.title}</span>
        </div>
        <div className='col-span-2 flex flex-grow justify-end gap-2'>
          <LessonButtons
            sectionCompleted={sectionCompleted}
            prevSectionLink={prevSectionLink}
            nextSectionLink={nextSectionLink}
            lessonCompleted={lessonCompleted}
            prevLessonLink={prevLessonLink}
            nextLessonLink={nextLessonLink}
            onExportOutput={onExportOutput}
          />
        </div>
      </footer>
    </>
  );
}
