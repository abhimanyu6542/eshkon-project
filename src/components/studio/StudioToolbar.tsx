"use client";

import Link from "next/link";
import { Eye, Send, ArrowLeft } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { publishPage } from "@/store/slices/publishSlice";
import { showToast } from "@/store/slices/uiSlice";
import type { Role } from "@/types/auth";
import { hasPermission } from "@/types/auth";

interface Props {
  slug: string;
  userRole: Role;
}

export function StudioToolbar({ slug, userRole }: Props) {
  const dispatch = useAppDispatch();
  const publishStatus = useAppSelector((s) => s.publish.status);
  const isDirty = useAppSelector((s) => s.draftPage.isDirty);
  const draftPage = useAppSelector((s) => s.draftPage.page);
  const canPublish = hasPermission(userRole, "publish");

  async function handlePublish() {
    if (!draftPage) return;
    const result = await dispatch(publishPage({ slug, page: draftPage }));
    if (publishPage.fulfilled.match(result)) {
      dispatch(showToast({ message: `Published v${result.payload.version}`, type: "success" }));
    } else {
      dispatch(showToast({ message: String(result.payload ?? "Publish failed"), type: "error" }));
    }
  }

  return (
    <header className="flex h-14 items-center justify-between border-b border-gray-200 bg-white px-4 shadow-sm">
      <div className="flex items-center gap-3">
        <Link
          href="/"
          aria-label="Back to home"
          className="rounded p-1.5 text-gray-500 hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-600"
        >
          <ArrowLeft size={18} aria-hidden="true" />
        </Link>
        <span className="text-sm font-semibold text-gray-800">
          Studio — <span className="font-mono text-indigo-600">/{slug}</span>
        </span>
        {isDirty && (
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
            Unsaved
          </span>
        )}
      </div>

      <nav aria-label="Studio actions" className="flex items-center gap-2">
        <Link
          href={`/preview/${slug}?draft=true`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          <Eye size={15} aria-hidden="true" />
          Preview draft
        </Link>
        <Link
          href={`/preview/${slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          <Eye size={15} aria-hidden="true" />
          View published
        </Link>

        {canPublish && (
          <button
            onClick={handlePublish}
            disabled={publishStatus === "publishing"}
            aria-busy={publishStatus === "publishing"}
            className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            <Send size={15} aria-hidden="true" />
            {publishStatus === "publishing" ? "Publishing…" : "Publish"}
          </button>
        )}
      </nav>
    </header>
  );
}
