'use client';

import {
  deleteUserDataByLessonId,
  exportUserOutput,
  updateUserInputsByLessonId,
  updateUserOutputByLessonId as updateUserOutputsByLessonId,
} from '@/app/actions';
import LessonCompletedAnimation from '@/components/LessonCompletedAnimation';
import LessonInputArea from '@/components/LessonInputArea';
import LoadingAnimation from '@/components/LoadingAnimation';
import NotionPage from '@/components/NotionPage';
import {
  AI_MODAL_PARAM,
  CREATOR_MODAL_PARAM,
  LESSON_END_PARAM,
  LESSON_START_PARAM,
  getLSPrefix,
} from '@/lib/data';
import {
  Course,
  JsonObject,
  Lesson,
  UpdateUserInputFormState,
  UserProgressForCourseFromDB,
} from '@/lib/types';
import { cn } from '@/utils/cn';
import { isDev } from '@/utils/debug';
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
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { MDXRemoteSerializeResult } from 'next-mdx-remote';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ExtendedRecordMap } from 'notion-types';
import converter from 'number-to-words';
import { useEffect, useRef, useState, useTransition } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { renderToStaticMarkup } from 'react-dom/server';

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
            Leave Feedback <FontAwesomeIcon icon={faCommentDots} />
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
  const searchParams = useSearchParams();
  const congrats = searchParams.get(LESSON_END_PARAM);
  const welcome = searchParams.get(LESSON_START_PARAM);

  return (
    <>
      <button
        id='export-output'
        disabled={!sectionCompleted || isExporting}
        onClick={onExportOutput}
        className={cn(
          'rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700 disabled:bg-blue-300',
          { 'animate-hue-background': congrats }
        )}
      >
        {!isExporting ? (
          <FontAwesomeIcon icon={faCloudArrowDown} />
        ) : (
          'Exporting...'
        )}
      </button>
      {prevSectionLink ? (
        <Link href={prevSectionLink}>
          <button
            id='prev-section'
            className='rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700 disabled:bg-blue-300'
          >
            <FontAwesomeIcon icon={faAngleLeft} />
          </button>
        </Link>
      ) : prevLessonLink ? (
        <Link href={prevLessonLink}>
          <button
            id='prev-lesson'
            className='rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700 disabled:bg-blue-300'
            disabled={!prevLessonLink}
          >
            <FontAwesomeIcon icon={faAnglesLeft} />
          </button>
        </Link>
      ) : null}
      {nextSectionLink ? (
        <Link href={nextSectionLink}>
          <button
            id='next-section'
            disabled={!sectionCompleted && !welcome}
            className={cn(
              'rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700 disabled:bg-blue-300',
              { 'animate-hue-background': sectionCompleted }
            )}
          >
            <FontAwesomeIcon icon={faAngleRight} />
          </button>
        </Link>
      ) : nextLessonLink ? (
        <Link href={nextLessonLink}>
          <button
            id='next-lesson'
            className={cn(
              'rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700 disabled:bg-blue-300',
              { 'animate-hue-background': lessonCompleted }
            )}
            disabled={!lessonCompleted}
          >
            <FontAwesomeIcon icon={faAnglesRight} />
          </button>
        </Link>
      ) : null}
    </>
  );
};

const CleanOutputMessage = () => {
  return (
    <span>
      {
        'Please fill out all fields in playground, then click "SUBMIT" button to see the outputs!'
      }
    </span>
  );
};

const OutputJsx = ({
  PreviousLessonOutputs,
  outputHTML,
}: {
  PreviousLessonOutputs: JSX.Element | null;
  outputHTML: string;
}) => {
  return (
    <>
      {PreviousLessonOutputs}
      <div className='prose' dangerouslySetInnerHTML={{ __html: outputHTML }} />
    </>
  );
};

const FormButtons = ({
  courseId,
  lessonId,
  sectionCompleted,
  isGeneratingOutput,
  resetForm,
  invalidRecordMap,
  isSubmittingForm,
  formDirty,
}: {
  courseId: string;
  lessonId: string;
  sectionCompleted: boolean;
  isGeneratingOutput: boolean;
  resetForm: () => void;
  invalidRecordMap: boolean;
  isSubmittingForm: boolean;
  formDirty: boolean;
}) => {
  const status = useFormStatus();
  const [isRestatingLesson, startRestarting] = useTransition();
  const formButtonsDisabled =
    status.pending ||
    isGeneratingOutput ||
    isRestatingLesson ||
    invalidRecordMap ||
    isSubmittingForm;
  const submitButtonDisabled = formButtonsDisabled || !formDirty;

  return (
    <>
      <button
        name='submitSection'
        type='submit'
        aria-disabled={submitButtonDisabled}
        disabled={submitButtonDisabled}
        className='rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700 disabled:bg-blue-300'
      >
        Submit
      </button>
      <button
        type='reset'
        value='reset'
        aria-disabled={formButtonsDisabled}
        disabled={formButtonsDisabled}
        onClick={resetForm}
        className='rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700 disabled:bg-blue-300'
      >
        <FontAwesomeIcon icon={faTrashCan} />
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
        {isRestatingLesson ? 'Resetting...' : <>Reset Lesson</>}
      </button>
    </>
  );
};

export default function LessonIO({
  recordMap,
  course,
  lesson,
  totalLessons,
  sectionId,
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
  PreviousLessonOutputs,
  userProgressForCourse,
}: {
  recordMap: ExtendedRecordMap | null;
  course: Course;
  lesson: Lesson;
  totalLessons: number;
  sectionId: number;
  prevSectionLink: string | null;
  nextSectionLink: string | null;
  prevLessonLink: string | null;
  nextLessonLink: string | null;
  totalSections: number | null;
  mdxInputSource: MDXRemoteSerializeResult | null;
  lessonInputsFromDB: JsonObject | null;
  lessonOutputfromDB: string | null;
  lastCompletedSectionFromDB: number | null;
  MdxOutput: JSX.Element | null;
  PreviousLessonOutputs: JSX.Element | null;
  userProgressForCourse: UserProgressForCourseFromDB | null;
}) {
  const { id: courseId } = course;
  const { id: lessonId, notionId } = lesson;
  const outputHTML = lessonOutputfromDB;
  const sectionCompleted =
    outputHTML !== null &&
    lastCompletedSectionFromDB !== null &&
    sectionId <= lastCompletedSectionFromDB;
  const finalSection = sectionId === totalSections;
  const lessonCompleted = sectionCompleted && finalSection;
  const remainingLessonCount = totalLessons - (lesson.order + 1);
  const remainingLessonMessage =
    remainingLessonCount > 0
      ? `You're doing great, ${converter.toWords(remainingLessonCount)} more to lessons to go!`
      : null;

  const pathname = usePathname();
  // get "?intro" search param from url using hooks
  const searchParams = useSearchParams();
  const showLessonAsIntro = searchParams.get(LESSON_START_PARAM);
  const showCongratsAfterCompletion = searchParams.get(LESSON_END_PARAM);
  // Do not show confetti if lesson is not completed or if it is already shown
  const outputCompletionConfetti =
    finalSection && lessonCompleted && !showCongratsAfterCompletion;

  const [loadingInputSection, setLoadingInputSection] = useState(true);
  const [formState, formAction] = useFormState(updateUserInputsByLessonId, {
    state: 'pending',
  } as UpdateUserInputFormState);
  const lessonInputs = JSON.stringify(
    formState.data ?? lessonInputsFromDB ?? {}
  );
  const formRef = useRef<HTMLFormElement>(null);
  const [isGeneratingOutput, startGeneratingOutput] = useTransition();

  const [clearInputs, setClearInputs] = useState(false);
  const [formDirty, setFormDirty] = useState(!sectionCompleted);
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);

  const [isExporting, startExporting] = useTransition();
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState(
    finalSection && sectionCompleted
      ? 2 // Completed final section displays output
      : sectionId > 1
        ? 1 // Section greater than 1 displays input
        : 0 // First section displays lesson
  );

  function onExportOutput() {
    startExporting(async () => {
      if (outputHTML) {
        const previousLessonOutputsHTML = renderToStaticMarkup(
          PreviousLessonOutputs
        );
        const { id: exportedOutputId } = await exportUserOutput(
          previousLessonOutputsHTML.concat(outputHTML),
          courseId,
          lessonId,
          true
        );
        router.push(`/playground/output/${exportedOutputId}`);
      }
    });
  }

  const resetForm = () => {
    formRef.current?.reset();
    setClearInputs(true);
    for (const key in localStorage) {
      if (key.startsWith(getLSPrefix(courseId, lessonId))) {
        localStorage.removeItem(key);
      }
    }
  };

  if (isDev(process.env.NODE_ENV)) {
    console.debug(
      'Rendering page: formState.state',
      formState.state,
      'current outputHTML',
      hashString(outputHTML ?? '')
    );
  }

  useEffect(() => {
    // Set pathname to redirect to after login or going to my account
    localStorage.setItem('redirectTo', pathname);
  }, [pathname]);

  useEffect(() => {
    if (
      (formState.state === 'success' || formState.state === 'noupdate') &&
      MdxOutput !== null
    ) {
      // Disable submit button after successful form submission
      setFormDirty(false);
      startGeneratingOutput(async () => {
        const renderedOutputHTML = renderToStaticMarkup(MdxOutput);
        if (isDev(process.env.NODE_ENV)) {
          console.debug(
            'Sending form data... ',
            'new outputHTML',
            hashString(renderedOutputHTML)
          );
        }
        setClearInputs(false);
        await updateUserOutputsByLessonId(
          courseId,
          lessonId,
          renderedOutputHTML
        );
        // Select output tab after successful form submission
        setSelectedTab(2);
        if (isDev(process.env.NODE_ENV)) {
          console.debug(
            'Sent form data! ',
            'new outputHTML',
            hashString(renderedOutputHTML)
          );
        }
        // Full generation is still not completed at this point so check for isGeneratingOutput as well
        setIsSubmittingForm(false);
      });
    }
    setLoadingInputSection(false);
  }, [
    formState.state,
    lessonInputs,
    MdxOutput,
    courseId,
    lessonId,
    sectionId,
    totalSections,
  ]);

  return (
    <>
      <div
        className={cn(
          'z-50 col-span-3 mt-[-1rem] h-min translate-y-4 justify-center gap-2',
          'flex md:hidden', // Hidden on desktop
          { 'hidden md:hidden': showLessonAsIntro } // Hide for intro
        )}
      >
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
        id='lesson-tab'
        className={cn(
          'flex flex-col overflow-auto bg-white',
          'col-span-3 md:col-span-1', // Full width on mobile, 1/3 width on desktop
          {
            'hidden md:flex': selectedTab !== 0, // Hide lesson tab when input or output tab is selected
            'col-span-3 md:col-span-3': showLessonAsIntro, // Lesson full width if intro
          }
        )}
      >
        <div className='h-screen flex-grow overflow-auto'>
          <NotionPage recordMap={recordMap}></NotionPage>
        </div>
      </div>

      {showCongratsAfterCompletion ? (
        <div className='prose flex h-full flex-col items-center justify-center overflow-auto p-4 text-center'>
          <DynamicConfetti />
          <LessonCompletedAnimation className='-mt-20 w-1/2' />
          {remainingLessonMessage ? (
            <>
              <p className='text-3xl'>
                {`Fantastic! You've wrapped up Lesson ${lesson.order + 1}: ${lesson.title}.`}
              </p>
              <p className='text-xl'>{`${remainingLessonMessage}`}</p>
            </>
          ) : (
            <p className='text-3xl'>{`Excellent job! You've officially completed the course ${course.title}.`}</p>
          )}
          <p>{`You can export or share your work using the cloud icon below.`}</p>
        </div>
      ) : (
        <form
          id='input-tab'
          action={formAction}
          onChange={() => {
            setFormDirty(true);
            // TODO: SOMEHOW UPDATE FOCUS TO INPUT FIELD
            // TODO: SOMEHOW UPDATE FOCUS TO INPUT FIELD
          }}
          onSubmit={() => {
            setIsSubmittingForm(true);
            setFormDirty(false);
          }}
          ref={formRef}
          className={cn(
            'flex flex-grow flex-col overflow-auto bg-white text-xs md:text-sm',
            'col-span-3 md:col-span-1', // Full width on mobile, 1/3 width on desktop
            {
              'hidden md:flex': selectedTab !== 1,
              'hidden md:hidden': showLessonAsIntro, // Hide for intro and ending
            }
          )}
        >
          <div className='prose h-screen flex-grow overflow-auto p-4'>
            {!mdxInputSource ? (
              ''
            ) : loadingInputSection ? (
              <LoadingAnimation className='m-auto h-full w-1/2' />
            ) : (
              <LessonInputArea
                mdxInputSource={mdxInputSource}
                courseId={courseId}
                lessonId={lessonId}
                lessonInputs={JSON.parse(lessonInputs)}
                userProgressForCourse={userProgressForCourse}
                clearInputs={clearInputs}
                setClearInputs={setClearInputs}
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
          <input
            type='hidden'
            readOnly={true}
            name='section'
            value={sectionId}
          />
          {totalSections ? (
            <div className=''>
              <ProgressBar section={sectionId} totalSections={totalSections} />
            </div>
          ) : null}
          <div className='bottom-0 left-0 flex w-full justify-center space-x-2 bg-sky-100 pt-1 md:justify-start md:pt-2'>
            <FormButtons
              courseId={courseId}
              lessonId={lessonId}
              sectionCompleted={sectionCompleted}
              resetForm={resetForm}
              isGeneratingOutput={isGeneratingOutput}
              invalidRecordMap={!recordMap}
              isSubmittingForm={isSubmittingForm}
              formDirty={formDirty}
            />
          </div>
        </form>
      )}

      <div
        id='output-tab'
        className={cn(
          'relative flex flex-grow flex-col overflow-auto bg-sky-50 text-sm',
          'col-span-3 md:col-span-1', // Full width on mobile, 1/3 width on desktop
          {
            'hidden md:flex': selectedTab !== 2,
            'hidden md:hidden': showLessonAsIntro, // Hide for intro
          }
        )}
      >
        {!isGeneratingOutput && outputHTML && outputCompletionConfetti ? (
          <DynamicConfetti />
        ) : null}
        <div className='hidden'>{MdxOutput}</div>
        <div className='h-screen flex-grow overflow-auto p-4'>
          {isSubmittingForm || isGeneratingOutput ? (
            <LoadingAnimation className='m-auto h-full w-1/2' />
          ) : outputHTML ? (
            <OutputJsx
              PreviousLessonOutputs={PreviousLessonOutputs}
              outputHTML={outputHTML}
            />
          ) : PreviousLessonOutputs ? (
            PreviousLessonOutputs
          ) : (
            <CleanOutputMessage />
          )}
        </div>
      </div>

      <footer className='col-span-3 grid grid-cols-3 gap-1 p-2 pt-0 md:grid-cols-3 md:gap-2'>
        <div
          className={cn(
            'col-span-3 flex flex-grow justify-center gap-2 md:col-span-1 md:justify-start',
            {
              'hidden md:flex': selectedTab === 1, // Hide feedback buttons when input tab is selected
            }
          )}
        >
          <FeedbackButtons />
        </div>
        <div className='hidden items-center gap-1 md:flex md:justify-center'>
          {/* {lessonCompleted ? <span>✅</span> : <span>🟦</span>} */}
          <span>{`Lesson ${lesson.order + 1}/${totalLessons}: ${
            lesson.title
          }`}</span>
        </div>
        <div className='col-span-3 flex flex-grow justify-center gap-2 md:col-span-1 md:justify-end'>
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
