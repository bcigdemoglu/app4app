// import { NextRequest, NextResponse } from 'next/server';
import { NextResponse } from 'next/server';
import { NotionAPI } from 'notion-client';

async function getPage(id: string) {
  const notion = new NotionAPI();
  const recordMap = await notion.getPage(id);
  return recordMap;
}

export async function GET() {
  const recordMap = await getPage('b57f92a1577e48fcae50a841889968a3');
  return NextResponse.json(recordMap);
}
