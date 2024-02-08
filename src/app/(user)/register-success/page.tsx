import Link from 'next/link';

export default function RegisterSuccessPage() {
  return (
    <div>
      <div className='space-y-2 text-center'>
        <h2 className='text-3xl font-extrabold text-zinc-900'>Email sent!</h2>
        <p className='text-zinc-500'>
          Please check your email for sign up confirmation.
        </p>
      </div>

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
