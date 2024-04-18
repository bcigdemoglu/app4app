import { AIFeedbackMap, CourseMap, LessonMap } from '@/lib/types';
import { Metadata } from 'next';
import { Block, ExtendedRecordMap } from 'notion-types';

export const GUEST_MODE_COOKIE = 'guestId';
export const GUEST_MODE_COOKIE_DEV_ID = '00000000-0000-0000-0000-000000000000';

export const END_SECTION_SEPARATOR = '>>>---ENDSECTION--->>>';
///// TODO IMPLEMENT IF THERE IS A USE CASE ONLY AT THIS POINT SERVES THE SAME AS ENDSECTION
///// WOULD IMPACT getLessonUpToSectionMDX for OUTPUT only
export const RESET_OUTPUT_SEPARATOR = '>>>---RESETOUTPUT--->>>';
export const MARKDOWN_SEPARATORS = [
  END_SECTION_SEPARATOR,
  RESET_OUTPUT_SEPARATOR,
];
export const SEPARATOR_REGEX = new RegExp(MARKDOWN_SEPARATORS.join('|'), 'g');

export const genMetadata = (title: string, description: string): Metadata => ({
  metadataBase: new URL('https://app.cloudybook.com'),
  title: `Cloudybook App - ${title}`,
  description,
  openGraph: {
    title: `Cloudybook App - ${title}`,
    description,
    images: '/cloudybook icon.png',
    siteName: 'Cloudybook App',
    type: 'website',
  },
});

export const DO_NOT_TRACK_PATHS = [
  '/widget',
  '/playground/demo/persona/1',
  '/playground/demo/smart/1',
  '/playground/demo/affirmation/1',
];

export const doNotTrackPath = (pathname: string) =>
  DO_NOT_TRACK_PATHS.some((dntPath) => pathname.startsWith(dntPath));

export const DEMO_LESSON_MAP: LessonMap = {
  smart: {
    id: 'smart',
    notionId: '1271d4fa33d44955995843af0b4cda92',
    title: 'SMART Goals',
    description: 'What are your SMART goals?',
    prev: null,
    next: 'action',
    order: 0,
  },
  action: {
    id: 'action',
    notionId: '46cc313dbbe0497f88dbcf9d2c700a43',
    title: 'Action Plan',
    description: 'What is your action plan?',
    prev: 'smart',
    next: 'persona',
    order: 1,
  },
  persona: {
    id: 'persona',
    notionId: 'd6e80168be0e47739b9dc934406e40d8',
    title: 'Building a Customer Persona',
    description: 'Build a Customer Persona for Course Creators',
    prev: 'action',
    next: 'affirmation',
    order: 2,
  },
  affirmation: {
    id: 'affirmation',
    notionId: '605044ae6a9d4c42afc7ddb6b4a6cced',
    title: 'Affirmation Generator',
    description: 'Affirm yourself',
    prev: 'persona',
    next: null,
    order: 3,
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
    next: 'strategicobjectives',
    order: 2,
  },
  strategicobjectives: {
    id: 'strategicobjectives',
    notionId: '1-a933a7e7d9e24bfba52ec8646439f022',
    title: 'Strategic Objectives',
    prev: 'currentstate',
    next: 'approachtobetaken',
    order: 3,
  },
  approachtobetaken: {
    id: 'approachtobetaken',
    notionId: '478c7273b261428385208822b1d8b91e',
    title: 'The Approach to be Taken',
    prev: 'strategicobjectives',
    next: 'timeline',
    order: 4,
  },
  timeline: {
    id: 'timeline',
    notionId: '729a36aef1204881bada23567fcd752d',
    title: 'Timeline',
    prev: 'approachtobetaken',
    next: 'scope',
    order: 5,
  },
  scope: {
    id: 'scope',
    notionId: '2ef16085fdeb4fe68a0575d2a356b28c',
    title: 'Scope',
    prev: 'timeline',
    next: 'risk',
    order: 6,
  },
  risk: {
    id: 'risk',
    notionId: '1fbfc275b35c4c43bec839859b9042e7',
    title: 'Risk',
    prev: 'scope',
    next: 'roles',
    order: 7,
  },
  roles: {
    id: 'roles',
    notionId: 'dd1d0f070e114a0b8646fbdcbb537c03',
    title: 'Roles',
    prev: 'risk',
    next: 'deliveryapproach',
    order: 8,
  },
  deliveryapproach: {
    id: 'deliveryapproach',
    notionId: '0fdb1d1ecd1c4486aa5e7215173bbbb9',
    title: 'The Delivery Approach',
    prev: 'roles',
    next: 'end',
    order: 9,
  },
  end: {
    id: 'end',
    notionId: '83d5f063f8004ed591982a1b2ec6ab3b',
    title: 'The End',
    prev: 'deliveryapproach',
    next: null,
    order: 10,
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

export const TEST_LESSON_MAP: LessonMap = {
  testlesson: {
    id: 'testlesson',
    notionId: '46877300bd044ab6b3f233ab42be3c66',
    title: 'Test Lesson',
    prev: null,
    next: null,
    order: 0,
  },
};

export const COURSE_MAP: CourseMap = {
  testcourse: {
    id: 'testcourse',
    title: 'Cloudybook Test',
    description: 'Welcome to Cloudybook interactive workbook tests',
    access: 'private',
    lessonMap: TEST_LESSON_MAP,
  },
  demo: {
    id: 'demo',
    title: 'Cloudybook Demo',
    description: 'Welcome to Cloudybook interactive workbook demo',
    access: 'guest',
    lessonMap: DEMO_LESSON_MAP,
  },
  businessimprovementplan: {
    id: 'businessimprovementplan',
    title: 'Business Improvement Plan by Robert Chapman',
    description:
      'The step by step guide to building the most effective plan for your business',
    access: 'preview',
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

export const CREATOR_MODAL_PARAM = 'showfeedback';

export const AI_MODAL_PARAM = 'showai';

export const PROGRESS_MODAL_PARAM = 'showprogress';

export const LESSON_START_PARAM = 'welcome';
export const LESSON_END_PARAM = 'congrats';

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

const sectionToIndex = (section: number) => section - 1;

export const getLessonTotalSections = (
  recordMap: ExtendedRecordMap
): number => {
  const [extractedInput, extractedOutput] = extractMarkdownBlocks(
    recordMap
  ).map((b) => extractMarkdownText(b));
  const inputBlock = extractedInput || '';
  const outputBlock = extractedOutput || '';
  const totalInputSections = inputBlock.split(SEPARATOR_REGEX).length;
  const totalOutputSections = outputBlock.split(SEPARATOR_REGEX).length;
  if (totalInputSections !== totalOutputSections) {
    throw new Error(
      `Input and output sections don't match. ` +
        `totalInputSections: ${totalInputSections}, outputSections: ${totalOutputSections}`
    );
  }

  // TODO: DEFINITELY BETTER PLACED ELSEWHERE BUT GOOD FOR VERIFICATION FOR NOW
  // WE ARE STILL GETTING STARTED EH :D

  const userFieldsRegex = /name="([^"]*)"(?! lesson)/g;
  const userInputFields = new Set(
    [...inputBlock.matchAll(userFieldsRegex)].map((match) => match[1])
  );
  const userOutputFields = new Set(
    [...outputBlock.matchAll(userFieldsRegex)].map((match) => match[1])
  );
  const missingInOutput = Array.from(userInputFields)
    .filter((field) => !userOutputFields.has(field))
    .join(', ');
  const missingInInput = Array.from(userOutputFields)
    .filter((field) => !userInputFields.has(field))
    .join(', ');

  if (missingInOutput.length > 0 || missingInInput.length > 0) {
    throw new Error(
      `Missing fields in output: [${missingInOutput}], in input: [${missingInInput}]`
    );
  }
  return totalInputSections;
};

const getLessonAtSectionMDX = (
  recordMap: ExtendedRecordMap,
  section: number,
  field: 'inputIndex' | 'outputIndex'
) => {
  const [extractedInputSections, extractedOutputSections] =
    extractMarkdownBlocks(recordMap).map((b) =>
      extractMarkdownText(b).split(SEPARATOR_REGEX)
    );
  const inputSections = extractedInputSections || [];
  const outputSections = extractedOutputSections || [];
  const sections = field === 'inputIndex' ? inputSections : outputSections;
  return sections.at(sectionToIndex(section)) || '';
};

const getLessonUpToSectionMDX = (
  recordMap: ExtendedRecordMap,
  section: number,
  field: 'inputIndex' | 'outputIndex',
  displaySectionSeparator: boolean = false
): string => {
  const [extractedInputSections, extractedOutputSections] =
    extractMarkdownBlocks(recordMap).map((b) =>
      extractMarkdownText(b).split(SEPARATOR_REGEX)
    );
  const inputSections = extractedInputSections || [];
  const outputSections = extractedOutputSections || [];
  const sections = field === 'inputIndex' ? inputSections : outputSections;
  let combinedMdx = '';
  for (let i = 1; i <= section; i++) {
    const index = sectionToIndex(i);
    const mdxAtSection = sections.at(index);
    if (mdxAtSection) {
      const separator = displaySectionSeparator
        ? `\n\n***--- End of Section ${i} ---***\n\n`
        : '\n';
      combinedMdx += mdxAtSection + separator;
    }
  }
  return combinedMdx;
};

export const getLessonInputAtSectionMDX = (
  recordMap: ExtendedRecordMap,
  section: number
) => {
  return getLessonAtSectionMDX(recordMap, section, 'inputIndex');
};

export const getLessonOutputAtSectionMDX = (
  recordMap: ExtendedRecordMap,
  section: number
): string => {
  return getLessonAtSectionMDX(recordMap, section, 'outputIndex');
};

export const getLessonInputUpToSectionMDX = (
  recordMap: ExtendedRecordMap,
  section: number,
  displaySectionSeparator: boolean = false
): string => {
  return getLessonUpToSectionMDX(
    recordMap,
    section,
    'inputIndex',
    displaySectionSeparator
  );
};

export const getLessonOutputUpToSectionMDX = (
  recordMap: ExtendedRecordMap,
  section: number,
  displaySectionSeparator: boolean = false
): string => {
  return getLessonUpToSectionMDX(
    recordMap,
    section,
    'outputIndex',
    displaySectionSeparator
  );
};

export const getLSPrefix = (courseId: string, lessonId: string) => {
  return ['cloudybook', courseId, lessonId].join('.');
};

export const getLSKey = (
  courseId: string,
  lessonId: string,
  fieldId: string
) => {
  return [getLSPrefix(courseId, lessonId), fieldId].join('.');
};

export const isDemoCourse = (courseId: string) => {
  return courseId.toLowerCase() === 'demo';
};
