export default function Widget() {
  return (
    <div className='flex flex-col items-center gap-4 p-4'>
      <input
        type='number'
        id='numberCourses'
        placeholder="What's your total number of courses?"
        className='input w-full rounded-lg border border-gray-300 p-2'
      />
      <input
        type='number'
        id='averageCoursePrice'
        placeholder='On average, how much do you charge per course (USD)?'
        className='input hidden w-full rounded-lg border border-gray-300 p-2'
      />
      <input
        type='number'
        id='digitalDownloads'
        placeholder='How many courses include digital downloads?'
        className='input hidden w-full rounded-lg border border-gray-300 p-2'
      />
      <input
        type='number'
        id='expectedSales'
        placeholder='How many course sales do you expect in 2024?'
        className='input hidden w-full rounded-lg border border-gray-300 p-2'
      />
      <input
        type='number'
        id='expectedStudents'
        placeholder='How many students do you expect in 2024?'
        className='input hidden w-3/4 rounded-lg border border-gray-300 p-2'
      />
      <button
        id='calculateIncome'
        className='btn rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700'
      >
        Calculate my Potential Passive Income with Cloudybook
      </button>
      <div id='outputBox' className='mt-4 hidden text-lg text-gray-800'>
        Potential annual passive income with 1 hour of content prep:{' '}
        <span className='text-green-700' id='potentialEarningsOut'></span> USD!
      </div>
      <button
        id='unlockOffer'
        className='btn hidden rounded bg-green-500 px-4 py-2 font-bold text-white hover:bg-green-700'
      >
        Boost my Earnings!
      </button>
    </div>
  );
}
