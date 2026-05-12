import { NextResponse } from "next/server";
import { checkContentfulConnection } from "@/lib/contentful/contentfulClient";

export async function GET() {
  const result = await checkContentfulConnection();
  return NextResponse.json(result, { status: result.ok ? 200 : 503 });
}
