'use client';

import { faBars } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Link from 'next/link';
import { useState, ReactNode } from 'react';

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
  const [navbarOpen, setNavbarOpen] = useState(false);

  return (
    <nav className='h-13 sticky top-0 z-30 bg-white bg-opacity-50 shadow backdrop-blur-xl backdrop-filter'>
      <div className='flex flex-col items-center p-2 md:flex-row md:items-center md:justify-between'>
        <div className='flex w-full justify-between px-2 text-xl font-bold md:px-4 md:text-2xl'>
          <Link
            href='/'
            className='focus:shadow-outline rounded-lg text-gray-800 hover:text-gray-600'
          >
            ilayda.com
          </Link>
          <button
            className='cursor-pointer px-3 py-1 leading-none text-gray-900 outline-none focus:outline-none md:hidden'
            type='button'
            aria-label='button'
            onClick={() => setNavbarOpen(!navbarOpen)}
          >
            <FontAwesomeIcon icon={faBars} />
          </button>
        </div>
        <nav
          className={
            'flex flex-grow flex-col items-center justify-end gap-1 space-x-4 whitespace-nowrap md:flex md:flex-row' +
            (navbarOpen ? ' flex' : ' hidden')
          }
        >
          <NavLink href='/#about-us'>My Journey</NavLink>
          <NavLink href='/blog'>Blog</NavLink>
          <AnimatedNavLink href='/affirmations' additionalClasses='bg-red-600'>
            Affirmations
          </AnimatedNavLink>
          <AnimatedNavLink href='/playground' additionalClasses='bg-blue-600'>
            Playground
          </AnimatedNavLink>
        </nav>
      </div>
    </nav>
  );
}
