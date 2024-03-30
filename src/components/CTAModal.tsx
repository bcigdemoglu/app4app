'use client';
import { openCalendyInNewTab } from '@/utils/ctaHelpers';
import { useEffect, useState } from 'react';

export const CTAButton = () => (
  <button
    onClick={() => openCalendyInNewTab()}
    className='hidden rounded bg-orange-600 px-4 py-2 font-bold text-white hover:bg-orange-800 disabled:bg-orange-400 md:flex'
  >
    {/* Hidden on mobile */}
    Create Yours!
  </button>
);

export default function CTAModal() {
  const waitXSecondsBeforeShow = 10;
  const [show, setShow] = useState(false);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (sessionStorage.getItem('ctaAlreadyShown')) return;
      setShow(true);
      sessionStorage.setItem('ctaAlreadyShown', 'true');
    }, waitXSecondsBeforeShow * 1000);
    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <div
      className={
        show
          ? 'fixed left-0 top-0 z-50 flex h-full w-full items-center justify-center overflow-auto bg-black bg-opacity-50 backdrop-blur'
          : 'hidden'
      }
    >
      <div className='m-auto bg-white p-8'>
        <div className='prose flex flex-col'>
          {/* Modal Header */}
          <h3 className='text-center text-xl font-semibold text-gray-900'>
            Today is your lucky day dear Creator!
          </h3>

          {/* Modal Body */}
          <div className='space-y-6 p-6'>
            <p className='leading-relaxed text-gray-500'>
              Here is how Cloudybook can help you do X:{' '}
              {' because this because that because this '.repeat(100)}
            </p>
          </div>

          <div className='flex justify-center space-x-4'>
            <button
              type='button'
              onClick={() => {
                setShow(false);
                openCalendyInNewTab();
              }}
              className='rounded bg-green-500 p-2 text-white hover:bg-green-600'
            >
              {"Let's meet"}
            </button>
            <button
              type='button'
              className='rounded bg-red-500 p-2 text-white hover:bg-red-600'
            >
              {'Maybe later'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
