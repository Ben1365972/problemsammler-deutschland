import { NextRequest, NextResponse } from "next/server";
import { listTagsByPrefix, listAllTags } from "@/lib/db/meta";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const q = url.searchParams.get("q");
  if (q !== null) {
    const tags = await listTagsByPrefix(q, 10);
    return NextResponse.json({ tags });
  }
  const tags = await listAllTags();
  return NextResponse.json({ tags });
}
