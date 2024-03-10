import { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
// import Hotjar from './components/Hotjar';
// import GoogleAnalytics from './components/GoogleAnalytics';
import { Analytics as VercelAnalytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

// core styles shared by all of react-notion-x (required)
import 'react-notion-x/src/styles.css';

// The following import prevents a Font Awesome icon server-side rendering bug,
// where the icons flash from a very large icon down to a properly sized one:
import '@fortawesome/fontawesome-svg-core/styles.css';
// Prevent fontawesome from adding its CSS since we did it manually above:
import { config } from '@fortawesome/fontawesome-svg-core';
import { Suspense } from 'react';
config.autoAddCss = false; /* eslint-disable import/first */

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: "Ilayda's Playground",
  description: 'Ready to start your business in 2024?',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en'>
      <body className={inter.className}>
        <Suspense
          fallback={
            <div className='flex h-svh items-center justify-center'>
              <div className='h-32 w-32 animate-spin rounded-full border-b-2 border-blue-700'></div>
              <div className='absolute text-xl font-semibold'>
                Loading Awesomeness...
              </div>
            </div>
          }
        >
          {children}
        </Suspense>
        <VercelAnalytics />
        <SpeedInsights />
      </body>
      {/* <Hotjar /> */}
      {/* <GoogleAnalytics /> */}
    </html>
  );
}
