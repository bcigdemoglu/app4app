export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className='bg-secondary-50 flex min-h-screen overflow-y-auto'>
        <div className='flex w-full items-center justify-center lg:w-1/2'>
          {/* Sign-up Form Section */}
          <div className='mx-auto w-full max-w-md space-y-6'>{children}</div>
        </div>
        <div className='hidden items-center justify-center bg-gradient-to-r from-blue-600 to-blue-800 lg:flex lg:w-1/2'>
          {/* Illustration*/}
          <div className='flex max-w-lg flex-col items-center space-y-8 pb-24'>
            <h1 className='text-center text-5xl font-thin tracking-[-0.025em] text-white'>
              Get Your Idea ✍🏻<br></br>Ready for the Real World 🎯
            </h1>
            <h3 className='text-2xl font-black tracking-[-0.02em] text-white'>
              ilayda.com
            </h3>
          </div>
        </div>
      </div>
    </section>
  );
}
