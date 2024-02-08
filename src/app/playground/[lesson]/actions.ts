'use server';

import { NotionAPI } from 'notion-client';

export async function getRecordMap(id: string | null) {
  const pageId = id || 'b57f92a1577e48fcae50a841889968a3';
  const notion = new NotionAPI();
  const recordMap = await notion.getPage(pageId);
  return recordMap;
}
