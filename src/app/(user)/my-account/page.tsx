import { isLoggedIn } from '@/app/utils/userHelpers';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createClient } from '@/app/utils/supabase/server';
import { updateProfile, logout } from './actions';

function InputField({
  name,
  label,
  defaultValue,
}: {
  name: string;
  label: string;
  defaultValue?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className='block text-sm font-medium text-zinc-700'>
        {label}
      </label>
      <input
        type='text'
        name={name}
        id={name}
        autoComplete={name}
        required
        className='mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 placeholder-zinc-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500'
        defaultValue={defaultValue}
      />
    </div>
  );
}

export default async function RegisterPage() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const user = await supabase.auth.getUser();
  if (!isLoggedIn(user)) {
    redirect('/register');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .single();

  return (
    <div>
      <div className='space-y-2 text-center'>
        <h2 className='text-3xl font-extrabold text-zinc-900'>My account</h2>
        <p className='text-zinc-500'>
          {profile ? 'Update your profile' : 'Please complete your profile'}
        </p>
      </div>

      <form className='space-y-6'>
        <InputField
          name='firstname'
          label='First Name'
          defaultValue={profile?.firstname}
        />
        <InputField
          name='lastname'
          label='Last Name'
          defaultValue={profile?.lastname}
        />

        {profile && (
          <div>
            <span className='block text-sm font-medium text-zinc-700'>
              Plan: {profile?.plan}
            </span>
          </div>
        )}

        {user.data.user?.email && (
          <div>
            <span className='block text-sm font-medium text-zinc-700'>
              Email: {user.data.user.email}
            </span>
          </div>
        )}

        <div>
          <button
            formAction={updateProfile}
            type='submit'
            className='flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2'
          >
            {profile ? 'Update Profile' : 'Create Profile'}
          </button>
        </div>

        <div>
          <button
            formAction={logout}
            type='submit'
            className='flex w-full justify-center rounded-md border border-transparent bg-gray-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2'
          >
            Log out
          </button>
        </div>
      </form>
    </div>
  );
}
