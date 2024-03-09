import { fetchExportedOutput } from '@/app/actions';
import Printer from '@/components/Printer';
import { notFound } from 'next/navigation';

interface Props {
  params: { outputId: string };
}

export default async function Page({ params }: Props) {
  const exportedOutputHTML = await fetchExportedOutput(params.outputId);
  if (!exportedOutputHTML) notFound();

  return (
    <div className='lg:prose-xs container prose m-auto mb-20 flex max-w-4xl flex-col p-4 pt-32 prose-a:no-underline'>
      <div dangerouslySetInnerHTML={{ __html: exportedOutputHTML }} />
      <Printer />
    </div>
  );
}
