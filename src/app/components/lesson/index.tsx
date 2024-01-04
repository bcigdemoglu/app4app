'use client';

import { useEffect, useState } from 'react';

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

export function Lesson1Output() {
  const [lesson1, setLesson1] = useState('');

  useEffect(() => {
    // Function to update state based on localStorage
    const updateStateFromLocalStorage = () => {
      const storedValue = localStorage.getItem('lesson1');
      if (storedValue) {
        setLesson1(storedValue);
      }
    };

    // Call the function to update state when component mounts
    if (typeof window !== 'undefined') {
      updateStateFromLocalStorage();
    }

    const handleStorageChange = () => {
      updateStateFromLocalStorage();
    };

    // Add event listener for localStorage changes
    window.addEventListener('storage', handleStorageChange);

    // Cleanup function
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return (
    <div className='border bg-gray-100 p-4'>
      <p>{lesson1}</p>
    </div>
  );
}

export function Lesson1() {
  const [name, setName] = useState('');
  const [reason, setReason] = useState('');
  const [action, setAction] = useState('');

  useEffect(() => {
    if (!localStorage.getItem('lesson1')) {
      localStorage.setItem('lesson1', 'Your sentence will appear here...');
    }
  }, []);

  const updateSentence = () => {
    if (name && reason && action) {
      const newSentence = `I ${name}, am committed to start working on my idea. The reason I want to work on my idea is ${reason} and I will ${action}.`;
      localStorage.setItem('lesson1', newSentence);
    }
  };

  return (
    <div className='flex flex-col border bg-blue-950 p-4 text-white'>
      <p>
        I <Input label='Name' value={name} setValue={setName} />, am committed
        to start working on my idea. The reason I want to work on my idea is{' '}
        <Input label='Reason' value={reason} setValue={setReason} /> and I will{' '}
        <Input label='Action' value={action} setValue={setAction} />.
      </p>

      <button
        className='bottom-0 mt-auto rounded bg-green-500 p-2 text-white'
        onClick={updateSentence}
      >
        Send
      </button>
    </div>
  );
}
