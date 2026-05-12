"use client";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { updateSectionProps } from "@/store/slices/draftPageSlice";
import type { Section } from "@/types/page";

interface Props {
  sectionId: string;
}

export function SectionPropsEditor({ sectionId }: Props) {
  const dispatch = useAppDispatch();
  const section = useAppSelector((s) =>
    s.draftPage.page?.sections.find((sec) => sec.id === sectionId)
  );

  if (!section) return null;

  function update(key: string, value: unknown) {
    if (!section) return;
    dispatch(
      updateSectionProps({
        id: sectionId,
        props: { ...(section.props as Record<string, unknown>), [key]: value },
      })
    );
  }

  return (
    <div className="p-3">
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
        Edit: <span className="capitalize">{section.type}</span>
      </h3>
      <PropsForm section={section} onUpdate={update} />
    </div>
  );
}

function PropsForm({
  section,
  onUpdate,
}: {
  section: Section;
  onUpdate: (key: string, value: unknown) => void;
}) {
  const props = section.props as Record<string, unknown>;

  switch (section.type) {
    case "hero":
      return (
        <fieldset className="space-y-3">
          <legend className="sr-only">Hero section properties</legend>
          <Field
            label="Heading"
            id="hero-heading"
            value={String(props.heading ?? "")}
            onChange={(v) => onUpdate("heading", v)}
          />
          <Field
            label="Subheading"
            id="hero-subheading"
            value={String(props.subheading ?? "")}
            onChange={(v) => onUpdate("subheading", v)}
          />
          <Field
            label="CTA Label"
            id="hero-cta-label"
            value={String(props.ctaLabel ?? "")}
            onChange={(v) => onUpdate("ctaLabel", v)}
          />
          <Field
            label="CTA URL"
            id="hero-cta-url"
            value={String(props.ctaUrl ?? "")}
            onChange={(v) => onUpdate("ctaUrl", v)}
          />
        </fieldset>
      );

    case "cta":
      return (
        <fieldset className="space-y-3">
          <legend className="sr-only">CTA section properties</legend>
          <Field
            label="Heading"
            id="cta-heading"
            value={String(props.heading ?? "")}
            onChange={(v) => onUpdate("heading", v)}
          />
          <Field
            label="Button Label"
            id="cta-label"
            value={String(props.label ?? "")}
            onChange={(v) => onUpdate("label", v)}
          />
          <Field
            label="Button URL"
            id="cta-url"
            value={String(props.url ?? "")}
            onChange={(v) => onUpdate("url", v)}
          />
        </fieldset>
      );

    case "testimonial":
      return (
        <fieldset className="space-y-3">
          <legend className="sr-only">Testimonial section properties</legend>
          <Field
            label="Quote"
            id="testimonial-quote"
            value={String(props.quote ?? "")}
            onChange={(v) => onUpdate("quote", v)}
            multiline
          />
          <Field
            label="Author"
            id="testimonial-author"
            value={String(props.author ?? "")}
            onChange={(v) => onUpdate("author", v)}
          />
          <Field
            label="Role"
            id="testimonial-role"
            value={String(props.role ?? "")}
            onChange={(v) => onUpdate("role", v)}
          />
        </fieldset>
      );

    case "featureGrid":
      return (
        <fieldset className="space-y-3">
          <legend className="sr-only">Feature grid section properties</legend>
          <Field
            label="Heading"
            id="featuregrid-heading"
            value={String(props.heading ?? "")}
            onChange={(v) => onUpdate("heading", v)}
          />
          <p className="text-xs text-gray-500">
            Feature items can be edited via Contentful.
          </p>
        </fieldset>
      );

    default:
      return <p className="text-xs text-gray-500">No editable props.</p>;
  }
}

function Field({
  label,
  id,
  value,
  onChange,
  multiline = false,
}: {
  label: string;
  id: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
}) {
  const inputClass =
    "mt-1 block w-full rounded-md border border-gray-300 px-2.5 py-1.5 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500";

  return (
    <div>
      <label htmlFor={id} className="block text-xs font-medium text-gray-700">
        {label}
      </label>
      {multiline ? (
        <textarea
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className={inputClass}
        />
      ) : (
        <input
          id={id}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={inputClass}
        />
      )}
    </div>
  );
}
