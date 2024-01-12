'server-only';

import { redirect } from 'next/navigation';

export const metadata = {
  title: "Ilayda's Playground: How to Start a Business",
  description: 'How to start a busines in 2024',
};

export default function Page() {
  redirect('/playground/1');
}
