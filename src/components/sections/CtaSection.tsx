import type { CtaProps } from "@/types/page";

export default function CtaSection({ heading, label, url, variant = "primary" }: CtaProps) {
  const isPrimary = variant === "primary";
  return (
    <section
      aria-label="Call to action"
      className={`py-20 px-6 text-center ${
        isPrimary ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-900"
      }`}
    >
      <h2 className="text-3xl font-bold sm:text-4xl">{heading}</h2>
      <a
        href={url}
        className={`mt-8 inline-block rounded-lg px-10 py-4 text-base font-semibold shadow transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
          isPrimary
            ? "bg-white text-indigo-700 hover:bg-indigo-50 focus-visible:outline-white"
            : "bg-indigo-600 text-white hover:bg-indigo-700 focus-visible:outline-indigo-600"
        }`}
        data-testid="cta-link"
      >
        {label}
      </a>
    </section>
  );
}
