/**
 * sectionRegistry.ts
 * Single source of truth for section type → React component mapping.
 * Removing an entry here will cause TypeScript to error at the render site.
 */
import type { ComponentType } from "react";
import type { SectionType, HeroProps, FeatureGridProps, TestimonialProps, CtaProps } from "@/types/page";

import HeroSection from "@/components/sections/HeroSection";
import FeatureGridSection from "@/components/sections/FeatureGridSection";
import TestimonialSection from "@/components/sections/TestimonialSection";
import CtaSection from "@/components/sections/CtaSection";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyProps = any;

// The registry is typed so every SectionType MUST have an entry.
// Removing a key → TypeScript compile error.
export const sectionRegistry: Record<SectionType, ComponentType<AnyProps>> = {
  hero: HeroSection as ComponentType<HeroProps>,
  featureGrid: FeatureGridSection as ComponentType<FeatureGridProps>,
  testimonial: TestimonialSection as ComponentType<TestimonialProps>,
  cta: CtaSection as ComponentType<CtaProps>,
};
