import Link from 'next/link';

export default function Home() {
  return (
    <div className='flex h-screen items-center justify-center bg-gray-100'>
      <div className='text-center'>
        <Link href='/playground' id='join-playground-btn'>
          <button className='mt-4 rounded-md bg-blue-600 px-4 py-2 text-white'>
            Join Playground
          </button>
        </Link>
        <br />
        <Link
          href='https://www.ilayda.com'
          className='mt-8 inline-block rounded-md bg-blue-600 px-6 py-3 font-semibold text-white transition duration-300 hover:bg-blue-700'
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}
