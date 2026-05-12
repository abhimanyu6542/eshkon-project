import { describe, it, expect } from "vitest";
import { diffPages, incrementVersion, isIdentical } from "@/lib/semver";
import type { Page } from "@/types/page";

const heroSection = {
  id: "s1",
  type: "hero" as const,
  props: { heading: "Welcome", ctaLabel: "Start", ctaUrl: "/start" },
};

const ctaSection = {
  id: "s2",
  type: "cta" as const,
  props: { heading: "Ready?", label: "Go", url: "/go", variant: "primary" as const },
};

const basePage: Page = {
  pageId: "p1",
  slug: "home",
  title: "Home",
  sections: [heroSection, ctaSection],
};

describe("diffPages", () => {
  it("returns patch for text/prop change only", () => {
    const next: Page = {
      ...basePage,
      sections: [
        { id: "s1", type: "hero", props: { heading: "Hello World", ctaLabel: "Start", ctaUrl: "/start" } },
        ctaSection,
      ],
    };
    const { bump } = diffPages(basePage, next);
    expect(bump).toBe("patch");
  });

  it("returns minor for added section", () => {
    const next: Page = {
      ...basePage,
      sections: [
        ...basePage.sections,
        { id: "s3", type: "testimonial", props: { quote: "Great!", author: "Alice" } },
      ],
    };
    const { bump } = diffPages(basePage, next);
    expect(bump).toBe("minor");
  });

  it("returns major for removed section", () => {
    const next: Page = {
      ...basePage,
      sections: [heroSection],
    };
    const { bump } = diffPages(basePage, next);
    expect(bump).toBe("major");
  });

  it("returns major for section type change", () => {
    const next: Page = {
      ...basePage,
      sections: [
        { id: "s1", type: "cta", props: { heading: "H", label: "L", url: "/u", variant: "primary" as const } },
        ctaSection,
      ],
    };
    const { bump } = diffPages(basePage, next);
    expect(bump).toBe("major");
  });

  it("returns major for removed required prop", () => {
    const next: Page = {
      ...basePage,
      sections: [
        { id: "s1", type: "hero", props: { heading: "Welcome" } }, // ctaLabel + ctaUrl removed
        ctaSection,
      ],
    };
    const { bump } = diffPages(basePage, next);
    expect(bump).toBe("major");
  });

  it("returns minor for added optional prop", () => {
    const next: Page = {
      ...basePage,
      sections: [
        {
          id: "s1",
          type: "hero",
          props: { heading: "Welcome", ctaLabel: "Start", ctaUrl: "/start", backgroundImage: "/bg.jpg" },
        },
        ctaSection,
      ],
    };
    const { bump } = diffPages(basePage, next);
    expect(bump).toBe("minor");
  });

  it("includes changelog entries", () => {
    const next: Page = {
      ...basePage,
      sections: [
        { id: "s1", type: "hero", props: { heading: "New Heading", ctaLabel: "Start", ctaUrl: "/start" } },
        ctaSection,
      ],
    };
    const { changelog } = diffPages(basePage, next);
    expect(changelog.some((c) => c.includes("heading"))).toBe(true);
  });
});

describe("incrementVersion", () => {
  it("increments patch", () => expect(incrementVersion("1.2.3", "patch")).toBe("1.2.4"));
  it("increments minor and resets patch", () => expect(incrementVersion("1.2.3", "minor")).toBe("1.3.0"));
  it("increments major and resets minor+patch", () => expect(incrementVersion("1.2.3", "major")).toBe("2.0.0"));
  it("starts from 0.0.0", () => expect(incrementVersion("0.0.0", "patch")).toBe("0.0.1"));
});

describe("isIdentical", () => {
  it("returns true for identical pages", () => {
    expect(isIdentical(basePage, { ...basePage })).toBe(true);
  });

  it("returns false for different pages", () => {
    const next = { ...basePage, title: "Different" };
    expect(isIdentical(basePage, next)).toBe(false);
  });
});
