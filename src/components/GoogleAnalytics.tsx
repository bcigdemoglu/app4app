import { doNotTrackPath } from '@/lib/data';
import { usePathname } from 'next/navigation';
import Script from 'next/script';

export default function GoogleAnalytics() {
  const pathname = usePathname();

  if (doNotTrackPath(pathname)) {
    return null;
  }

  return (
    <>
      <Script src='https://www.googletagmanager.com/gtag/js?id=G-0FMTHR11XE' />
      <Script id='google-analytics'>
        {`
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());

    gtag('config', 'G-0FMTHR11XE');
  `}
      </Script>
    </>
  );
}
