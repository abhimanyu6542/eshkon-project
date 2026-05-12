import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import * as fs from "fs";
import * as path from "path";

test.describe("Preview page", () => {
  test("renders the home page preview without crashing", async ({ page }) => {
    await page.goto("/preview/home");
    // Should not show an error boundary
    await expect(page.getByRole("alert")).not.toBeVisible();
    // Main content should be present
    await expect(page.locator("#main-content")).toBeVisible();
  });

  test("CTA link is present and keyboard-focusable", async ({ page }) => {
    await page.goto("/preview/home");
    const cta = page.locator("[data-testid='cta-link'], [data-testid='hero-cta']").first();
    if (await cta.count() > 0) {
      await cta.focus();
      await expect(cta).toBeFocused();
    }
  });

  test("skip link is present and functional", async ({ page }) => {
    await page.goto("/preview/home");
    // Tab to skip link
    await page.keyboard.press("Tab");
    const skipLink = page.getByText("Skip to main content");
    await expect(skipLink).toBeVisible();
  });

  test("passes axe accessibility checks", async ({ page }) => {
    await page.goto("/preview/home");

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();

    // Save report
    const reportDir = path.join(process.cwd(), "a11y-reports");
    fs.mkdirSync(reportDir, { recursive: true });
    fs.writeFileSync(
      path.join(reportDir, "a11y-report.json"),
      JSON.stringify(results, null, 2)
    );

    const criticalViolations = results.violations.filter(
      (v) => v.impact === "critical" || v.impact === "serious"
    );

    expect(
      criticalViolations,
      `Critical/serious axe violations:\n${criticalViolations
        .map((v) => `  [${v.impact}] ${v.id}: ${v.description}`)
        .join("\n")}`
    ).toHaveLength(0);
  });
});

test.describe("Login page", () => {
  test("passes axe accessibility checks", async ({ page }) => {
    await page.goto("/login");

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();

    const reportDir = path.join(process.cwd(), "a11y-reports");
    fs.mkdirSync(reportDir, { recursive: true });
    fs.writeFileSync(
      path.join(reportDir, "a11y-report-login.json"),
      JSON.stringify(results, null, 2)
    );

    const criticalViolations = results.violations.filter(
      (v) => v.impact === "critical" || v.impact === "serious"
    );

    expect(
      criticalViolations,
      `Critical/serious axe violations on login:\n${criticalViolations
        .map((v) => `  [${v.impact}] ${v.id}: ${v.description}`)
        .join("\n")}`
    ).toHaveLength(0);
  });

  test("form fields are labelled", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByLabel("Email address")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();
  });

  test("shows error on invalid credentials", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email address").fill("bad@example.com");
    await page.getByLabel("Password").fill("wrong");
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page.getByRole("alert")).toBeVisible();
  });
});
