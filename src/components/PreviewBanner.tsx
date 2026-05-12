interface Props {
  slug: string;
}

export function PreviewBanner({ slug }: Props) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex items-center justify-between bg-amber-400 px-4 py-2 text-sm font-medium text-amber-900"
    >
      <span>Preview mode — showing draft content</span>
      <a
        href={`/preview/${slug}`}
        className="rounded bg-amber-900 px-3 py-1 text-xs font-semibold text-white hover:bg-amber-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-900"
      >
        Exit preview
      </a>
    </div>
  );
}
