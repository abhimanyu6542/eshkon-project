import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getPageBySlug } from "@/lib/contentful/contentfulClient";
import { diffPages, incrementVersion, isIdentical } from "@/lib/semver";
import { PageSchema } from "@/types/page";
import type { Release, Page } from "@/types/page";
import type { Role } from "@/types/auth";
import { promises as fs } from "fs";
import path from "path";
import { getLatestRelease } from "@/lib/releases";

const RELEASES_DIR = path.join(process.cwd(), "releases");

async function saveRelease(slug: string, release: Release): Promise<void> {
  const dir = path.join(RELEASES_DIR, slug);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(
    path.join(dir, `${release.version}.json`),
    JSON.stringify(release, null, 2),
    "utf-8"
  );
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const role = (session.user as { role?: Role })?.role;
  if (role !== "publisher") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let draftPage: Page;
  try {
    const body = await req.json();
    draftPage = PageSchema.parse(body.page);
  } catch {
    const fetched = await getPageBySlug(slug, true);
    if (!fetched) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }
    draftPage = fetched;
  }

  const latest = await getLatestRelease(slug);

  if (latest && isIdentical(latest.snapshot, draftPage)) {
    return NextResponse.json(latest);
  }

  const prevVersion = latest?.version ?? "0.0.0";
  const prevSnapshot = latest?.snapshot ?? { ...draftPage, sections: [] };

  const { bump, changelog } = diffPages(prevSnapshot, draftPage);
  const newVersion = incrementVersion(prevVersion, bump);

  const release: Release = {
    version: newVersion,
    slug,
    publishedAt: new Date().toISOString(),
    publishedBy: session.user?.email ?? "unknown",
    snapshot: draftPage,
    changelog: changelog.join("\n"),
  };

  await saveRelease(slug, release);

  return NextResponse.json(release, { status: 201 });
}
