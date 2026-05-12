"use client";

import { useAppSelector } from "@/store/hooks";
import PageRenderer from "@/components/PageRenderer";

export function StudioCanvas() {
  const page = useAppSelector((s) => s.draftPage.page);

  if (!page) {
    return (
      <div className="flex flex-1 items-center justify-center text-gray-400">
        <p>No page loaded. Open a page from the sidebar.</p>
      </div>
    );
  }

  return (
    <div
      className="flex-1 overflow-y-auto bg-white shadow-inner"
      aria-label="Page canvas preview"
    >
      {/* Scale down for studio view */}
      <div className="origin-top scale-90 transform">
        <PageRenderer page={page} />
      </div>
    </div>
  );
}
