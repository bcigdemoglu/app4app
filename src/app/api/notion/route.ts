import { getRecordMap } from '@/app/playground/[lesson]/actions';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Get request parameter pageId from the request
  const { searchParams } = new URL(request.url);
  const pageId = searchParams.get('pageId');
  const recordMap = await getRecordMap(pageId);
  return NextResponse.json(recordMap);
}
