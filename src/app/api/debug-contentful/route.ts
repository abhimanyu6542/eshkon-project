import { NextResponse } from "next/server";
import { getPageBySlug } from "@/lib/contentful/contentfulClient";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug") ?? "home";
  const preview = searchParams.get("preview") === "true";

  try {
    const page = await getPageBySlug(slug, preview);
    return NextResponse.json({
      found: !!page,
      slug: page?.slug,
      title: page?.title,
      sectionCount: page?.sections.length ?? 0,
      sections: page?.sections.map(s => ({ id: s.id, type: s.type, propKeys: Object.keys(s.props as object) })),
      env: {
        spaceId: process.env.CONTENTFUL_SPACE_ID ? "set" : "MISSING",
        deliveryToken: process.env.CONTENTFUL_DELIVERY_TOKEN ? "set" : "MISSING",
        previewToken: process.env.CONTENTFUL_PREVIEW_TOKEN ? "set" : "MISSING",
      }
    });
  } catch (err: unknown) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
