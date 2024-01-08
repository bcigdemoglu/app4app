import Link from 'next/link';

import { ReactNode } from 'react';

function NavLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className='text-gray-800 hover:font-bold hover:text-gray-600'
    >
      {children}
    </Link>
  );
}

function AnimatedNavLink({
  href,
  additionalClasses,
  children,
}: {
  href: string;
  additionalClasses: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className={'group rounded-md py-2 pl-4 pr-[-1rem] text-white transition-all duration-500 ease-in-out hover:px-4 '.concat(
        additionalClasses
      )}
    >
      {children}{' '}
      <span className='inline-block translate-x-4 transform font-bold opacity-0 transition-transform duration-500 ease-in-out group-hover:translate-x-0 group-hover:opacity-100'>
        →
      </span>
    </Link>
  );
}

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
          <NavLink href='/#about-us'>My Journey</NavLink>
          <NavLink href='/blog'>Blog</NavLink>
          <AnimatedNavLink href='/affirmations' additionalClasses='bg-red-600'>
            Affirmations
          </AnimatedNavLink>
          <AnimatedNavLink href='/playground' additionalClasses='bg-blue-600'>
            Playground
          </AnimatedNavLink>
        </div>
      </div>
    </nav>
  );
}
