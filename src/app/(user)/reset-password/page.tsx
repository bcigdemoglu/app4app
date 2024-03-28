import { getAuthUserAndProfile } from '@/utils/userActions';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { logout } from '../my-account/actions';
import { resetPassword } from './actions';

export default async function ResetPasswordPage() {
  const { user } = await getAuthUserAndProfile();
  if (!user) {
    redirect('/register');
  }

  return (
    <div>
      <div className='space-y-2 text-center'>
        <h2 className='text-3xl font-extrabold text-zinc-900'>
          Your Cool New Password
        </h2>
        <p className='text-zinc-500'>Please reset your password</p>
      </div>

      <form className='space-y-6'>
        <div>
          <label
            htmlFor={'password'}
            className='block text-sm font-medium text-zinc-700'
          >
            {'password'}
          </label>
          <input
            type='password'
            name={'password'}
            id={'password'}
            required
            className='mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 placeholder-zinc-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500'
          />
        </div>

        {user?.email && (
          <div>
            <span className='block text-sm font-medium text-zinc-700'>
              Email: {user.email}
            </span>
          </div>
        )}

        <div>
          <button
            formAction={resetPassword}
            type='submit'
            className='flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2'
          >
            Reset Password
          </button>
        </div>

        <div>
          <Link href='/playground'>
            <button className='flex w-full justify-center rounded-md border border-transparent bg-orange-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-orange-800 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2'>
              Go to Playground!
            </button>
          </Link>
        </div>

        <div>
          <button
            formAction={logout}
            type='submit'
            className='flex w-full justify-center rounded-md border border-transparent bg-black px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2'
          >
            Log out
          </button>
        </div>
      </form>
    </div>
  );
}
