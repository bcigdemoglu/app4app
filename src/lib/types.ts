import { Json, Tables } from '@/lib/database.types';

export type JsonObject = { [key: string]: Json };

export function isJsonObject(obj?: Json): boolean {
  return typeof obj === 'object' && obj !== null && !Array.isArray(obj);
}

export function isSameJson(obj1: Json, obj2: Json): boolean {
  return JSON.stringify(obj1) === JSON.stringify(obj2);
}

export function toInputTextId(name: string) {
  return `I_TEXT.${name}`;
}

export function toInputTableId(name: string) {
  return `I_TABLE.${name}`;
}

export function verifiedJsonObjectFromDB(
  obj: Json | undefined,
  errMsg: string
): JsonObject {
  if (!isJsonObject(obj)) {
    throw new Error(errMsg);
  }
  return obj as JsonObject;
}

export interface Lesson {
  id: string;
  notionId: string;
  title: string;
  description?: string;
  prev: string | null;
  next: string | null;
  order: number;
}

export type LessonMap = Record<string, Lesson>;
export interface Course {
  id: string;
  title: string;
  description: string;
  lessonMap: LessonMap;
  access: 'public' | 'private' | 'preview';
}

export type CourseMap = Record<string, Course>;

export type AIFeedbackMap = Record<string, { mdx: string }>;

export type UserProgressFromDB = Tables<'user_progress'>;
export type ExportedOuputsFromDB = Tables<'exported_outputs'>;

export type UpdateUserInputFormState = {
  state: 'success' | 'error' | 'noupdate' | 'pending';
  data: JsonObject;
  lastCompletedSection: number;
};
