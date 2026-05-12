"use client";

import { Component, type ReactNode } from "react";
import { sectionRegistry } from "@/lib/sectionRegistry";
import UnsupportedSection from "@/components/sections/UnsupportedSection";
import type { Page, Section } from "@/types/page";

// ─── Error Boundary ──────────────────────────────────────────────────────────

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
}

class PageErrorBoundary extends Component<
  { children: ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, message: error.message };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          role="alert"
          className="flex min-h-[40vh] items-center justify-center bg-red-50 p-8 text-center"
        >
          <div className="rounded-xl border border-red-200 bg-white p-8 shadow">
            <h2 className="text-xl font-bold text-red-700">Page render error</h2>
            <p className="mt-2 text-sm text-red-600">{this.state.message}</p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// ─── Section renderer ────────────────────────────────────────────────────────

function SectionRenderer({ section }: { section: Section }) {
  const Component = sectionRegistry[section.type as keyof typeof sectionRegistry];
  if (!Component) {
    return <UnsupportedSection type={section.type} />;
  }
  return <Component {...(section.props as Record<string, unknown>)} />;
}

// ─── Page renderer ───────────────────────────────────────────────────────────

interface PageRendererProps {
  page: Page;
}

export default function PageRenderer({ page }: PageRendererProps) {
  return (
    <PageErrorBoundary>
      <main id="main-content" tabIndex={-1}>
        <h1 className="sr-only">{page.title}</h1>
        {page.sections.map((section) => (
          <SectionRenderer key={section.id} section={section} />
        ))}
      </main>
    </PageErrorBoundary>
  );
}
