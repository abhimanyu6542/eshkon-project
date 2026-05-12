import { z } from "zod";

// ─── Section prop schemas ────────────────────────────────────────────────────

export const HeroPropsSchema = z.object({
  heading: z.string().min(1),
  subheading: z.string().optional(),
  ctaLabel: z.string().optional(),
  ctaUrl: z.string().optional(),
  backgroundImage: z.string().optional(),
});

export const FeatureGridPropsSchema = z.object({
  heading: z.string().min(1),
  features: z.array(
    z.object({
      title: z.string().min(1),
      description: z.string(),
      icon: z.string().optional(),
    })
  ),
});

export const TestimonialPropsSchema = z.object({
  quote: z.string().min(1),
  author: z.string().min(1),
  role: z.string().optional(),
  avatarUrl: z.string().optional(),
});

export const CtaPropsSchema = z.object({
  heading: z.string().min(1),
  label: z.string().min(1),
  url: z.string().min(1),
  variant: z.enum(["primary", "secondary"]).default("primary"),
});

// ─── Section schema ──────────────────────────────────────────────────────────

export const SectionSchema = z.discriminatedUnion("type", [
  z.object({ id: z.string(), type: z.literal("hero"), props: HeroPropsSchema }),
  z.object({ id: z.string(), type: z.literal("featureGrid"), props: FeatureGridPropsSchema }),
  z.object({ id: z.string(), type: z.literal("testimonial"), props: TestimonialPropsSchema }),
  z.object({ id: z.string(), type: z.literal("cta"), props: CtaPropsSchema }),
]);

// ─── Page schema ─────────────────────────────────────────────────────────────

export const PageSchema = z.object({
  pageId: z.string().min(1),
  slug: z.string().min(1),
  title: z.string().min(1),
  sections: z.array(SectionSchema),
});

// ─── TypeScript types ────────────────────────────────────────────────────────

export type HeroProps = z.infer<typeof HeroPropsSchema>;
export type FeatureGridProps = z.infer<typeof FeatureGridPropsSchema>;
export type TestimonialProps = z.infer<typeof TestimonialPropsSchema>;
export type CtaProps = z.infer<typeof CtaPropsSchema>;

export type Section = z.infer<typeof SectionSchema>;
export type SectionType = Section["type"];
export type Page = z.infer<typeof PageSchema>;

// ─── Release / versioning ────────────────────────────────────────────────────

export interface Release {
  version: string;
  slug: string;
  publishedAt: string;
  publishedBy: string;
  snapshot: Page;
  changelog: string;
}

export type SemVerBump = "patch" | "minor" | "major";
