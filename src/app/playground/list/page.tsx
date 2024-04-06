import { COURSE_MAP } from '@/lib/data';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export default async function Page() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  await supabase.auth.getUser();

  // Once the user is logged in, they must have a profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .single();

  const isAdmin = profile?.plan.toLowerCase() === 'admin';
  if (!isAdmin) {
    notFound();
  }

  return (
    <div className='container prose prose-sm m-auto mb-20 flex max-w-4xl flex-col p-4 prose-a:no-underline md:pt-20'>
      <ul>
        {Object.entries(COURSE_MAP).map(([courseId, course]) => (
          <li key={courseId}>
            <Link href={`/playground/${courseId}`}>
              {`[${course.access}]`} {course.title}
              <br></br>
              {`/playground/${courseId}`}
            </Link>
            <ul>
              {Object.values(course.lessonMap).map((lesson) => (
                <li key={lesson.id} className='flex gap-2'>
                  <Link
                    className='font-extrabold text-green-600'
                    href={`/playground/${courseId}/${lesson.id}/verify`}
                  >
                    {`Verify`}
                  </Link>
                  <Link href={`/playground/${courseId}/${lesson.id}`}>
                    {lesson.title}: {`/playground/${courseId}/${lesson.id}`}
                  </Link>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
}
