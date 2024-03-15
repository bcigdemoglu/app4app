'use client';

import { cn } from '@/utils/cn';
import dynamic from 'next/dynamic';
import { useState, useTransition } from 'react';
import { collectWidgetStat } from '../actions';

const openInNewTab = (url: string) => {
  window.open(url, '_blank', 'noopener,noreferrer');
};

const DynamicConfetti = dynamic(() =>
  import('@/components/Confetti').then((m) => m.Confetti)
);

const LoadingSpinner = () => (
  <svg
    aria-hidden='true'
    role='status'
    className='mb-1 ms-1 inline h-4 w-4 animate-spin text-white'
    viewBox='0 0 100 101'
    fill='none'
    xmlns='http://www.w3.org/2000/svg'
  >
    <path
      d='M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z'
      fill='#E5E7EB'
    />
    <path
      d='M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z'
      fill='currentColor'
    />
  </svg>
);

const ProgressBar = ({
  section,
  totalSections,
}: {
  section: number;
  totalSections: number;
}) => {
  return (
    <div className='w-full rounded-full bg-sky-200 text-center'>
      <div
        className={cn(
          'text-nowrap rounded-full bg-green-600 p-0.5 text-center font-normal leading-none text-white',
          { hidden: section === 0 }
        )}
        style={{ width: `${(section / totalSections) * 100}%` }}
      >
        {section} / {totalSections}
      </div>
    </div>
  );
};

export default function IncomeCalculator() {
  const [step, setStep] = useState(0);
  const [numCourse, setNumCourse] = useState(0);
  const [averageCoursePrice, setAverageCoursePrice] = useState(0);
  const [hasDigitalDownloads, setHasDigitalDownloads] = useState(0);
  const [expectedSales, setExpectedSales] = useState(0);
  const [calculating, setCalculating] = useState(false);
  const saleEarnings =
    expectedSales < 100 ? 6240 : expectedSales < 500 ? 15600 : 31200;
  const potentialEarnings =
    averageCoursePrice < 20
      ? saleEarnings / 3
      : averageCoursePrice > 100
        ? saleEarnings * 1.5
        : saleEarnings;

  const [isCollectingStats, startCollectingStats] = useTransition();

  const wait = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  const calculateEarnings = async () => {
    if (calculating) return;
    setCalculating(true);
    startCollectingStats(async () => {
      collectWidgetStat(
        {
          numCourse,
          averageCoursePrice,
          hasDigitalDownloads,
          expectedSales,
          potentialEarnings,
        },
        {
          // Device and browser information
          browser: navigator.userAgent,
          screenResolution: `${window.screen.width}x${window.screen.height}`,
          // Referral Data
          referrer: document.referrer,
          // Other potentially useful data
          timestamp: new Date().toISOString(),
        }
      );
    });
    await wait(3000);
    nextStep();
  };

  const nextStep = async () => {
    setStep(step + 1);
  };

  function InputButton({ fn, children }: { fn: () => any; children: any }) {
    return (
      <button
        onClick={async () => {
          fn();
          await nextStep();
        }}
        className='btn w-full rounded-full bg-blue-500 px-4 py-2 font-semibold text-white hover:bg-blue-700 md:w-1/2'
        value={5}
      >
        {children}
      </button>
    );
  }

  type InputFn = (value: number) => any;

  interface InputChoice {
    text: string;
    value: number;
  }

  function InputButtons({
    fn,
    choises,
  }: {
    fn: InputFn;
    choises: InputChoice[];
  }) {
    return choises.map(({ text, value }, index) => (
      <InputButton fn={() => fn(value)} key={index}>
        {text}
      </InputButton>
    ));
  }

  function InfoAndNext({
    info,
    nextButtonText,
  }: {
    info: string;
    nextButtonText: string;
  }) {
    return (
      <>
        <span className='font-light'>{info}</span>
        <button
          onClick={nextStep}
          className='btn w-full rounded-full bg-blue-500 px-4 py-2 font-semibold text-white hover:bg-blue-700 md:w-1/2'
        >
          {nextButtonText}
        </button>
      </>
    );
  }

  return (
    <div className='flex flex-col items-center gap-4 p-4 text-center font-semibold text-white'>
      <ProgressBar section={step} totalSections={8} />
      {step === 0 ? (
        <>
          <span>How many online courses do you offer?</span>
          <InputButtons
            fn={setNumCourse}
            choises={[
              { text: '1', value: 1 },
              { text: '2 to 3', value: 3 },
              { text: '4 to 10', value: 10 },
              { text: 'More than 10', value: 15 },
            ]}
          />
        </>
      ) : null}
      {step === 1 ? (
        <InfoAndNext
          info={
            'Did you know? Six-figure creators typically have at least five different revenue streams, while those pulling in over $150k juggle up to seven!'
          }
          nextButtonText={'Let’s talk about pricing!'}
        />
      ) : null}
      {step === 2 ? (
        <>
          <span>On average, how much do you charge per course?</span>
          <InputButtons
            fn={setAverageCoursePrice}
            choises={[
              { text: 'Less than $20', value: 19 },
              { text: '$20 to $50', value: 50 },
              { text: '$50 to $100', value: 100 },
              { text: 'More than $100', value: 101 },
            ]}
          />
        </>
      ) : null}
      {step === 3 ? (
        <InfoAndNext
          info={
            '“Creating interactive content is one good way to differentiate yourself” — something that 88% of marketers agree with.'
          }
          nextButtonText={'More about interactive content!'}
        />
      ) : null}
      {step === 4 ? (
        <>
          <span>Do you currently offer interactive content?</span>
          <InputButtons
            fn={setHasDigitalDownloads}
            choises={[
              { text: 'Of course!', value: 1 },
              { text: 'I want to...', value: 0.5 },
              { text: 'Nope', value: 0 },
            ]}
          />
        </>
      ) : null}
      {step === 5 ? (
        <InfoAndNext
          info={
            'Looking ahead: 2024 is shaping up to be a pivotal year for creators ready to take the reins of their content and carve out a path to financial independence and success.'
          }
          nextButtonText={'Finally, let’s talk about 2024 forecast!'}
        />
      ) : null}
      {step === 6 ? (
        <>
          <span>Around how many courses do you sell per month?</span>
          <InputButtons
            fn={setExpectedSales}
            choises={[
              { text: 'Less than 100', value: 99 },
              { text: '100 to 500', value: 500 },
              { text: 'More than 500', value: 501 },
            ]}
          />
        </>
      ) : null}
      {step === 7 ? (
        <>
          <div className='font-light'>
            {'Are you ready to create once, earn forever with Cloudybook?'}
          </div>
          <button
            onClick={calculateEarnings}
            className='btn w-full rounded-full bg-blue-500 px-4 py-2 font-semibold text-white hover:bg-blue-700 md:w-1/2'
          >
            {calculating || isCollectingStats ? (
              <>
                <span className=''>Calculating</span>
                <LoadingSpinner />
              </>
            ) : (
              'Calculate my potential passive income'
            )}
          </button>
        </>
      ) : null}
      {step >= 8 ? (
        <>
          <DynamicConfetti />
          <div className='text-lg '>
            Potential annual passive income with an hour of content prep:{' '}
            <span className='font-semibold text-green-600'>
              ${potentialEarnings.toFixed(0)}
            </span>
            !
          </div>
          <button
            onClick={() =>
              openInNewTab(
                'https://calendly.com/ilaydacloudy/beta-user-introduction'
              )
            }
            className='btn rounded bg-green-500 px-4 py-2 font-semibold text-white hover:bg-green-700'
          >
            Book a call and learn how it works!
          </button>
        </>
      ) : null}
    </div>
  );
}
