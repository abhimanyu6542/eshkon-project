"use client";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addSection, removeSection, reorderSections } from "@/store/slices/draftPageSlice";
import { selectSection } from "@/store/slices/uiSlice";
import { SectionPropsEditor } from "./SectionPropsEditor";
import { Plus, Trash2, GripVertical, ChevronUp, ChevronDown } from "lucide-react";
import type { SectionType } from "@/types/page";
import { nanoid } from "@reduxjs/toolkit";

const SECTION_TYPES: SectionType[] = ["hero", "featureGrid", "testimonial", "cta"];

function defaultProps(type: SectionType): Record<string, unknown> {
  switch (type) {
    case "hero":
      return { heading: "New Hero", subheading: "", ctaLabel: "Get started", ctaUrl: "#" };
    case "featureGrid":
      return { heading: "Features", features: [{ title: "Feature 1", description: "Description" }] };
    case "testimonial":
      return { quote: "Great product!", author: "Jane Doe", role: "CEO" };
    case "cta":
      return { heading: "Ready to start?", label: "Get started", url: "#", variant: "primary" };
  }
}

export function StudioSidebar() {
  const dispatch = useAppDispatch();
  const page = useAppSelector((s) => s.draftPage.page);
  const selectedId = useAppSelector((s) => s.ui.selectedSectionId);
  const activePanel = useAppSelector((s) => s.ui.activePanel);

  if (!page) {
    return (
      <aside
        aria-label="Editor sidebar"
        className="w-72 border-r border-gray-200 bg-white p-4 text-sm text-gray-500"
      >
        No page loaded.
      </aside>
    );
  }

  function handleAdd(type: SectionType) {
    dispatch(
      addSection({
        id: nanoid(),
        type,
        props: defaultProps(type) as never,
      })
    );
  }

  function handleMove(index: number, dir: "up" | "down") {
    dispatch(
      reorderSections({
        fromIndex: index,
        toIndex: dir === "up" ? index - 1 : index + 1,
      })
    );
  }

  return (
    <aside
      aria-label="Editor sidebar"
      className="flex w-72 flex-col border-r border-gray-200 bg-white overflow-hidden"
    >
      {/* Sections list */}
      <div className="flex-1 overflow-y-auto p-3">
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
          Sections
        </h2>
        <ul role="list" className="space-y-1">
          {page.sections.map((section, i) => (
            <li key={section.id}>
              <div
                className={`flex items-center gap-2 rounded-lg px-2 py-2 text-sm ${
                  selectedId === section.id
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <GripVertical size={14} className="shrink-0 text-gray-400" aria-hidden="true" />
                <button
                  onClick={() => dispatch(selectSection(section.id))}
                  className="flex-1 text-left font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-600 rounded"
                  aria-pressed={selectedId === section.id}
                  aria-label={`Edit ${section.type} section`}
                >
                  <span className="capitalize">{section.type}</span>
                  <span className="ml-1 text-xs text-gray-400">#{i + 1}</span>
                </button>
                <div className="flex items-center gap-0.5">
                  <button
                    onClick={() => handleMove(i, "up")}
                    disabled={i === 0}
                    aria-label={`Move ${section.type} section up`}
                    className="rounded p-0.5 text-gray-400 hover:text-gray-700 disabled:opacity-30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-600"
                  >
                    <ChevronUp size={14} aria-hidden="true" />
                  </button>
                  <button
                    onClick={() => handleMove(i, "down")}
                    disabled={i === page.sections.length - 1}
                    aria-label={`Move ${section.type} section down`}
                    className="rounded p-0.5 text-gray-400 hover:text-gray-700 disabled:opacity-30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-600"
                  >
                    <ChevronDown size={14} aria-hidden="true" />
                  </button>
                  <button
                    onClick={() => dispatch(removeSection(section.id))}
                    aria-label={`Remove ${section.type} section`}
                    className="rounded p-0.5 text-gray-400 hover:text-red-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-600"
                  >
                    <Trash2 size={14} aria-hidden="true" />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>

        {/* Add section */}
        <div className="mt-4">
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
            Add section
          </h2>
          <div className="grid grid-cols-2 gap-1.5">
            {SECTION_TYPES.map((type) => (
              <button
                key={type}
                onClick={() => handleAdd(type)}
                className="rounded-lg border border-dashed border-gray-300 px-2 py-2 text-xs font-medium text-gray-600 hover:border-indigo-400 hover:text-indigo-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-600 capitalize"
                aria-label={`Add ${type} section`}
              >
                <Plus size={12} className="inline mr-1" aria-hidden="true" />
                {type}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Props editor panel */}
      {activePanel === "props" && selectedId && (
        <div className="border-t border-gray-200 overflow-y-auto max-h-80">
          <SectionPropsEditor sectionId={selectedId} />
        </div>
      )}
    </aside>
  );
}
