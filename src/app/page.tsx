"use client";

import { useEffect, useState } from "react";
import NotionPage from "./components/NotionPage";

type InputProps = {
  label: string;
  value: any;
  setValue: (value: any) => void;
};

function Input({ label, value, setValue }: InputProps) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => {
        setValue(e.target.value);
      }}
      className="border p-1 text-blue-950"
      placeholder={`Your ${label}`}
    />
  );
}

async function getNotionRecordMap() {
  try {
    const res = await fetch("/api/notion", {
      cache: "no-store",
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
  const [name, setName] = useState("");
  const [reason, setReason] = useState("");
  const [action, setAction] = useState("");
  const [sentence, setSentence] = useState("Your sentence will appear here...");
  const [recordMap, setRecordMap] = useState<any>(null);

  useEffect(() => {
    async function fetchPage() {
      /// TODOOOOO: DO NOT FETCH IN A "USE CLIENT" PAGE!!!! LOOK FOR EXAMPLES!!!!!!
      const recordMap = await getNotionRecordMap();
      console.log("recordmap ready:", recordMap);
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
    <main className="p-4 grid grid-cols-3 gap-2 h-screen bg-white">
      {/* Left Column */}
      <div className="border p-4 bg-white overflow-auto">
        {recordMap ? (
          <NotionPage recordMap={recordMap}></NotionPage>
        ) : (
          <span>
            {"Notion page appears here... I love you Ilom. ".repeat(100)}
          </span>
        )}
      </div>

      {/* Middle Column */}
      <div className="flex flex-col border p-4 bg-blue-950 text-white">
        <p>
          I <Input label="Name" value={name} setValue={setName} />, am committed
          to start working on my idea. The reason I want to work on my idea is{" "}
          <Input label="Reason" value={reason} setValue={setReason} /> and I
          will <Input label="Action" value={action} setValue={setAction} />.
        </p>

        <button
          className="mt-auto bottom-0 bg-green-500 text-white p-2 rounded"
          onClick={updateSentence}
        >
          Send
        </button>
      </div>

      {/* Right Column */}
      <div className="border p-4 bg-gray-100">{sentence}</div>
    </main>
  );
}
