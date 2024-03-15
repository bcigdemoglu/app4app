'use client';

import { cn } from '@/utils/cn';
import dynamic from 'next/dynamic';
import { useState } from 'react';

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
          'text-nowrap rounded-full bg-green-600 p-0.5 text-center font-medium leading-none text-white',
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
  const [potentialEarnings, setPotentialEarnings] = useState(0);
  const [calculating, setCalculating] = useState(false);

  const wait = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  const calculateEarnings = async () => {
    if (calculating) return;
    setCalculating(true);
    const cloudybookPrice = averageCoursePrice * 0.25;
    const earnings =
      expectedSales *
      cloudybookPrice *
      0.25 *
      (hasDigitalDownloads + 0.5) *
      (numCourse / 5);
    setPotentialEarnings(earnings);
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
        <span>{info}</span>
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
          info={'...Valuable information about number of courses...'}
          nextButtonText={"Let's talk about earnings"}
        />
      ) : null}
      {step === 2 ? (
        <>
          <span>On average, how much do you charge per course?</span>
          <InputButtons
            fn={setAverageCoursePrice}
            choises={[
              { text: 'Less than $20', value: 20 },
              { text: '$20 to $40', value: 40 },
              { text: '$40 to $80', value: 80 },
              { text: 'More than $100', value: 150 },
            ]}
          />
        </>
      ) : null}
      {step === 3 ? (
        <InfoAndNext
          info={'...Valuable information about prices of courses...'}
          nextButtonText={"Let's talk about digital downloads"}
        />
      ) : null}
      {step === 4 ? (
        <>
          <span>Do you make money from digital downloads?</span>
          <InputButtons
            fn={setHasDigitalDownloads}
            choises={[
              { text: 'Of course!', value: 1 },
              { text: 'I sure want to...', value: 0.5 },
              { text: 'Nope', value: 0 },
            ]}
          />
        </>
      ) : null}
      {step === 5 ? (
        <InfoAndNext
          info={'...Valuable information about digital downloads...'}
          nextButtonText={"Final question: Let's talk about sales!"}
        />
      ) : null}
      {step === 6 ? (
        <>
          <span>How many courses do you typically sell in a month?</span>
          <InputButtons
            fn={setExpectedSales}
            choises={[
              { text: 'Less than 100', value: 100 },
              { text: '200 to 500', value: 500 },
              { text: 'More than 500', value: 1000 },
            ]}
          />
        </>
      ) : null}
      {step === 7 ? (
        <>
          <div className='text-gray-800'>
            Ready to make money in your sleep?
          </div>
          <button
            onClick={calculateEarnings}
            className='btn w-full rounded-full bg-blue-500 px-4 py-2 font-semibold text-white hover:bg-blue-700 md:w-1/2'
          >
            {calculating ? (
              <>
                <span className=''>Calculating</span>
                <LoadingSpinner />
              </>
            ) : (
              'Calculate my passive income with Cloudybook'
            )}
          </button>
        </>
      ) : null}
      {step >= 8 ? (
        <>
          <DynamicConfetti />
          <div className='text-lg text-gray-800'>
            Potential annual passive income with 1 hour of content prep:{' '}
            <span className='font-semibold text-green-700'>
              ${potentialEarnings.toFixed(2)}
            </span>
            !
          </div>
          <button
            onClick={() =>
              openInNewTab('https://app.cloudybook.com/playground')
            }
            className='btn rounded bg-green-500 px-4 py-2 font-semibold text-white hover:bg-green-700'
          >
            Book a Call & Boost my Earnings!
          </button>
        </>
      ) : null}
    </div>
  );
}
