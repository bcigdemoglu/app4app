import { fetchExportedOutput } from '@/app/actions';
import Printer from '@/components/Printer';
import { notFound } from 'next/navigation';

interface Props {
  params: { outputId: string };
}

export default async function Page({ params }: Props) {
  const exportedOutputFromDB = await fetchExportedOutput(params.outputId);
  if (!exportedOutputFromDB) notFound();

  const formattedDate = (timestamp: string) =>
    new Date(timestamp).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

  const {
    output: outputHtml,
    view_count: viewCount,
    full_name: fullName,
    created_at: createdAt,
    modified_at: modifiedAt,
  } = exportedOutputFromDB;

  return (
    <div className='container prose m-auto mb-20 flex max-w-4xl flex-col p-4 prose-a:no-underline md:pt-20'>
      <div className='pb-2 text-sm italic'>
        <p>
          Created by <b>{fullName}</b> on <b>{formattedDate(createdAt)}</b>
        </p>
        <p>
          Last updated on <b>{formattedDate(modifiedAt)}</b>
        </p>
        <p>
          👁️👁️ Viewed by <b>{viewCount}</b> people 👁️👁️
        </p>
      </div>
      <div dangerouslySetInnerHTML={{ __html: outputHtml }} />
      <Printer />
    </div>
  );
}
