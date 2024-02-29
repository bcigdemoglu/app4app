'use server';

import { NotionAPI } from 'notion-client';

export async function getRecordMap(id: string) {
  const pageId = id;
  const notion = new NotionAPI();
  const recordMap = await notion.getPage(pageId);
  return recordMap;
}
