/**
 * Release storage adapter.
 *
 * - Local / non-Vercel: reads and writes JSON files under /releases/<slug>/
 * - Vercel (read-only FS): uses the Contentful Management API to persist
 *   releases as entries of content type "pageRelease".
 *
 * The content type must exist in your Contentful space. Run:
 *   npm run setup:releases
 * once to create it, or create it manually with fields:
 *   releaseKey  (Short text, required) — "<slug>@<version>"
 *   data        (JSON object, required) — the full Release object
 */

import type { Release } from "@/types/page";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isVercel(): boolean {
  return !!process.env.VERCEL;
}

function semverCompare(a: string, b: string): number {
  const [aMaj, aMin, aPat] = a.split(".").map(Number);
  const [bMaj, bMin, bPat] = b.split(".").map(Number);
  return bMaj - aMaj || bMin - aMin || bPat - aPat;
}

// ─── Filesystem adapter (local dev) ──────────────────────────────────────────

async function fsGetLatest(slug: string): Promise<Release | null> {
  const { promises: fs } = await import("fs");
  const path = await import("path");
  const dir = path.join(process.cwd(), "releases", slug);
  try {
    const files = await fs.readdir(dir);
    const versions = files
      .filter((f) => f.endsWith(".json"))
      .map((f) => f.replace(".json", ""))
      .sort(semverCompare);
    if (!versions.length) return null;
    const raw = await fs.readFile(path.join(dir, `${versions[0]}.json`), "utf-8");
    return JSON.parse(raw) as Release;
  } catch {
    return null;
  }
}

async function fsSaveRelease(slug: string, release: Release): Promise<void> {
  const { promises: fs } = await import("fs");
  const path = await import("path");
  const dir = path.join(process.cwd(), "releases", slug);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(
    path.join(dir, `${release.version}.json`),
    JSON.stringify(release, null, 2),
    "utf-8"
  );
}

// ─── Contentful Management adapter (Vercel / production) ─────────────────────

const CONTENT_TYPE = "pageRelease";

function getMgmtClient() {
  const spaceId = process.env.CONTENTFUL_SPACE_ID;
  const token = process.env.CONTENTFUL_MANAGEMENT_TOKEN;
  if (!spaceId || !token) {
    throw new Error(
      "CONTENTFUL_SPACE_ID and CONTENTFUL_MANAGEMENT_TOKEN are required for release storage on Vercel."
    );
  }
  return { spaceId, token };
}

async function cfFetch(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  const { token } = getMgmtClient();
  const base = "https://api.contentful.com";
  return fetch(`${base}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/vnd.contentful.management.v1+json",
      ...(options.headers ?? {}),
    },
  });
}

async function cfGetLatest(slug: string): Promise<Release | null> {
  const { spaceId } = getMgmtClient();
  // Query entries of type pageRelease whose releaseKey starts with "<slug>@"
  const qs = new URLSearchParams({
    content_type: CONTENT_TYPE,
    "fields.releaseKey[match]": `${slug}@`,
    order: "-sys.createdAt",
    limit: "100",
  });
  const res = await cfFetch(
    `/spaces/${spaceId}/environments/master/entries?${qs}`
  );
  if (!res.ok) {
    if (res.status === 404) return null; // content type not yet created
    console.error("[releaseStore] cfGetLatest error", res.status, await res.text());
    return null;
  }
  const body = await res.json() as {
    items: Array<{ fields: { releaseKey: { "en-US": string }; data: { "en-US": Release } } }>;
  };

  const releases: Release[] = body.items
    .filter((e) => e.fields?.data?.["en-US"])
    .map((e) => e.fields.data["en-US"]);

  if (!releases.length) return null;

  // Sort by version descending and return the latest
  releases.sort((a, b) => semverCompare(a.version, b.version));
  return releases[0];
}

async function cfSaveRelease(slug: string, release: Release): Promise<void> {
  const { spaceId } = getMgmtClient();
  const releaseKey = `${slug}@${release.version}`;

  const body = {
    fields: {
      releaseKey: { "en-US": releaseKey },
      data: { "en-US": release },
    },
  };

  const res = await cfFetch(
    `/spaces/${spaceId}/environments/master/entries`,
    {
      method: "POST",
      headers: { "X-Contentful-Content-Type": CONTENT_TYPE },
      body: JSON.stringify(body),
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`[releaseStore] Failed to save release to Contentful (${res.status}): ${text}`);
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function getLatestRelease(slug: string): Promise<Release | null> {
  if (isVercel()) {
    return cfGetLatest(slug);
  }
  return fsGetLatest(slug);
}

export async function saveRelease(slug: string, release: Release): Promise<void> {
  if (isVercel()) {
    await cfSaveRelease(slug, release);
    return;
  }
  await fsSaveRelease(slug, release);
}
