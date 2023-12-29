import { NextRequest, NextResponse } from "next/server";
import { NotionAPI } from "notion-client";

async function getPage(id: string) {
  const notion = new NotionAPI();
  const recordMap = await notion.getPage(id);
  return recordMap;
}

export async function GET(request: NextRequest) {
  const recordMap = await getPage("1e4cd8ab556e4b8b900f5c49157ad5a4");
  return NextResponse.json(recordMap);
}
