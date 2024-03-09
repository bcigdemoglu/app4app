'use client';

import {
  deleteUserDataByLessonId,
  exportUserOutput,
  updateUserInputsByLessonId,
  updateUserOutputByLessonId as updateUserOutputsByLessonId,
} from '@/app/actions';
import { MDXRemote, MDXRemoteSerializeResult } from 'next-mdx-remote';
import { useEffect, useRef, useState, useTransition } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { JsonObject, Lesson, UpdateUserInputFormState } from '@/lib/types';
import Link from 'next/link';
import { renderToStaticMarkup } from 'react-dom/server';
import { getMdxInputComponents } from '@/components/MdxInputComponents';
import { getMdxOutputComponents } from './MdxOutputComponents';
import dynamic from 'next/dynamic';
import { AI_MODAL_PARAM, CREATOR_MODAL_PARAM } from '@/lib/data';
import { useRouter } from 'next/navigation';
import NotionPage from './NotionPage';
import { ExtendedRecordMap } from 'notion-types';
import { cn } from '@/utils/cn';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashCan } from '@fortawesome/free-solid-svg-icons';

function hashString(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
  }
  return hash;
}

const DynamicConfetti = dynamic(() =>
  import('@/components/Confetti').then((m) => m.Confetti)
);

const FeedbackButtons = ({ lessonCompleted }: { lessonCompleted: boolean }) => {
  return (
    <>
      <Link href={`?${CREATOR_MODAL_PARAM}=true`}>
        <button className='rounded bg-green-500 px-4 py-2 font-bold text-white hover:bg-green-700 disabled:bg-green-300'>
          Share Feedback 📣
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
  courseId,
  lessonId,
  sectionCompleted,
  isPendingOutputGeneration,
  resetForm,
}: {
  courseId: string;
  lessonId: string;
  sectionCompleted: boolean;
  isPendingOutputGeneration: boolean;
  resetForm: () => void;
}) => {
  const status = useFormStatus();

  return (
    <>
      <button
        type='submit'
        aria-disabled={status.pending}
        disabled={status.pending || isPendingOutputGeneration}
        className='rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700 disabled:bg-blue-300'
      >
        {status.pending
          ? 'Submitting...'
          : isPendingOutputGeneration
            ? 'Generating...'
            : 'Submit'}
      </button>
      <button
        type='reset'
        value='reset'
        aria-disabled={status.pending}
        disabled={status.pending || isPendingOutputGeneration}
        onClick={resetForm}
        className='rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700 disabled:bg-blue-300'
      >
        Clear
      </button>
      <button
        type='reset'
        onClick={async () => {
          resetForm();
          return deleteUserDataByLessonId(courseId, lessonId);
        }}
        aria-disabled={status.pending}
        disabled={
          status.pending || isPendingOutputGeneration || !sectionCompleted
        }
        className='rounded bg-red-500 px-4 py-2 font-bold text-white hover:bg-red-700 disabled:bg-red-300'
      >
        <FontAwesomeIcon icon={faTrashCan} /> Restart Lesson
      </button>
    </>
  );
};

export default function LessonIO({
  recordMap,
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
  recordMap: ExtendedRecordMap;
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
  lastCompletedSectionFromDB: number | null;
}) {
  const { id: lessonId, notionId } = lesson;
  const outputHTML = lessonOutputfromDB;
  const sectionCompleted =
    outputHTML !== null &&
    lastCompletedSectionFromDB !== null &&
    section <= lastCompletedSectionFromDB;
  const finalSection = section === totalSections;
  const lessonCompleted = sectionCompleted && finalSection;
  const completionConfetti = finalSection && lessonCompleted;

  const [loading, setLoading] = useState(true);
  const [formState, formAction] = useFormState(updateUserInputsByLessonId, {
    state: 'pending',
  } as UpdateUserInputFormState);
  const lessonInputs = JSON.stringify(
    formState.data ?? lessonInputsFromDB ?? {}
  );
  const formRef = useRef<HTMLFormElement>(null);
  const [isPendingOutputGeneration, startTransition] = useTransition();

  const [clearInputs, setClearInputs] = useState(false);

  const [isExporting, startExportTransition] = useTransition();
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState(0);

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
        router.push(`/playground/output/${exportedOutputId}`);
      }
    });
  }

  const mdxInputComponents = getMdxInputComponents(
    clearInputs,
    JSON.parse(lessonInputs)
  );

  const resetForm = () => {
    formRef.current?.reset();
    setClearInputs(true);
    for (const key in localStorage) {
      if (key.startsWith('ilayda.')) {
        localStorage.removeItem(key);
      }
    }
  };

  console.log(
    'Rendering page: formState.state',
    formState.state,
    'current outputHTML',
    hashString(outputHTML ?? '')
  );

  useEffect(() => {
    if (formState.state === 'success' || formState.state === 'noupdate') {
      startTransition(async () => {
        const lessonInputsJSON = JSON.parse(lessonInputs);
        const renderedOutputHTML = renderToStaticMarkup(
          <MDXRemote
            compiledSource={mdxOutputSource.compiledSource}
            scope={null}
            frontmatter={null}
            components={getMdxOutputComponents(lessonInputsJSON)}
          />
        );
        console.log(
          'Sending form data... ',
          'new outputHTML',
          hashString(renderedOutputHTML)
        );
        setClearInputs(false);
        await updateUserOutputsByLessonId(
          courseId,
          lessonId,
          renderedOutputHTML
        );
        console.log(
          'Sent form data! ',
          'new outputHTML',
          hashString(renderedOutputHTML)
        );
      });
    }
    setLoading(false);
  }, [
    formState.state,
    lessonInputs,
    mdxOutputSource.compiledSource,
    courseId,
    lessonId,
    section,
    totalSections,
  ]);

  return (
    <>
      <div className='col-span-3 flex justify-center gap-2 md:hidden'>
        <button
          onClick={() => setSelectedTab(0)}
          className={cn('rounded bg-blue-300 px-4 py-1 font-bold text-white', {
            'bg-blue-700': selectedTab === 0,
          })}
        >
          Lesson
        </button>
        <button
          onClick={() => setSelectedTab(1)}
          className={cn('rounded bg-blue-300 px-4 py-1 font-bold text-white', {
            'bg-blue-700': selectedTab === 1,
          })}
        >
          Input
        </button>
        <button
          onClick={() => setSelectedTab(2)}
          className={cn('rounded bg-blue-300 px-4 py-1 font-bold text-white', {
            'bg-blue-700': selectedTab === 2,
          })}
        >
          Output
        </button>
      </div>
      <div
        className={cn(
          'col-span-3  flex flex-col overflow-auto bg-white md:col-span-1',
          {
            'hidden md:flex': selectedTab !== 0,
          }
        )}
      >
        <div className='flex-grow overflow-auto '>
          <NotionPage recordMap={recordMap}></NotionPage>
        </div>
      </div>
      <form
        action={formAction}
        ref={formRef}
        className={cn(
          'col-span-3  flex flex-grow flex-col overflow-auto bg-white text-xs md:col-span-1 md:text-sm ',
          {
            'hidden md:flex': selectedTab !== 1,
          }
        )}
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
          name='notion_id'
          value={notionId}
        />
        <input
          type='hidden'
          readOnly={true}
          name='course_id'
          value={courseId}
        />
        <input
          type='hidden'
          readOnly={true}
          name='lesson_id'
          value={lessonId}
        />
        <input type='hidden' readOnly={true} name='section' value={section} />
        <div className='p-2 pb-0'>
          <div className='w-full rounded-full bg-gray-200 text-center'>
            <div
              className='text-nowrap rounded-full bg-green-600 p-0.5  text-center font-medium leading-none text-white'
              style={{ width: `${(section / totalSections) * 100}%` }}
            >
              {section} / {totalSections}
            </div>
          </div>
        </div>
        <div className='bottom-0 left-0 flex w-full justify-evenly space-x-2 p-2 md:justify-start'>
          <FormButtons
            courseId={courseId}
            lessonId={lessonId}
            sectionCompleted={sectionCompleted}
            resetForm={resetForm}
            isPendingOutputGeneration={isPendingOutputGeneration}
          />
        </div>
      </form>
      <div
        className={cn(
          'relative col-span-3 flex flex-grow flex-col overflow-auto bg-sky-50 text-xs md:col-span-1 md:text-sm',
          {
            'hidden md:flex': selectedTab !== 2,
          }
        )}
      >
        {!isPendingOutputGeneration && outputHTML && completionConfetti && (
          <DynamicConfetti />
        )}
        <div className='flex-grow overflow-auto p-4'>
          {isPendingOutputGeneration ? (
            'Generating awesome results!!!'
          ) : outputHTML ? (
            <div
              className='prose'
              dangerouslySetInnerHTML={{ __html: outputHTML }}
            />
          ) : (
            <CleanOutputMessage />
          )}
        </div>
      </div>

      <footer className='col-span-3 grid grid-cols-3 gap-2 p-2 md:grid-cols-5'>
        <div className='col-span-3 flex flex-grow justify-evenly gap-2 md:col-span-2 md:justify-start'>
          <FeedbackButtons lessonCompleted={lessonCompleted} />
        </div>
        <div className='hidden items-center gap-1 md:flex md:justify-center'>
          {lessonCompleted ? <span>✅</span> : <span>🟦</span>}
          <span>{lesson.title}</span>
        </div>
        <div className='col-span-3 flex flex-grow justify-evenly gap-2 md:col-span-2 md:justify-end'>
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
