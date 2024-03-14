'use client';

import { useState } from 'react';

const openInNewTab = (url: string) => {
  window.open(url, '_blank', 'noopener,noreferrer');
};

export default function IncomeCalculator() {
  const [step, setStep] = useState(0);
  const [numCourse, setNumCourse] = useState(0);
  const [averageCoursePrice, setAverageCoursePrice] = useState(0);
  const [hasDigitalDownloads, setHasDigitalDownloads] = useState(0);
  const [expectedSales, setExpectedSales] = useState(0);
  const [potentialEarnings, setPotentialEarnings] = useState(0);

  //   const handleInputChange =
  //     <T extends number>(setter: Dispatch<SetStateAction<T>>) =>
  //     (e: ChangeEvent<HTMLInputElement>) => {
  //       setter(Number(e.target.value) as T);
  //     };

  const calculateEarnings = () => {
    const cloudybookPrice = averageCoursePrice * 0.25;
    const earnings = expectedSales * cloudybookPrice * 0.25;
    setPotentialEarnings(earnings);
  };

  const nextStep = async () => {
    if (step === 3) {
      calculateEarnings();
    }
    setStep(step + 1);
  };

  function InputButton({ fn, children }: { fn: () => any; children: any }) {
    return (
      <button
        onClick={async () => {
          fn();
          await nextStep();
        }}
        className='btn w-3/4 rounded-full bg-blue-500 px-4 py-2 font-semibold text-white hover:bg-blue-700'
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
          className='btn rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700'
        >
          {nextButtonText}
        </button>
      </>
    );
  }

  console.log(numCourse, hasDigitalDownloads);

  return (
    <div className='flex flex-col items-center gap-4 p-4'>
      {step === 0 ? (
        <>
          <span>How many online courses do you offer?</span>
          <InputButtons
            fn={setNumCourse}
            choises={[
              { text: '1', value: 1 },
              { text: '2 to 5', value: 5 },
              { text: '5 to 10', value: 10 },
              { text: 'More than 10', value: 20 },
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
          nextButtonText={"Final question! Let's talk about sales!"}
        />
      ) : null}
      {step === 6 ? (
        <>
          <span>How many course sales do you expect in 2024?</span>
          <InputButtons
            fn={setExpectedSales}
            choises={[
              { text: 'Up to 100', value: 100 },
              { text: 'Around 200', value: 200 },
              { text: 'More than 300', value: 300 },
            ]}
          />
        </>
      ) : null}
      {step === 7 ? (
        <>
          <span>Ready to see what you are missing out on?</span>
          <button
            onClick={nextStep}
            className='btn rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700'
          >
            Calculate my passive income with Cloudybook
          </button>
        </>
      ) : null}
      {step >= 8 ? (
        <>
          <div className='mt-4 text-lg text-gray-800'>
            Potential annual passive income with 1 hour of content prep:{' '}
            <span className='text-green-700'>
              {potentialEarnings.toFixed(2)}
            </span>{' '}
            USD!
          </div>
          <button
            onClick={() => openInNewTab('https://app.cloudbook.com/playground')}
            className='btn rounded bg-green-500 px-4 py-2 font-bold text-white hover:bg-green-700'
          >
            Boost my Earnings!
          </button>
        </>
      ) : null}
    </div>
  );
}
