'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Optionally log the error to an error reporting service
    console.error('Unhandled error occurred', error);
  }, [error]);

  return (
    <div className='flex h-screen items-center justify-center bg-gray-100'>
      <div className='text-center'>
        <p className='text-7xl font-bold tracking-wider text-gray-300 md:text-8xl lg:text-9xl'>
          Oh no!
        </p>
        <p className='mt-2 text-4xl font-bold tracking-wider text-gray-300 md:text-5xl lg:text-6xl'>
          Something went wrong.
        </p>
        <p className='mt-4 text-lg text-gray-900'>
          Sorry, there was an error. Please try again later.
        </p>
        <button
          className='mt-8 inline-block rounded-md bg-blue-600 px-6 py-3 font-semibold text-white transition duration-300 hover:bg-blue-700'
          onClick={
            // Attempt to recover by trying to re-render the failed route
            () => reset()
          }
        >
          Try again
        </button>
      </div>
    </div>
  );
}
