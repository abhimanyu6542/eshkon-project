import { describe, it, expect } from "vitest";
import { PageSchema, SectionSchema } from "@/types/page";

describe("PageSchema", () => {
  it("validates a valid page", () => {
    const result = PageSchema.safeParse({
      pageId: "p1",
      slug: "home",
      title: "Home",
      sections: [
        {
          id: "s1",
          type: "hero",
          props: { heading: "Welcome" },
        },
      ],
    });
    expect(result.success).toBe(true);
  });

  it("rejects a page with missing required fields", () => {
    const result = PageSchema.safeParse({ slug: "home" });
    expect(result.success).toBe(false);
  });

  it("rejects an unknown section type", () => {
    const result = SectionSchema.safeParse({
      id: "s1",
      type: "unknown",
      props: {},
    });
    expect(result.success).toBe(false);
  });

  it("rejects a hero section with empty heading", () => {
    const result = SectionSchema.safeParse({
      id: "s1",
      type: "hero",
      props: { heading: "" },
    });
    expect(result.success).toBe(false);
  });

  it("validates a cta section with all required props", () => {
    const result = SectionSchema.safeParse({
      id: "s2",
      type: "cta",
      props: { heading: "Start now", label: "Go", url: "/start" },
    });
    expect(result.success).toBe(true);
  });

  it("validates a featureGrid section", () => {
    const result = SectionSchema.safeParse({
      id: "s3",
      type: "featureGrid",
      props: {
        heading: "Features",
        features: [{ title: "Fast", description: "Very fast" }],
      },
    });
    expect(result.success).toBe(true);
  });
});
