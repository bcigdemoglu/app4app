import Link from 'next/link';
import { register } from './actions';
import { getAuthUser } from '@/app/utils/userActions';
import { redirect } from 'next/navigation';

export default async function RegisterPage() {
  const user = await getAuthUser();
  if (user) {
    redirect('/my-account');
  }

  return (
    <div>
      <div className='space-y-2 text-center'>
        <h2 className='text-3xl font-extrabold text-zinc-900'>Sign up</h2>
        <p className='text-zinc-500'>Create your free Playground account</p>
      </div>

      <div className='space-y-4'>
        <button
          type='button'
          className='flex w-full items-center justify-center rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 shadow-sm hover:bg-zinc-50'
        >
          <span className='mr-3'>[Google Icon SVG]</span>{' '}
          {/* Replace [Google Icon SVG] with the actual SVG */}
          Sign up with Google
        </button>

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
            htmlFor='firstname'
            className='block text-sm font-medium text-zinc-700'
          >
            First Name
          </label>
          <input
            type='text'
            name='firstname'
            id='firstname'
            autoComplete='firstname'
            required
            className='mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 placeholder-zinc-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500'
            placeholder='First Name'
          />
        </div>
        <div>
          <label
            htmlFor='lastname'
            className='block text-sm font-medium text-zinc-700'
          >
            Last Name
          </label>
          <input
            type='text'
            name='lastname'
            id='lastname'
            autoComplete='lastname'
            required
            className='mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 placeholder-zinc-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500'
            placeholder='Last Name'
          />
        </div>

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
            formAction={register}
            type='submit'
            className='flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2'
          >
            Create Account
          </button>
        </div>
      </form>

      <div className='mt-4 text-center text-sm text-zinc-500'>
        Already have an account?{' '}
        <Link
          href='/login'
          className='font-medium text-indigo-600 hover:text-indigo-500'
        >
          Login here.
        </Link>
      </div>
    </div>
  );
}
