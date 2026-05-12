/**
 * Contentful adapter — all CMS logic is isolated here.
 * No Contentful types leak into UI or Redux.
 */
import { createClient, type ContentfulClientApi } from "contentful";
import { PageSchema } from "@/types/page";
import type { Page, Section } from "@/types/page";

// ─── Client factory ───────────────────────────────────────────────────────────

function makeClient(preview = false): ContentfulClientApi<undefined> | null {
  const spaceId = process.env.CONTENTFUL_SPACE_ID;
  const accessToken = preview
    ? process.env.CONTENTFUL_PREVIEW_TOKEN
    : process.env.CONTENTFUL_DELIVERY_TOKEN;
  const host = preview ? "preview.contentful.com" : "cdn.contentful.com";

  if (!spaceId || !accessToken) return null;
  return createClient({ space: spaceId, accessToken, host });
}

// ─── RichText → plain text extractor ─────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function richTextToPlain(value: any): string {
  if (!value || typeof value !== "object") return String(value ?? "");
  if (typeof value === "string") return value;
  if (value.nodeType === "document" || value.content) {
    return (value.content ?? [])
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((node: any) => richTextToPlain(node))
      .join("")
      .trim();
  }
  if (value.nodeType === "text") return value.value ?? "";
  if (value.content) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (value.content ?? []).map((n: any) => richTextToPlain(n)).join("").trim();
  }
  return "";
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normaliseField(value: any): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (typeof value === "object" && value.nodeType) return richTextToPlain(value);
  return String(value);
}

// ─── Adapter functions ────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function adaptSection(entry: any): Section | null {
  const f = entry.fields ?? {};
  const sectionType = normaliseField(f.sectionType);
  const sectionId   = normaliseField(f.sectionId) || entry.sys?.id;
  const props = (f.props && typeof f.props === "object" && !f.props.nodeType)
    ? f.props
    : {};
  if (!sectionType) return null;
  return { id: sectionId, type: sectionType, props } as Section;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function adaptPage(entry: any, includes: any[] = []): Page {
  const f = entry.fields ?? {};
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sectionItems: any[] = Array.isArray(f.sections) ? f.sections : [];

  const sections: Section[] = sectionItems
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((item: any) => {
      if (item?.fields) return adaptSection(item);
      const id = item?.sys?.id;
      if (id) {
        const resolved = includes.find((e) => e.sys?.id === id);
        if (resolved) return adaptSection(resolved);
      }
      return null;
    })
    .filter((s): s is Section => s !== null);

  const raw = {
    pageId:   normaliseField(f.pageId) || entry.sys?.id,
    slug:     normaliseField(f.slug),
    title:    normaliseField(f.title),
    sections,
  };

  return PageSchema.parse(raw);
}

// ─── Content type resolution ──────────────────────────────────────────────────

async function resolvePageContentType(
  client: ContentfulClientApi<undefined>
): Promise<string | null> {
  try {
    await client.getContentType("page");
    return "page";
  } catch { /* not found */ }

  try {
    const types = await client.getContentTypes();
    for (const ct of types.items) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const hasSlug = (ct.fields as any[]).some((f: any) => f.id === "slug");
      if (hasSlug) {
        console.warn(`[Contentful] Using content type "${ct.sys.id}" (no "page" type found)`);
        return ct.sys.id;
      }
    }
  } catch { /* ignore */ }

  return null;
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function getPageBySlug(
  slug: string,
  preview = false
): Promise<Page | null> {
  const client = makeClient(preview);
  if (!client) {
    console.warn("[Contentful] Missing env vars");
    return null;
  }

  try {
    const contentType = await resolvePageContentType(client);
    if (!contentType) {
      console.warn("[Contentful] No page content type found");
      return null;
    }

    let res = await client.getEntries({
      content_type: contentType,
      "fields.slug": slug,
      limit: 1,
      include: 2,
    } as Parameters<typeof client.getEntries>[0]).catch(() => null);

    if (!res || !res.items.length) {
      res = await client.getEntries({
        content_type: contentType,
        limit: 200,
        include: 2,
      } as Parameters<typeof client.getEntries>[0]);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      res = { ...res, items: res.items.filter((item: any) => normaliseField(item.fields?.slug) === slug) } as typeof res;
    }

    if (!res.items.length) {
      console.warn(`[Contentful] No entry with slug "${slug}"`);
      return null;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const includes: any[] = (res as any).includes?.Entry ?? [];
    return adaptPage(res.items[0], includes);
  } catch (err: unknown) {
    const status = (err as { status?: number }).status;
    const message = (err as { message?: string }).message ?? String(err);
    console.error(`[Contentful] Error fetching "${slug}" (${status ?? "?"}): ${message}`);
    return null;
  }
}

export async function getAllPageSlugs(preview = false): Promise<string[]> {
  const client = makeClient(preview);
  if (!client) return [];

  try {
    const contentType = await resolvePageContentType(client);
    if (!contentType) return [];

    const res = await client.getEntries({
      content_type: contentType,
      select: ["fields.slug"],
      limit: 200,
    } as Parameters<typeof client.getEntries>[0]);

    return res.items
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((e: any) => normaliseField(e.fields?.slug))
      .filter(Boolean);
  } catch {
    return [];
  }
}

export async function checkContentfulConnection(): Promise<{
  ok: boolean;
  contentType?: string;
  error?: string;
  spaceId?: string;
}> {
  const spaceId = process.env.CONTENTFUL_SPACE_ID;
  const token = process.env.CONTENTFUL_PREVIEW_TOKEN ?? process.env.CONTENTFUL_DELIVERY_TOKEN;

  if (!spaceId || !token) {
    return { ok: false, error: "Missing env vars" };
  }

  try {
    const client = createClient({
      space: spaceId,
      accessToken: token,
      host: "preview.contentful.com",
    });
    const contentType = await resolvePageContentType(client);
    if (!contentType) {
      return { ok: false, spaceId, error: "No page content type found" };
    }
    return { ok: true, spaceId, contentType };
  } catch (err: unknown) {
    const status = (err as { status?: number }).status;
    const message = (err as { message?: string }).message ?? String(err);
    return { ok: false, spaceId, error: `${status ?? "Error"}: ${message}` };
  }
}
