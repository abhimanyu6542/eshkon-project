interface Props {
  type: string;
}

export default function UnsupportedSection({ type }: Props) {
  return (
    <section
      role="region"
      aria-label={`Unsupported section: ${type}`}
      className="flex items-center justify-center bg-amber-50 py-12 px-6 text-center"
    >
      <div className="rounded-lg border border-amber-200 bg-amber-100 p-6">
        <p className="font-semibold text-amber-800">
          Unknown section type: <code className="font-mono">{type}</code>
        </p>
        <p className="mt-1 text-sm text-amber-700">
          This section cannot be rendered. Add it to the section registry.
        </p>
      </div>
    </section>
  );
}
