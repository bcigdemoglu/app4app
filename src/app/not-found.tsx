import Link from 'next/link';

export default function NotFound() {
  return (
    <div className='flex h-screen items-center justify-center bg-gray-100'>
      <div className='text-center'>
        <p className='text-7xl font-bold tracking-wider text-gray-300 md:text-8xl lg:text-9xl'>
          404
        </p>
        <p className='mt-2 text-4xl font-bold tracking-wider text-gray-300 md:text-5xl lg:text-6xl'>
          Page Not Found
        </p>
        <p className='mt-4 text-lg text-gray-900'>
          Sorry, the page you are looking for could not be found.
        </p>
        <Link
          href='/playground'
          className='mt-8 inline-block rounded-md bg-blue-600 px-6 py-3 font-semibold text-white transition duration-300 hover:bg-blue-700'
        >
          Return to Playground
        </Link>
      </div>
    </div>
  );
}
