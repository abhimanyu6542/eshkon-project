/**
 * Deterministic SemVer bump logic for page releases.
 *
 * Rules:
 *  patch  → text/prop value change only
 *  minor  → section added, or optional prop added
 *  major  → section removed, section type changed, required prop removed
 */
import type { Page, Section } from "@/types/page";

export type SemVerBump = "patch" | "minor" | "major";

export interface DiffResult {
  bump: SemVerBump;
  changelog: string[];
}

function bumpPriority(a: SemVerBump, b: SemVerBump): SemVerBump {
  const order: SemVerBump[] = ["patch", "minor", "major"];
  return order[Math.max(order.indexOf(a), order.indexOf(b))];
}

function diffProps(
  oldProps: Record<string, unknown>,
  newProps: Record<string, unknown>
): { bump: SemVerBump; notes: string[] } {
  const notes: string[] = [];
  let bump: SemVerBump = "patch";

  const oldKeys = new Set(Object.keys(oldProps));
  const newKeys = new Set(Object.keys(newProps));

  // Removed keys → major
  for (const k of oldKeys) {
    if (!newKeys.has(k)) {
      notes.push(`Removed prop "${k}" (breaking)`);
      bump = bumpPriority(bump, "major");
    }
  }

  // Added keys → minor
  for (const k of newKeys) {
    if (!oldKeys.has(k)) {
      notes.push(`Added prop "${k}"`);
      bump = bumpPriority(bump, "minor");
    }
  }

  // Changed values → patch
  for (const k of oldKeys) {
    if (newKeys.has(k) && JSON.stringify(oldProps[k]) !== JSON.stringify(newProps[k])) {
      notes.push(`Changed prop "${k}"`);
      // bump stays patch unless already higher
    }
  }

  return { bump, notes };
}

export function diffPages(prev: Page, next: Page): DiffResult {
  const changelog: string[] = [];
  let bump: SemVerBump = "patch";

  const prevById = new Map(prev.sections.map((s) => [s.id, s]));
  const nextById = new Map(next.sections.map((s) => [s.id, s]));

  // Removed sections → major
  for (const [id, s] of prevById) {
    if (!nextById.has(id)) {
      changelog.push(`Removed section "${id}" (type: ${s.type})`);
      bump = bumpPriority(bump, "major");
    }
  }

  // Added sections → minor
  for (const [id, s] of nextById) {
    if (!prevById.has(id)) {
      changelog.push(`Added section "${id}" (type: ${s.type})`);
      bump = bumpPriority(bump, "minor");
    }
  }

  // Changed sections
  for (const [id, nextSection] of nextById) {
    const prevSection = prevById.get(id);
    if (!prevSection) continue;

    // Type changed → major
    if (prevSection.type !== nextSection.type) {
      changelog.push(
        `Section "${id}" type changed from "${prevSection.type}" to "${nextSection.type}" (breaking)`
      );
      bump = bumpPriority(bump, "major");
      continue;
    }

    // Props diff
    const { bump: propBump, notes } = diffProps(
      prevSection.props as Record<string, unknown>,
      nextSection.props as Record<string, unknown>
    );
    if (notes.length) {
      changelog.push(`Section "${id}": ${notes.join(", ")}`);
      bump = bumpPriority(bump, propBump);
    }
  }

  // Title change → patch
  if (prev.title !== next.title) {
    changelog.push(`Page title changed from "${prev.title}" to "${next.title}"`);
  }

  if (changelog.length === 0) {
    changelog.push("No changes detected");
  }

  return { bump, changelog };
}

export function incrementVersion(current: string, bump: SemVerBump): string {
  const [major, minor, patch] = current.split(".").map(Number);
  if (bump === "major") return `${major + 1}.0.0`;
  if (bump === "minor") return `${major}.${minor + 1}.0`;
  return `${major}.${minor}.${patch + 1}`;
}

export function isIdentical(prev: Page, next: Page): boolean {
  return JSON.stringify(prev) === JSON.stringify(next);
}
