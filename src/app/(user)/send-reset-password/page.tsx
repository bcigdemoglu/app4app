import Link from 'next/link';
import { sendResetPasswordEmail } from './actions';

export default function SendResetPasswordPage() {
  return (
    <div>
      <div className='space-y-2 text-center'>
        <h2 className='text-3xl font-extrabold text-zinc-900'>
          Your Cool New Password
        </h2>
        <p className='text-zinc-500'>Send an email to reset your password</p>
      </div>

      <form className='space-y-6'>
        <div>
          <label
            htmlFor={'email'}
            className='block text-sm font-medium text-zinc-700'
          >
            {'Email'}
          </label>
          <input
            type='email'
            name={'email'}
            id={'email'}
            required
            className='mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 placeholder-zinc-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500'
          />
        </div>

        <div>
          <button
            formAction={sendResetPasswordEmail}
            type='submit'
            className='flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2'
          >
            Send Reset Password Email
          </button>
        </div>
      </form>
      <div className='mt-4 text-sm text-zinc-500'>
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
