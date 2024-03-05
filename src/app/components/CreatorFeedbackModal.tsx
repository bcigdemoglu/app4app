'use client';
import { useSearchParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import { CREATOR_MODAL_PARAM } from '@/app/lib/data';

export default function CreatorFeedbackModal() {
  const searchParams = useSearchParams();
  const modal = searchParams.get(CREATOR_MODAL_PARAM);
  const pathname = usePathname();

  return (
    <>
      {modal && (
        <dialog className='fixed left-0 top-0 z-50 flex h-full w-full items-center justify-center overflow-auto bg-black bg-opacity-50 backdrop-blur-sm'>
          <div className='m-auto rounded-lg bg-white p-8 shadow-lg'>
            <div className='prose flex flex-col items-center space-y-4'>
              <p>{'Please rate your course experience'}</p>
              <textarea
                className='w-full rounded border border-sky-200 bg-white p-2 text-gray-700 focus:border-green-500 focus:ring focus:ring-green-500 focus:ring-opacity-50'
                rows={4}
                placeholder='Your feedback'
              />
              <input
                type='range'
                min='1'
                max='10'
                className='mx-2 h-2 w-full cursor-pointer appearance-none rounded-lg bg-sky-200 '
              />
              <div className='flex w-full justify-between px-2'>
                {[...Array(10).keys()].map((number) => (
                  <span key={number} className='text-sm'>
                    {number + 1}
                  </span>
                ))}
              </div>
              <div className='flex space-x-4'>
                <Link href={pathname}>
                  <button
                    type='button'
                    className='rounded bg-green-500 p-2 text-white hover:bg-green-600'
                  >
                    Send
                  </button>
                </Link>
                <Link href={pathname}>
                  <button
                    type='button'
                    className='rounded bg-red-500 p-2 text-white hover:bg-red-600'
                  >
                    Close
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </dialog>
      )}
    </>
  );
}
