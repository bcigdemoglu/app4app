import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Hotjar from './components/Hotjar';
// import { GoogleAnalytics } from '@next/third-parties/google';

// core styles shared by all of react-notion-x (required)
import 'react-notion-x/src/styles.css';
// used for code syntax highlighting (optional)
import 'prismjs/themes/prism-tomorrow.css';
// used for rendering equations (optional)
import 'katex/dist/katex.min.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: "Ilayda's Website",
  description: 'Ready to start your business in 2024?',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en'>
      <body className={inter.className}>{children}</body>
      <Hotjar />
      {/* <GoogleAnalytics gaId='G-XYZ' /> */}
    </html>
  );
}
