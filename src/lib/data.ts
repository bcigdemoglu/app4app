import { ExtendedRecordMap, Block } from 'notion-types';
import { LessonMap, CourseMap, AIFeedbackMap } from '@/lib/types';

export const DEMO_LESSON_MAP: LessonMap = {
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
  smart: {
    id: 'smart',
    notionId: '1271d4fa33d44955995843af0b4cda92',
    title: 'Lesson 1: SMART',
    description: 'What are your SMART goals?',
    prev: null,
    next: 'ilayda1',
  },
  ilayda1: {
    id: 'ilayda1',
    notionId: '605044ae6a9d4c42afc7ddb6b4a6cced',
    title: 'Lesson Ilayda 1: GENIUS',
    description: 'Ilayda to impress',
    prev: 'smart',
    next: 'ilayda2',
  },
  ilayda2: {
    id: 'ilayda2',
    notionId: '66e8502d68b4476cabad402e1c9f62a0',
    title: 'Lesson Ilayda 2: AMAZING',
    description: 'Universe to impress ilayda',
    prev: 'ilayda1',
    next: null,
  },
};

export const COURSE_MAP: CourseMap = {
  demo: {
    id: 'demo',
    title: 'Demo Course',
    description: 'This is a demo course to impress creators',
    lessonMap: DEMO_LESSON_MAP,
  },
};

export const CREATOR_MODAL_PARAM = 'feedback';

export const AI_MODAL_PARAM = 'ai';

export const DEMO_LESSON_AI_FEEDBACK: AIFeedbackMap = {
  smart: {
    mdx: `
    Greetings from your AI coach! 🤖

    You've done a commendable job applying the SMART goals framework to your objective of increasing newsletter leads from your blog. Your approach is well-structured, demonstrating a solid understanding of how to set effective and actionable goals. Here are a few suggestions to make your plan even more robust:

    - **Specificity in Action Steps:** While you've defined what you want to achieve, consider detailing specific strategies or actions you will implement to increase newsletter subscribers. For instance, you could outline particular promotional activities or content adjustments to attract more sign-ups.
    - **Measurable Milestones:** You've set a 10% increase as your target, which is great. To enhance this, you could establish intermediate milestones to track progress and make adjustments if needed. For example, setting monthly check-ins to evaluate your growth rate and strategy effectiveness.
    - **Expand on Relevancy:** You've linked the goal to your course launch, which is excellent. To deepen this connection, you could explain how the newsletter's content will align with the course's themes or offer, providing value to subscribers and nurturing their interest in your upcoming launch.

    These enhancements will not only refine your goal-setting process but also increase your chances of achieving your desired outcomes. Keep up the great work!
    `,
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

const sectionToIndex = (section: number) => ({
  inputIndex: (section - 1) * 2,
  outputIndex: (section - 1) * 2 + 1,
});

export const getLessonTotalSections = (
  recordMap: ExtendedRecordMap
): number => {
  return (
    extractMarkdownBlocks(recordMap).map((b) => extractMarkdownText(b))
      ?.length / 2 || 0
  );
};

export const getLessonInputMDX = (
  recordMap: ExtendedRecordMap,
  section: number
) => {
  return (
    extractMarkdownBlocks(recordMap)
      .map((b) => extractMarkdownText(b))
      ?.at(sectionToIndex(section).inputIndex) || ''
  );
};

export const getLessonOutputMDX = (
  recordMap: ExtendedRecordMap,
  section: number
) => {
  return (
    extractMarkdownBlocks(recordMap)
      .map((b) => extractMarkdownText(b))
      ?.at(sectionToIndex(section).outputIndex) || ''
  );
};
