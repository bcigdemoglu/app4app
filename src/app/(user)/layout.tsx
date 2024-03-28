import Image from 'next/image';
import React from 'react';

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const GreetingAnimation = React.lazy(
    () => import('@/components/GreetingAnimation')
  );

  return (
    <section>
      <div className='bg-secondary-50 flex min-h-screen overflow-y-auto'>
        <div className='flex w-full items-center justify-center md:w-1/2'>
          {/* Sign-up Form Section */}
          <div className='mx-auto w-full max-w-md space-y-6'>{children}</div>
        </div>
        <div className='hidden items-center justify-center bg-gradient-to-r from-blue-600 to-blue-800 lg:flex lg:w-1/2'>
          {/* Illustration*/}
          <div className='-mt-20 flex flex-col items-center space-y-8'>
            <GreetingAnimation className='w-1/2' />
            <h1 className='text-center text-5xl font-thin tracking-[-0.025em] text-white'>
              Get Ready for Your Interactive Experience
            </h1>
            <Image
              src='/cloudybook_white.png'
              alt='Cloudy Book Logo'
              width={165}
              height={34}
              className='self-center'
            />
          </div>
        </div>
      </div>
    </section>
  );
}
