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
import dynamic from 'next/dynamic';
import { AI_MODAL_PARAM, CREATOR_MODAL_PARAM } from '@/lib/data';
import { useRouter } from 'next/navigation';
import NotionPage from './NotionPage';
import { ExtendedRecordMap } from 'notion-types';
import { cn } from '@/utils/cn';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faAngleLeft,
  faAngleRight,
  faAnglesLeft,
  faAnglesRight,
  faChalkboardUser,
  faCloudArrowDown,
  faCommentDots,
  faTrashCan,
} from '@fortawesome/free-solid-svg-icons';

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

const ProgressBar = ({
  section,
  totalSections,
}: {
  section: number;
  totalSections: number;
}) => {
  return (
    <div className='w-full bg-sky-200 text-center'>
      <div
        className='text-nowrap bg-green-600 p-0.5 text-center font-medium leading-none text-white'
        style={{ width: `${(section / totalSections) * 100}%` }}
      >
        {section} / {totalSections}
      </div>
    </div>
  );
};

const FeedbackButtons = () => {
  return (
    <>
      <Link href={`?${CREATOR_MODAL_PARAM}=true`}>
        <button className='rounded bg-green-500 px-4 py-2 font-bold text-white hover:bg-green-700 disabled:bg-green-300'>
          <>
            Give Feedback <FontAwesomeIcon icon={faCommentDots} />
          </>
        </button>
      </Link>
      <Link href={`?${AI_MODAL_PARAM}=true`}>
        <button className='rounded bg-orange-600 px-4 py-2 font-bold text-white hover:bg-orange-800 disabled:bg-orange-400'>
          <>
            Ask AI <FontAwesomeIcon icon={faChalkboardUser} />
          </>
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
  isExporting,
}: {
  prevSectionLink: string | null;
  nextSectionLink: string | null;
  sectionCompleted: boolean;
  prevLessonLink: string | null;
  nextLessonLink: string | null;
  lessonCompleted: boolean;
  onExportOutput: () => void;
  isExporting: boolean;
}) => {
  return (
    <>
      <button
        disabled={!sectionCompleted || isExporting}
        onClick={onExportOutput}
        className='rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700 disabled:bg-blue-300'
      >
        {!isExporting ? (
          <FontAwesomeIcon icon={faCloudArrowDown} />
        ) : (
          'Exporting...'
        )}
      </button>
      {prevSectionLink && (
        <Link href={prevSectionLink}>
          <button className='rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700 disabled:bg-blue-300'>
            <FontAwesomeIcon icon={faAngleLeft} />
          </button>
        </Link>
      )}
      {!prevSectionLink && prevLessonLink && (
        <Link href={prevLessonLink}>
          <button
            className='rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700 disabled:bg-blue-300'
            disabled={!prevLessonLink}
          >
            <FontAwesomeIcon icon={faAnglesLeft} />
          </button>
        </Link>
      )}
      {nextSectionLink && (
        <Link href={nextSectionLink}>
          <button
            disabled={!sectionCompleted}
            className='rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700 disabled:bg-blue-300'
          >
            <FontAwesomeIcon icon={faAngleRight} />
          </button>
        </Link>
      )}
      {!nextSectionLink && nextLessonLink && (
        <Link href={nextLessonLink}>
          <button
            className='rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700 disabled:bg-blue-300'
            disabled={!lessonCompleted}
          >
            <FontAwesomeIcon icon={faAnglesRight} />
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
  isGeneratingOutput,
  resetForm,
}: {
  courseId: string;
  lessonId: string;
  sectionCompleted: boolean;
  isGeneratingOutput: boolean;
  resetForm: () => void;
}) => {
  const status = useFormStatus();
  const [isRestatingLesson, startRestarting] = useTransition();
  const formButtonsDisabled =
    status.pending || isGeneratingOutput || isRestatingLesson;

  return (
    <>
      <button
        type='submit'
        aria-disabled={formButtonsDisabled}
        disabled={formButtonsDisabled}
        className='rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700 disabled:bg-blue-300'
      >
        {status.pending ? 'Submitting...' : 'Submit'}
      </button>
      <button
        type='reset'
        value='reset'
        aria-disabled={formButtonsDisabled}
        disabled={formButtonsDisabled}
        onClick={resetForm}
        className='rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700 disabled:bg-blue-300'
      >
        Clear
      </button>
      <button
        type='reset'
        onClick={() =>
          startRestarting(async () => {
            resetForm();
            await deleteUserDataByLessonId(courseId, lessonId);
          })
        }
        aria-disabled={status.pending}
        disabled={formButtonsDisabled || !sectionCompleted}
        className='rounded bg-red-500 px-4 py-2 font-bold text-white hover:bg-red-700 disabled:bg-red-300'
      >
        {isRestatingLesson ? (
          'Restarting...'
        ) : (
          <>
            <FontAwesomeIcon icon={faTrashCan} />
          </>
        )}
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
  lessonInputsFromDB,
  lessonOutputfromDB,
  lastCompletedSectionFromDB,
  MdxOutput,
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
  lessonInputsFromDB: JsonObject | null;
  lessonOutputfromDB: string | null;
  lastCompletedSectionFromDB: number | null;
  MdxOutput: JSX.Element | null;
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
  const [isGeneratingOutput, startGeneratingOutput] = useTransition();

  const [clearInputs, setClearInputs] = useState(false);

  const [isExporting, startExporting] = useTransition();
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState(
    finalSection && sectionCompleted
      ? 2 // Completed final section displays output
      : section > 1
        ? 1 // Section greater than 1 displays input
        : 0 // First section displays lesson
  );

  function onExportOutput() {
    startExporting(async () => {
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
    if (
      (formState.state === 'success' || formState.state === 'noupdate') &&
      MdxOutput !== null
    ) {
      startGeneratingOutput(async () => {
        const renderedOutputHTML = renderToStaticMarkup(MdxOutput);
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
        // Select output tab after successful form submission
        setSelectedTab(2);
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
    MdxOutput,
    courseId,
    lessonId,
    section,
    totalSections,
  ]);

  return (
    <>
      <div className='z-50 col-span-3 mt-[-1rem] flex h-min translate-y-4 justify-center gap-2 md:hidden'>
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
          'col-span-3 flex flex-col overflow-auto bg-white md:col-span-1',
          {
            'hidden md:flex': selectedTab !== 0,
          }
        )}
      >
        <div className='h-screen flex-grow overflow-auto'>
          <NotionPage recordMap={recordMap}></NotionPage>
        </div>
      </div>
      <form
        action={formAction}
        ref={formRef}
        className={cn(
          'col-span-3 flex flex-grow flex-col overflow-auto bg-white text-xs md:col-span-1 md:text-sm ',
          {
            'hidden md:flex': selectedTab !== 1,
          }
        )}
      >
        <div className='prose h-screen flex-grow overflow-auto p-4'>
          {loading ? (
            'Loading playground...'
          ) : (
            <MDXRemote
              {...mdxInputSource}
              components={getMdxInputComponents(
                clearInputs,
                JSON.parse(lessonInputs)
              )}
            />
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
        <div className=''>
          <ProgressBar section={section} totalSections={totalSections} />
        </div>
        <div className='bottom-0 left-0 flex w-full justify-center space-x-2 bg-sky-100 pt-1 md:justify-start md:pt-2'>
          <FormButtons
            courseId={courseId}
            lessonId={lessonId}
            sectionCompleted={sectionCompleted}
            resetForm={resetForm}
            isGeneratingOutput={isGeneratingOutput}
          />
        </div>
      </form>
      <div
        className={cn(
          'relative col-span-3 flex flex-grow flex-col overflow-auto bg-sky-50 text-sm md:col-span-1',
          {
            'hidden md:flex': selectedTab !== 2,
          }
        )}
      >
        {!isGeneratingOutput && outputHTML && completionConfetti ? (
          <DynamicConfetti />
        ) : null}
        <div className='hidden'>{MdxOutput}</div>
        <div className='h-screen flex-grow overflow-auto p-4'>
          {isGeneratingOutput ? (
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

      <footer className='col-span-3 grid grid-cols-3 gap-1 p-2 pt-0 md:grid-cols-5 md:gap-2'>
        <div
          className={cn(
            'col-span-3 flex flex-grow justify-center gap-2 md:col-span-2 md:justify-start',
            {
              'hidden md:flex': selectedTab === 1, // Hide feedback buttons when input tab is selected
            }
          )}
        >
          <FeedbackButtons />
        </div>
        <div className='hidden items-center gap-1 md:flex md:justify-center'>
          {/* {lessonCompleted ? <span>✅</span> : <span>🟦</span>} */}
          <span>{lesson.title}</span>
        </div>
        <div className='col-span-3 flex flex-grow justify-center gap-2 md:col-span-2 md:justify-end'>
          <LessonButtons
            sectionCompleted={sectionCompleted}
            prevSectionLink={prevSectionLink}
            nextSectionLink={nextSectionLink}
            lessonCompleted={lessonCompleted}
            prevLessonLink={prevLessonLink}
            nextLessonLink={nextLessonLink}
            onExportOutput={onExportOutput}
            isExporting={isExporting}
          />
        </div>
      </footer>
    </>
  );
}
