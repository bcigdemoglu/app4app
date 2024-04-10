import { COURSE_MAP } from '@/lib/data';
import {
  JsonObject,
  LessonInput,
  OrderedUserProgressForCourseFromDB,
  UserProgressForCourseFromDB,
  UserProgressForLessonFromDB,
  verifiedJsonObjectFromDB,
} from '@/lib/types';

export function getLessonInputs(
  userProgress: UserProgressForLessonFromDB | null,
  lessonId: string
): LessonInput {
  // Get full object or default to empty object
  if (userProgress && userProgress.inputs_json) {
    // Get user progress if there is one in DB
    const inputsFromDB = verifiedJsonObjectFromDB(
      userProgress.inputs_json,
      `FATAL_DB_ERROR: inputs_json is not an object for user ${userProgress.user_id} of lesson ${lessonId}!`
    );
    const metadata = inputsFromDB['metadata'] as JsonObject;
    const lastCompletedSection = metadata['lastCompletedSection'] as number;
    const modifiedAt = metadata['modified_at'] as string;
    return {
      data: inputsFromDB['data'] as JsonObject,
      lastCompletedSection,
      modifiedAt,
    };
  }
  return { data: null, lastCompletedSection: null, modifiedAt: null };
}

export function getLessonOutput(
  userProgress: UserProgressForLessonFromDB | null
): { data: string | null; modifiedAt: string | null } {
  // Get full object or default to null object
  if (userProgress && userProgress.outputs_json) {
    // Get user progress if there is one in DB
    const outputsFromDB = userProgress.outputs_json as JsonObject;
    const data = outputsFromDB['data'] as string;
    const metadata = outputsFromDB['metadata'] as JsonObject;
    const modifiedAt = metadata['modified_at'] as string;
    return { data, modifiedAt };
  }
  return { data: null, modifiedAt: null };
}

// Return the order of lesson in course, if not present return max number to exclude it
export function getLessonOrder(courseId: string, lessonId: string): number {
  const order = COURSE_MAP[courseId]?.lessonMap[lessonId]?.order;
  if (isNaN(order)) return Math.max();
  return order;
}

export function getLessonOrderFromUserProgress(
  userProgress: UserProgressForLessonFromDB
): number {
  return getLessonOrder(userProgress.course_id, userProgress.lesson_id);
}

export function getInputFieldFromUserProgressForLesson(
  userProgress: UserProgressForLessonFromDB | null,
  fieldName: string
): string | null {
  return (
    (((userProgress?.inputs_json as JsonObject)?.data as JsonObject)?.[
      fieldName
    ] as string) || null
  );
}

export function getInputFieldFromUserProgressForCourse(
  userProgressForCourse: UserProgressForCourseFromDB | null,
  fieldName: string,
  lessonId: string
): string | null {
  return getInputFieldFromUserProgressForLesson(
    userProgressForCourse?.[lessonId] || null,
    fieldName
  );
}

export function getUserProgressForLesson(
  userProgressForCourse: UserProgressForCourseFromDB | null,
  lessonId: string
): UserProgressForLessonFromDB | null {
  if (!userProgressForCourse || !userProgressForCourse[lessonId]) {
    return null;
  }

  return userProgressForCourse[lessonId];
}

export function getOrderedUserProgressUpToLesson(
  userProgressForCourse: UserProgressForCourseFromDB,
  courseId: string,
  lessonId: string
): OrderedUserProgressForCourseFromDB {
  const maxLessonOrder = COURSE_MAP[courseId].lessonMap[lessonId].order;

  const userProgressList = Object.values(userProgressForCourse);

  // Sort user progress in increasing order
  userProgressList.sort(
    (a: UserProgressForLessonFromDB, b: UserProgressForLessonFromDB) => {
      return (
        getLessonOrderFromUserProgress(a) - getLessonOrderFromUserProgress(b)
      );
    }
  );

  return userProgressList.filter(
    (userProgress) =>
      getLessonOrderFromUserProgress(userProgress) < maxLessonOrder
  );
}
