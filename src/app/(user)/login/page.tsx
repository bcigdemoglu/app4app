import { getAuthUser } from '@/utils/userActions';
import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { handleLogInWithGoogle, login } from './actions';

export default async function LoginPage() {
  const user = await getAuthUser();
  if (user) {
    redirect('/my-account');
  }

  return (
    <div>
      <div className='space-y-5'>
        <h2 className='text-3xl font-extrabold text-zinc-900'>Welcome back</h2>
        <p className='text-zinc-500'>Login to continue building</p>
        <form>
          <button
            formAction={handleLogInWithGoogle}
            type='submit'
            className='flex w-full items-center justify-center rounded-md border border-zinc-300 bg-white px-4 py-2 font-medium text-zinc-700 shadow-sm hover:bg-zinc-50'
          >
            <Image
              src='/google.svg'
              alt='Google icon'
              width={28}
              height={28}
              className='mr-2'
            />
            Log in with Google
          </button>
        </form>

        <div className='flex items-center justify-center'>
          <div className='t-2 h-px flex-grow bg-zinc-300'></div>
          <span className='mx-4 flex-shrink text-zinc-500'>
            Or continue with
          </span>
          <div className='t-2 h-px flex-grow bg-zinc-300'></div>
        </div>
      </div>

      <form className='space-y-6'>
        <div>
          <label
            htmlFor='email'
            className='block text-sm font-medium text-zinc-700'
          >
            Email address
          </label>
          <input
            type='email'
            name='email'
            id='email'
            autoComplete='email'
            required
            className='mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 placeholder-zinc-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500'
            placeholder='you@example.com'
          />
        </div>

        <div>
          <label
            htmlFor='password'
            className='block text-sm font-medium text-zinc-700'
          >
            Password
          </label>
          <input
            type='password'
            name='password'
            id='password'
            autoComplete='current-password'
            required
            className='mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 placeholder-zinc-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500'
            placeholder='Password'
          />
        </div>

        <div>
          <button
            formAction={login}
            type='submit'
            className='flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2'
          >
            Login
          </button>
        </div>
      </form>

      <div className='mt-4 text-sm'>
        <Link
          href='/send-reset-password'
          className='font-medium text-indigo-600 hover:text-indigo-500'
        >
          Forgot password?
        </Link>
      </div>

      <div className='mt-4 text-sm text-zinc-500'>
        {"Don't have an account? "}
        <Link
          href='/register'
          className='font-medium text-indigo-600 hover:text-indigo-500'
        >
          Sign up here.
        </Link>
      </div>
    </div>
  );
}
