import type { FeatureGridProps } from "@/types/page";

export default function FeatureGridSection({ heading, features }: FeatureGridProps) {
  return (
    <section aria-label="Features" className="bg-white py-20 px-6">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-center text-3xl font-bold text-gray-900 sm:text-4xl">
          {heading}
        </h2>
        <ul
          className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3"
          role="list"
        >
          {features.map((feature, i) => (
            <li
              key={i}
              className="rounded-xl border border-gray-100 bg-gray-50 p-6 shadow-sm"
            >
              {feature.icon && (
                <span aria-hidden="true" className="text-3xl">
                  {feature.icon}
                </span>
              )}
              <h3 className="mt-3 text-lg font-semibold text-gray-900">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm text-gray-600">{feature.description}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
