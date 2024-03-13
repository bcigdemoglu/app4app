'use client';

import Link from 'next/link';
import { ChangeEvent, Dispatch, SetStateAction, useState } from 'react';

export default function IncomeCalculator() {
  const [step, setStep] = useState(0);
  const [averageCoursePrice, setAverageCoursePrice] = useState(0);
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

  return (
    <div className='flex flex-col items-center gap-4 p-4'>
      {step === 0 && (
        <input
          type='number'
          placeholder="What's your total number of courses?"
          className='input w-full rounded-lg border border-gray-300 p-2'
        />
      )}
      {step === 1 && (
        <input
          type='number'
          onChange={handleInputChange(setAverageCoursePrice)}
          placeholder='On average, how much do you charge per course (USD)?'
          className='input w-full rounded-lg border border-gray-300 p-2'
        />
      )}
      {step === 2 && (
        <input
          type='number'
          placeholder='How many courses include digital downloads?'
          className='input w-full rounded-lg border border-gray-300 p-2'
        />
      )}
      {step === 3 && (
        <input
          type='number'
          onChange={handleInputChange(setExpectedSales)}
          placeholder='How many course sales do you expect in 2024?'
          className='input w-full rounded-lg border border-gray-300 p-2'
        />
      )}

      <button
        onClick={nextStep}
        className='btn rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700'
      >
        {step < 3
          ? 'Next'
          : 'Calculate my Potential Passive Income with Cloudybook'}
      </button>

      {step > 3 && (
        <div className='mt-4 text-lg text-gray-800'>
          Potential annual passive income with 1 hour of content prep:{' '}
          <span className='text-green-700'>{potentialEarnings.toFixed(2)}</span>{' '}
          USD!
        </div>
      )}

      {step > 3 && (
        <Link href='/my-account'>
          <button className='btn rounded bg-green-500 px-4 py-2 font-bold text-white hover:bg-green-700'>
            Boost my Earnings!
          </button>
        </Link>
      )}
    </div>
  );
}
