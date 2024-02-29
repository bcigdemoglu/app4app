import { NextRequest, NextResponse } from 'next/server';
// import { getRecordMap } from '@/app/playground/[course]/[lesson]/[section]/actions';

export async function GET(request: NextRequest) {
  return NextResponse.json(request);
  //   // Get request parameter pageId from the request
  //   const { searchParams } = new URL(request.url);
  //   const pageId = searchParams.get('pageId');
  //   const recordMap = await getRecordMap(pageId);
  //   return NextResponse.json(recordMap);
}
