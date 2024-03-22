// 'use client';
// import { usePathname } from 'next/navigation';
// import Link from 'next/link';
// import { MDXRemote, MDXRemoteSerializeResult } from 'next-mdx-remote';

// export default function ExportOutputModal({
//   startExport,
// }: {
//   outputHTML: MDXRemoteSerializeResult;
// }) {
//   return (
//     <dialog className='fixed left-0 top-0 z-50 flex h-full w-full items-center justify-center overflow-auto bg-black bg-opacity-50 backdrop-blur'>
//       <div className='m-auto bg-white p-8'>
//         <div className='prose flex flex-col'>
//             <button type='button' className='bg-green-500 p-2 text-white'>
//               Go Public
//             </button>
//             <button type='button' className='bg-orange-500 p-2 text-white'>
//               Private Link
//             </button>
//         </div>
//       </div>
//     </dialog>
//   );
// }
