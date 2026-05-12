import type { TestimonialProps } from "@/types/page";

export default function TestimonialSection({
  quote,
  author,
  role,
  avatarUrl,
}: TestimonialProps) {
  return (
    <section
      aria-label="Testimonial"
      className="bg-indigo-50 py-20 px-6"
    >
      <figure className="mx-auto max-w-3xl text-center">
        {avatarUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatarUrl}
            alt={`Photo of ${author}`}
            className="mx-auto mb-6 h-16 w-16 rounded-full object-cover"
          />
        )}
        <blockquote>
          <p className="text-xl font-medium italic text-gray-800 sm:text-2xl">
            &ldquo;{quote}&rdquo;
          </p>
        </blockquote>
        <figcaption className="mt-6">
          <p className="font-semibold text-gray-900">{author}</p>
          {role && <p className="text-sm text-gray-500">{role}</p>}
        </figcaption>
      </figure>
    </section>
  );
}
