import Hotjar from '@/components/Hotjar';
import { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
// import GoogleAnalytics from './components/GoogleAnalytics';
import { Analytics as VercelAnalytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

// core styles shared by all of react-notion-x (required)
import 'react-notion-x/src/styles.css';

// The following import prevents a Font Awesome icon server-side rendering bug,
// where the icons flash from a very large icon down to a properly sized one:
import '@fortawesome/fontawesome-svg-core/styles.css';
// Prevent fontawesome from adding its CSS since we did it manually above:
import GoogleAnalytics from '@/components/GoogleAnalytics';
import LoadingAnimation from '@/components/LoadingAnimation';
import { genMetadata } from '@/lib/data';
import { config } from '@fortawesome/fontawesome-svg-core';
import { Suspense } from 'react';
config.autoAddCss = false; /* eslint-disable import/first */

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = genMetadata(
  'Home',
  'Where Workbooks Come Alive'
);

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en'>
      <GoogleAnalytics />
      <Hotjar />
      <body className={inter.className}>
        <Suspense
          fallback={
            <div className='flex h-svh flex-col items-center justify-center'>
              <LoadingAnimation className='w-1/5' />
            </div>
          }
        >
          {children}
        </Suspense>
        <VercelAnalytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
