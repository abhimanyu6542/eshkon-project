import { notFound } from "next/navigation";
import { PreviewBanner } from "@/components/PreviewBanner";
import { DraftPreview } from "@/components/DraftPreview";
import PageRenderer from "@/components/PageRenderer";
import { getLatestRelease } from "@/lib/releases";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ draft?: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const release = await getLatestRelease(slug);
  return { title: release ? `${release.snapshot.title} – Page Studio` : "Page not found" };
}

export default async function PreviewPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { draft } = await searchParams;

  // Draft mode — render from Redux state (client component, shows live edits)
  if (draft === "true") {
    return <DraftPreview slug={slug} />;
  }

  // Published mode — read from the latest release snapshot
  const release = await getLatestRelease(slug);
  if (!release) notFound();

  return (
    <>
      {/* <PreviewBanner slug={slug} /> */}
      <PageRenderer page={release.snapshot} />
    </>
  );
}
