import Link from 'next/link';

export default function Error({
  searchParams,
}: {
  searchParams?: {
    msg?: string;
  };
}) {
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
          {searchParams?.msg
            ? searchParams?.msg
            : 'Sorry, there was an error. Please try again later.'}
        </p>
        <Link
          href='/'
          className='mt-8 inline-block rounded-md bg-blue-600 px-6 py-3 font-semibold text-white transition duration-300 hover:bg-blue-700'
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}
