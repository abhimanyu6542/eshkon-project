"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { loadPage } from "@/store/slices/draftPageSlice";
import { StudioSidebar } from "./StudioSidebar";
import { StudioCanvas } from "./StudioCanvas";
import { StudioToolbar } from "./StudioToolbar";
import type { Page } from "@/types/page";
import type { Role } from "@/types/auth";

interface Props {
  initialPage: Page | null;
  slug: string;
  userRole: Role;
}

export function StudioShell({ initialPage, slug, userRole }: Props) {
  const dispatch = useAppDispatch();
  const draftPage = useAppSelector((s) => s.draftPage.page);

  useEffect(() => {
    // Only load from Contentful if we don't have a persisted draft for this slug
    if (initialPage && (!draftPage || draftPage.slug !== slug)) {
      dispatch(loadPage(initialPage));
    }
  }, [initialPage, slug]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-gray-100">
      <StudioToolbar slug={slug} userRole={userRole} />
      <div className="flex flex-1 overflow-hidden">
        <StudioSidebar />
        <StudioCanvas />
      </div>
    </div>
  );
}
