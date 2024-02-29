import { Json, Tables } from '@/app/lib/database.types';

export type JsonObject = { [key: string]: Json };

export function isJsonObject(obj?: Json): boolean {
  return typeof obj === 'object' && obj !== null && !Array.isArray(obj);
}

export function isSameJson(obj1: Json, obj2: Json): boolean {
  return JSON.stringify(obj1) === JSON.stringify(obj2);
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
  description: string;
  prev: string | null;
  next: string | null;
}

export type LessonMap = Record<string, Lesson>;

export type MDXOutputComponent = (...props: any[]) => JSX.Element;
export type MDXOutputComponents = { [key: string]: MDXOutputComponent };

export type UserProgressTable = Tables<'user_progress'>;

export type UpdateUserInputFormState = {
  state: 'success' | 'error' | 'noupdate' | 'pending';
  data: JsonObject;
};
