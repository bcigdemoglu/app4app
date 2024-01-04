'use client';

import { useEffect, useState } from 'react';
import NotionPage from './components/NotionPage';

type InputProps = {
  label: string;
  value: any;
  setValue: (_value: any) => void;
};

function Input({ label, value, setValue }: InputProps) {
  return (
    <input
      type='text'
      value={value}
      onChange={(e) => {
        setValue(e.target.value);
      }}
      className='border p-1 text-blue-950'
      placeholder={`Your ${label}`}
    />
  );
}

async function getNotionRecordMap() {
  try {
    const res = await fetch('/api/notion', {
      cache: 'no-store',
    });
    console.log(res);
    const recordMap = await res.json();
    console.log(recordMap);
    return recordMap;
  } catch (err) {
    return null;
  }
}

export default function Page() {
  const [name, setName] = useState('');
  const [reason, setReason] = useState('');
  const [action, setAction] = useState('');
  const [sentence, setSentence] = useState('Your sentence will appear here...');
  const [recordMap, setRecordMap] = useState<any>(null);

  useEffect(() => {
    async function fetchPage() {
      /// TODOOOOO: DO NOT FETCH IN A "USE CLIENT" PAGE!!!! LOOK FOR EXAMPLES!!!!!!
      const recordMap = await getNotionRecordMap();
      console.log('recordmap ready:', recordMap);
      if (recordMap) {
        setRecordMap(recordMap);
      }
    }
    fetchPage();
  }, []);

  const updateSentence = () => {
    if (name && reason && action) {
      setSentence(
        `I ${name}, am committed to start working on my idea. The reason I want to work on my idea is ${reason} and I will ${action}.`
      );
    }
  };

  return (
    <main className='grid h-screen grid-cols-3 gap-2 bg-white p-4'>
      {/* Left Column */}
      <div className='overflow-auto border bg-white p-4'>
        {recordMap ? (
          <NotionPage recordMap={recordMap}></NotionPage>
        ) : (
          <span>
            {'Notion page appears here... I love you Ilom. '.repeat(100)}
          </span>
        )}
      </div>

      {/* Middle Column */}
      <div className='flex flex-col border bg-blue-950 p-4 text-white'>
        <p>
          I <Input label='Name' value={name} setValue={setName} />, am committed
          to start working on my idea. The reason I want to work on my idea is{' '}
          <Input label='Reason' value={reason} setValue={setReason} /> and I
          will <Input label='Action' value={action} setValue={setAction} />.
        </p>

        <button
          className='bottom-0 mt-auto rounded bg-green-500 p-2 text-white'
          onClick={updateSentence}
        >
          Send
        </button>
      </div>

      {/* Right Column */}
      <div className='border bg-gray-100 p-4'>{sentence}</div>
    </main>
  );
}
