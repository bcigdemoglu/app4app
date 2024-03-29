'server-only';

import { allPosts } from 'contentlayer/generated';
import dayjs from 'dayjs';
import { Metadata } from 'next';
import { useMDXComponent } from 'next-contentlayer/hooks';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { BlogMDXComponents } from '@/components/mdx';

export function generateStaticParams(): Array<Props['params']> {
  return allPosts.map((post) => ({ slug: post.slug }));
}

interface Props {
  params: { slug: string };
}

export function generateMetadata({ params }: Props): Metadata | null {
  const post = allPosts.find((post) => post.slug === params.slug);

  if (!post) return null;

  return {
    title: post.title,
    description: post.description,
    authors: { name: post.author },
    openGraph: {
      title: post.title,
      description: post.description,
      images: post.image,
    },
    metadataBase: new URL('https://www.ilayda.com'),
  };
}

export default function Page({ params }: Props) {
  const post = allPosts.find((post) => post.slug === params.slug);

  if (!post) notFound();

  const MDXContent = useMDXComponent(post.body.code);

  return (
    <>
      <Navbar />
      <div className='lg:prose-xs container prose m-auto mb-20 max-w-4xl p-4 pt-14'>
        <>
          <figure>
            {post.image && (
              <Image
                src={post.image}
                alt={post.imageAlt ?? ''}
                className='mt-8 rounded-xl'
                height={400}
                width={900}
              />
            )}
          </figure>
          <section className='-mx-8 flex flex-wrap gap-4 rounded-xl px-8'>
            <div className='w-full grow'>
              <h1 className='m-0 text-2xl leading-snug sm:text-4xl sm:leading-normal'>
                {post.title}
              </h1>
              <p className='m-2 ml-0'>
                by <b>{post.author}</b> &middot;{' '}
                {dayjs(post.date).format('MM/DD/YYYY')}
              </p>
            </div>
            {/* <div className="flex flex-wrap gap-2">
						{post.tags.map((tag) => (
							<BlogTag key={tag} name={tag} />
						))}
					</div> */}
          </section>
          <article id='content' className='text-lg'>
            <MDXContent components={BlogMDXComponents} />
          </article>
        </>
      </div>
    </>
  );
}
