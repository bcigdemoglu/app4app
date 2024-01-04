import Link from 'next/link';
import Navbar from '@/app/components/Navbar';

export default function Home() {
  return (
    <>
      <Navbar />

      <div
        id='hero'
        className='grid grid-cols-2 place-items-center gap-4 bg-white p-8'
      >
        <div id='hero-left' className='space-y-4'>
          <h1 className='text-4xl font-bold'>EMPOWER YOUR BUSINESS IDEA</h1>
          <p className='text-base'>
            Join a nurturing environment to grow your business concepts.
          </p>
          <Link
            href='/playground'
            id='join-playground-btn'
            className='rounded-md bg-blue-600 px-4 py-2 text-white'
          >
            Join Playground
          </Link>
        </div>
        <div id='hero-right' className='max-w-xs'>
          <h2 className='mb-4 text-3xl font-bold'>
            Discover the Playground Platform
          </h2>
          <form id='idea-signup-form' className='flex flex-col space-y-3'>
            <input
              type='email'
              placeholder='Email'
              className='rounded-md border p-2'
            />
            <input
              type='text'
              placeholder='Your Business Idea'
              className='rounded-md border p-2'
            />
            <button
              type='submit'
              className='rounded-md bg-purple-600 px-4 py-2 text-white'
            >
              Get Started
            </button>
          </form>
        </div>
      </div>

      <div id='about-us' className='bg-blue-900 p-12 text-center text-white'>
        <div id='about-us-top'>
          <div className='inline-block overflow-hidden rounded-full border-4 border-white'>
            <img
              src='https://media.licdn.com/dms/image/D4D03AQHP1faoUtfRkA/profile-displayphoto-shrink_200_200/0/1694772225626?e=2147483647&v=beta&t=Soe1jP4xQLpe_2bNVujg4iYN_jz7J-wn5w5hqFuvCjY'
              alt='Profile'
              className='h-32 w-32 object-cover'
            />
          </div>
          <h1 className='mt-4 text-3xl'>
            Hi—I&apos;m Ilayda Buyukdogan. I empower entrepreneurs to bring
            their business ideas to life.
          </h1>
        </div>
        <div id='about-us-bottom' className='mt-4'>
          <a href='#' className='text-teal-300 underline'>
            [ An open letter to freedom seekers ]
          </a>
          <p>
            As an indie hacker, my mission is to nurture and guide idea owners
            through their entrepreneurial journey.
          </p>
          <p className='mt-4'>
            The focus isn&apos;t just on making money, but on creating
            innovative and impactful business ideas that resonate with your
            vision.
          </p>
        </div>
      </div>

      <div className='grid grid-cols-2 bg-blue-800'>
        <div className='sticky top-0 flex h-screen items-center p-8 text-white'>
          <h2 className='text-3xl font-bold'>
            Three more ways I can help you.
          </h2>
        </div>
        <div className='grid grid-cols-1 text-white'>
          <div className='flex min-h-screen flex-col justify-center p-8'>
            <h3 className='text-2xl font-bold'>01</h3>
            <h4 className='text-xl font-bold'>Weekly Playground Insights</h4>
            <p>
              Receive weekly insights on nurturing and refining your business
              ideas, straight from the Playground.
            </p>
          </div>
          <div className='flex min-h-screen flex-col justify-center p-8'>
            <h3 className='text-2xl font-bold'>02</h3>
            <h4 className='text-xl font-bold'>
              Interactive Workshops for Entrepreneurs
            </h4>
            <p>
              Join our workshops to learn, interact, and evolve your business
              concepts in real-time.
            </p>
          </div>
          <div className='flex min-h-screen flex-col justify-center p-8'>
            <h3 className='text-2xl font-bold'>03</h3>
            <h4 className='text-xl font-bold'>Personalized Idea Evaluation</h4>
            <p>
              Get direct feedback on your business ideas from Ilayda and the
              Playground community.
            </p>
          </div>
        </div>
      </div>

      <div
        id='demo'
        className='grid grid-cols-2 place-items-center gap-4 bg-purple-900 p-8 text-white'
      >
        <div className='rounded-lg bg-black p-4'>
          <p className='h-32 w-auto text-yellow-400'>
            Interactive Demo: Experience tools that bring your ideas to life.
          </p>
        </div>
        <div className='max-w-md'>
          <h2 className='mb-4 text-2xl font-bold'>
            Try Our Interactive Playground
          </h2>
          <p>
            Get a hands-on experience with our unique tools designed to enhance
            and evaluate your business ideas.
          </p>
          <Link href='/playground'>
            <button className='mt-4 rounded-md bg-yellow-500 px-4 py-2 text-black'>
              Explore Now
            </button>
          </Link>
        </div>
      </div>

      <div
        id='start-for-free'
        className='grid grid-cols-2 place-items-center gap-4 bg-purple-700 p-8 text-white'
      >
        <div className='flex space-x-4'>
          <img
            src='https://i.pinimg.com/736x/a3/90/ff/a390ffeb79349a5777e0c7c9b929ef32.jpg'
            alt='Person 1'
            className='h-32 w-auto rounded-full border-4 border-yellow-500'
          />
          <img
            src='https://pics.craiyon.com/2023-07-15/8a97ba59f4234b6a90a5533af4426da2.webp'
            alt='Person 2'
            className='h-32 w-auto rounded-full border-4 border-yellow-500'
          />
        </div>
        <div className='max-w-lg'>
          <h2 className='mb-4 text-2xl font-bold'>Join Playground for Free</h2>
          <p>
            Curious about transforming your business idea into reality? Sign up
            for free and start exploring the Playground.
          </p>
          <Link href='/playground'>
            <button className='mt-4 rounded-md bg-yellow-500 px-4 py-2 text-black'>
              Get Started
            </button>
          </Link>
        </div>
      </div>

      <div
        id='cta'
        className='grid grid-cols-2 place-items-center gap-4 bg-blue-900 p-8 text-white'
      >
        <div className='max-w-lg'>
          <h2 className='mb-4 text-2xl font-bold'>
            Elevate Your Business Idea
          </h2>
          <p>
            Discover how the Playground can help you refine, develop, and launch
            your business ideas to new heights.
          </p>
          <Link href='/blog'>
            <button className='mt-4 rounded-md bg-yellow-500 px-4 py-2 text-black'>
              Learn More
            </button>
          </Link>
        </div>
        <div className=''>
          <img
            src='https://static.vecteezy.com/system/resources/thumbnails/009/344/446/small/3ds-hexagon-block-align-to-many-shape-blank-block-for-add-your-text-or-wording-png.png'
            alt='Person 1'
            className='h-32 w-auto'
          />
        </div>
      </div>

      <footer className='bg-white text-black'>
        <div className='container mx-auto p-8'>
          <div className='grid grid-cols-2 gap-8 md:grid-cols-4'>
            <div>
              <h3 className='mb-3 text-lg font-bold'>Playground</h3>
              <ul>
                <li>
                  <a href='#idea-lab' className='hover:text-gray-300'>
                    Idea Lab
                  </a>
                </li>
                <li>
                  <a href='/playground' className='hover:text-gray-300'>
                    Playground Platform
                  </a>
                </li>
                <li>
                  <a href='#demo' className='hover:text-gray-300'>
                    Interactive Demo
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className='mb-3 text-lg font-bold'>Resources</h3>
              <ul>
                <li>
                  <a href='#blog' className='hover:text-gray-300'>
                    Insights
                  </a>
                </li>
                <li>
                  <a href='#about-us' className='hover:text-gray-300'>
                    About Ilayda
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className='mb-3 text-lg font-bold'>Get in Touch</h3>
              <ul>
                <li>
                  <a
                    href='mailto:info@ilayda.com'
                    className='hover:text-gray-300'
                  >
                    Email
                  </a>
                </li>
                <li>
                  <a
                    href='https://twitter.com/ilaydabdogan'
                    className='hover:text-gray-300'
                  >
                    Twitter
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className='mb-3 text-lg font-bold'>Legal</h3>
              <ul>
                <li>
                  <a href='#privacy-policy' className='hover:text-gray-300'>
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href='#terms-of-service' className='hover:text-gray-300'>
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className='mt-8 text-center'>
            <p>© 2024 Ilayda Buyukdogan. All Rights Reserved.</p>
          </div>
        </div>
      </footer>
    </>
  );
}
