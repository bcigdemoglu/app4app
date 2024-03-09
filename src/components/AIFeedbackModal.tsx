'use client';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { MDXRemote, MDXRemoteSerializeResult } from 'next-mdx-remote';

export default function AIFeedbackModal({
  aiFeedbackSource,
}: {
  aiFeedbackSource: MDXRemoteSerializeResult;
}) {
  const pathname = usePathname();

  return (
    <dialog className='fixed left-0 top-0 z-50 flex h-full w-full items-center justify-center overflow-auto bg-black bg-opacity-50 backdrop-blur'>
      <div className='m-auto bg-white p-8'>
        <div className='prose flex flex-col items-center'>
          {aiFeedbackSource ? (
            <MDXRemote {...aiFeedbackSource} />
          ) : (
            'Generating AI Feedback...'
          )}
          <br />
          <Link href={pathname}>
            <button type='button' className='bg-red-500 p-2 text-white'>
              Close
            </button>
          </Link>
        </div>
      </div>
    </dialog>
  );
}
