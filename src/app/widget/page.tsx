'use client';

import { ChangeEvent, Dispatch, SetStateAction, useState } from 'react';

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

  const handleInputChange =
    <T extends number>(setter: Dispatch<SetStateAction<T>>) =>
    (e: ChangeEvent<HTMLInputElement>) => {
      setter(Number(e.target.value) as T);
    };

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
              { text: '2-5', value: 5 },
              { text: '5-10', value: 10 },
              { text: 'More than 10', value: 20 },
            ]}
          />
        </>
      ) : null}
      {step === 1 && (
        <>
          <span>On average, how much do you charge per course?</span>
          <InputButtons
            fn={setAverageCoursePrice}
            choises={[
              { text: 'Less than 20 USD', value: 20 },
              { text: '20-40 USD', value: 40 },
              { text: '40-80 USD', value: 80 },
              { text: 'More than 100 USD', value: 150 },
            ]}
          />
        </>
      )}
      {step === 2 && (
        <>
          <span>Do you sell any digital downloads?</span>
          <InputButton fn={() => setHasDigitalDownloads(1)}>Yes</InputButton>
          <InputButton fn={() => setHasDigitalDownloads(1)}>No</InputButton>
          <InputButton fn={() => setHasDigitalDownloads(1)}>
            I sure want to!
          </InputButton>
        </>
      )}
      {step === 3 && (
        <>
          <input
            type='number'
            onChange={handleInputChange(setExpectedSales)}
            placeholder='How many course sales do you expect in 2024?'
            className='input w-full rounded-lg border border-gray-300 p-2'
          />
          <button
            onClick={nextStep}
            className='btn rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700'
          >
            Calculate my Potential Passive Income with Cloudybook
          </button>
        </>
      )}

      {step > 3 && (
        <div className='mt-4 text-lg text-gray-800'>
          Potential annual passive income with 1 hour of content prep:{' '}
          <span className='text-green-700'>{potentialEarnings.toFixed(2)}</span>{' '}
          USD!
        </div>
      )}

      {step > 3 && (
        <button
          onClick={() => openInNewTab('https://ilayda.vercel.app/playground')}
          className='btn rounded bg-green-500 px-4 py-2 font-bold text-white hover:bg-green-700'
        >
          Boost my Earnings!
        </button>
      )}
    </div>
  );
}
