import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className='h-13 sticky top-0 z-30 bg-white bg-opacity-50 shadow backdrop-blur-xl backdrop-filter'>
      <div className='flex items-center justify-between p-4'>
        <div className='text-xl font-bold'>
          <Link href='/' className='text-gray-800 hover:text-gray-600'>
            ilayda.com
          </Link>
        </div>
        <div className='space-x-4'>
          <Link href='/#about-us'>
            <span className='text-gray-800 hover:font-bold hover:text-gray-600'>
              My Journey
            </span>
          </Link>
          <Link href='/blog'>
            <span className='text-gray-800 hover:font-bold hover:text-gray-600'>
              Blog
            </span>
          </Link>
          <Link href='/affirmations'>
            <span className='group rounded-md bg-red-600 py-2 pl-4 pr-[-1rem] text-white transition-all duration-500 ease-in-out hover:px-4'>
              Affirmations{' '}
              <span className='inline-block translate-x-4 transform font-bold opacity-0 transition-transform duration-500 ease-in-out group-hover:translate-x-0 group-hover:opacity-100'>
                →
              </span>
            </span>
          </Link>
          <Link href='/playground'>
            <span className='group rounded-md bg-blue-600 py-2 pl-4 pr-[-1rem] text-white transition-all duration-500 ease-in-out hover:px-4'>
              Playground{' '}
              <span className='inline-block translate-x-4 transform font-bold opacity-0 transition-transform duration-500 ease-in-out group-hover:translate-x-0 group-hover:opacity-100'>
                →
              </span>
            </span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
