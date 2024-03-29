import { AIFeedbackMap, CourseMap, LessonMap } from '@/lib/types';
import { Metadata } from 'next';
import { Block, ExtendedRecordMap } from 'notion-types';

export const genMetadata = (title: string, description: string): Metadata => ({
  metadataBase: new URL('https://app.cloudybook.com'),
  title,
  description,
  openGraph: {
    title,
    description,
    images: '/cloudybook icon.png',
    siteName: 'Cloudybook',
    type: 'website',
  },
});

export const DEMO_LESSON_MAP: LessonMap = {
  smart: {
    id: 'smart',
    notionId: '1271d4fa33d44955995843af0b4cda92',
    title: 'Lesson 1: SMART Goals',
    description: 'What are your SMART goals?',
    prev: null,
    next: 'action',
    order: 0,
  },
  action: {
    id: 'action',
    notionId: '46cc313dbbe0497f88dbcf9d2c700a43',
    title: 'Lesson 2: Action Plan',
    description: 'What is your action plan?',
    prev: 'smart',
    next: null,
    order: 1,
  },
  persona: {
    id: 'persona',
    notionId: 'd6e80168be0e47739b9dc934406e40d8',
    title: 'Lesson 1: Building a Customer Persona',
    description: 'Build a Customer Persona for Course Creators',
    prev: null,
    next: null,
    order: 0,
  },
  affirmation: {
    id: 'affirmation',
    notionId: '605044ae6a9d4c42afc7ddb6b4a6cced',
    title: 'Lesson 1: Affirmation Generator',
    description: 'Affirm yourself',
    prev: null,
    next: null,
    order: 0,
  },
  ilayda2: {
    id: 'ilayda2',
    notionId: '66e8502d68b4476cabad402e1c9f62a0',
    title: 'Lesson Ilayda 2: AMAZING',
    description: 'Universe to impress ilayda',
    prev: 'ilayda1',
    next: 'supershortpage',
    order: 1,
  },
  supershortpage: {
    id: 'supershortpage',
    notionId: '371627a158454d5bbed5f2a45bc487a4',
    title: 'Lesson: Super Short Page',
    description: 'This is a super short page',
    prev: 'ilayda2',
    next: null,
    order: 7,
  },
  businessimprovementplan: {
    id: 'businessimprovementplan',
    notionId: '18a54ccc0e8945caac723b32c5746a70',
    title: 'Lesson: Improvement Plan',
    description: 'This is a super short page',
    prev: 'ilayda2',
    next: null,
    order: 8,
  },
};

export const BIP_LESSON_MAP: LessonMap = {
  frontpage: {
    id: 'frontpage',
    notionId: '1e2c9647574643e4a9e16d205521fb1e',
    title: 'Front Page',
    prev: null,
    next: 'foreword',
    order: 0,
  },
  foreword: {
    id: 'foreword',
    notionId: '1ba74abf28444ca78efabb562ac8bb73',
    title: 'Foreword',
    prev: 'frontpage',
    next: 'currentstate',
    order: 1,
  },
  currentstate: {
    id: 'currentstate',
    notionId: '4a840b6f793848569701085af2bdf2d8',
    title: 'Current State',
    prev: 'foreword',
    next: null,
    order: 2,
  },
};

export const ITP_LESSON_MAP: LessonMap = {
  'observation-notes': {
    id: 'observation-notes',
    notionId: '69ce8622214b413f90eb2a5dae8eff05',
    title: 'Observation Notes',
    prev: null,
    next: null,
    order: 0,
  },
};

export const COURSE_MAP: CourseMap = {
  demo: {
    id: 'demo',
    title: 'Cloudybook Demo',
    description: 'Welcome to Cloudybook interactive workbook demo',
    access: 'preview',
    lessonMap: DEMO_LESSON_MAP,
  },
  businessimprovementplan: {
    id: 'businessimprovementplan',
    title: 'Business Improvement Plan by Robert Chapman',
    description:
      'The step by step guide to building the most effective plan for your business',
    access: 'private',
    lessonMap: BIP_LESSON_MAP,
  },
  'identify-the-problem': {
    id: 'identify-the-problem',
    title:
      'Identify & Define the Problem with Business Analysis by The BA Guide | Jeremy Aschenbrenner',
    description:
      'Use business analysis techniques to identify a business pain point, find its root cause, and sell the value of fixing it',
    access: 'preview',
    lessonMap: ITP_LESSON_MAP,
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
  action: {
    mdx: `
    Greetings from your AI coach!

    You've done a commendable job applying the SMART goals framework to your objective.

    ### Action Plan:

    * Conduct market research to identify effective marketing strategies and areas for new product development.
    * Develop a detailed marketing plan, including online advertising, partnerships, and social media campaigns, to increase course visibility.
    * Plan and create two new digital products, such as eBooks or online toolkits, that provide additional value to your course attendees.
    * Set up a timeline for each milestone, including marketing campaign launches, product development phases, and final product releases.
    * Regularly review progress against goals, making adjustments as necessary to ensure success within the set timeframe.

    By following this structured approach, the course creator will have a clear path toward increasing their course signups and expanding their digital product offerings, ultimately boosting their passive income.
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
  return Math.max(
    Math.ceil(
      extractMarkdownBlocks(recordMap).map((b) => extractMarkdownText(b))
        ?.length / 2
    ),
    1
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

export const getLessonOutputAtSectionMDX = (
  recordMap: ExtendedRecordMap,
  section: number
): string => {
  const { outputIndex } = sectionToIndex(section);
  return (
    extractMarkdownBlocks(recordMap)
      .map((b) => extractMarkdownText(b))
      ?.at(outputIndex) || ''
  );
};

export const getLessonOutputMDX = (
  recordMap: ExtendedRecordMap,
  section: number
): string => {
  const markdownTexts = extractMarkdownBlocks(recordMap).map((b) =>
    extractMarkdownText(b)
  );
  let outputCombinedMdx = '';
  for (let i = 1; i <= section; i++) {
    const outputIndex = sectionToIndex(i).outputIndex;
    const outputAtSection = markdownTexts.at(outputIndex);
    if (outputAtSection) {
      outputCombinedMdx += markdownTexts.at(outputIndex) + '\n';
    }
  }
  return outputCombinedMdx;
};

export const getLSPrefix = (courseId: string, lessonId: string) => {
  return `cloudybook-${courseId}-${lessonId}`;
};

export const getLSKey = (
  courseId: string,
  lessonId: string,
  fieldId: string
) => {
  return `${getLSPrefix(courseId, lessonId)}-${fieldId}`;
};

export const isDemoCourse = (courseId: string) => {
  return courseId.toLowerCase() === 'demo';
};
