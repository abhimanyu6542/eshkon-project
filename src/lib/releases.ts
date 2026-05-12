import { promises as fs } from "fs";
import path from "path";
import type { Release } from "@/types/page";

const RELEASES_DIR = path.join(process.cwd(), "releases");

export async function getLatestRelease(slug: string): Promise<Release | null> {
  const dir = path.join(RELEASES_DIR, slug);
  try {
    const files = await fs.readdir(dir);
    const versions = files
      .filter((f) => f.endsWith(".json"))
      .map((f) => f.replace(".json", ""))
      .sort((a, b) => {
        const [aMaj, aMin, aPat] = a.split(".").map(Number);
        const [bMaj, bMin, bPat] = b.split(".").map(Number);
        return bMaj - aMaj || bMin - aMin || bPat - aPat;
      });
    if (!versions.length) return null;
    const raw = await fs.readFile(path.join(dir, `${versions[0]}.json`), "utf-8");
    return JSON.parse(raw) as Release;
  } catch {
    return null;
  }
}
