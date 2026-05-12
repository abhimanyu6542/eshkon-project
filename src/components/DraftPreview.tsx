"use client";

import { useAppSelector } from "@/store/hooks";
import PageRenderer from "@/components/PageRenderer";
import Link from "next/link";

interface Props {
  slug: string;
}

export function DraftPreview({ slug }: Props) {
  const page = useAppSelector((s) => s.draftPage.page);

  if (!page || page.slug !== slug) {
    return (
      <main
        id="main-content"
        className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center"
      >
        <p className="text-gray-500">No draft loaded for <code className="font-mono">/{slug}</code>.</p>
        <Link
          href={`/studio/${slug}`}
          className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          Open Studio
        </Link>
      </main>
    );
  }

  return (
    <>
      {/* Draft banner */}
      <div
        role="status"
        aria-live="polite"
        className="flex items-center justify-between bg-indigo-600 px-4 py-2 text-sm font-medium text-white"
      >
        <span>Draft preview — showing your unsaved edits</span>
        <div className="flex items-center gap-3">
          <Link
            href={`/studio/${slug}`}
            className="rounded bg-white/20 px-3 py-1 text-xs font-semibold hover:bg-white/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            ← Back to Studio
          </Link>
          <Link
            href={`/preview/${slug}`}
            className="rounded bg-white/20 px-3 py-1 text-xs font-semibold hover:bg-white/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            View published
          </Link>
        </div>
      </div>
      <PageRenderer page={page} />
    </>
  );
}
