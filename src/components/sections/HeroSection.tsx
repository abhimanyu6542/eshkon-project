import type { HeroProps } from "@/types/page";

export default function HeroSection({
  heading,
  subheading,
  ctaLabel,
  ctaUrl,
}: HeroProps) {
  return (
    <section
      aria-label="Hero"
      className="relative flex min-h-[60vh] flex-col items-center justify-center bg-gradient-to-br from-indigo-600 to-purple-700 px-6 py-24 text-center text-white"
    >
      <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
        {heading}
      </h1>
      {subheading && (
        <p className="mt-6 max-w-2xl text-lg text-indigo-100 sm:text-xl">
          {subheading}
        </p>
      )}
      {ctaLabel && ctaUrl && (
        <a
          href={ctaUrl}
          className="mt-10 inline-block rounded-lg bg-white px-8 py-3 text-base font-semibold text-indigo-700 shadow-md transition-colors hover:bg-indigo-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          data-testid="hero-cta"
        >
          {ctaLabel}
        </a>
      )}
    </section>
  );
}
