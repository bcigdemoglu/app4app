import { ExtendedRecordMap, Block } from 'notion-types';
import { LessonMap } from '@/app/lib/types';

export const LESSON_MAP: LessonMap = {
  '1': {
    id: '1',
    notionId: 'b57f92a1577e48fcae50a841889968a3',
    title: 'Lesson 0: Live Page',
    description: 'How to commit to your idea?',
    prev: null,
    next: '2',
  },
  '2': {
    id: '2',
    notionId: '5186495d873648d48ad0061e433b2caa',
    title: 'Lesson 1: Commitment',
    description: 'How to commit to your idea?',
    prev: null,
    next: '3',
  },
  '3': {
    id: '3',
    notionId: '8060ad9aaa5e44dfa4086af80f18dc3c',
    title: 'Lesson 2: Reality',
    description: "What's the reality of your idea?",
    prev: '2',
    next: null,
  },
  teachable: {
    id: 'teachable',
    notionId: '1271d4fa33d44955995843af0b4cda92',
    title: 'Lesson 1: SMART',
    description: 'What are your SMART goals?',
    prev: '1',
    next: '2',
  },
};

const extractMarkdownBlocks = (recordMap: ExtendedRecordMap): Block[] => {
  const result: Block[] = [];
  for (const key in recordMap.block) {
    const block = recordMap.block[key];
    if (block.value.properties?.language?.[0]?.[0] === 'Markdown') {
      result.push(block.value);
    }
  }
  return result;
};

const extractMarkdownText = (block: Block): string => {
  return block.properties?.title?.[0]?.[0];
};

export const getLessonInputMDX = (recordMap: ExtendedRecordMap) => {
  return (
    extractMarkdownBlocks(recordMap)
      .map((b) => extractMarkdownText(b))
      ?.at(0) || ''
  );
};

export const getLessonOutputMDX = (recordMap: ExtendedRecordMap) => {
  return (
    extractMarkdownBlocks(recordMap)
      .map((b) => extractMarkdownText(b))
      ?.at(1) || ''
  );
};
