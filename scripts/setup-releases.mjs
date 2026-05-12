/**
 * Creates the "pageRelease" content type in Contentful.
 * Run once before deploying to Vercel:
 *   npm run setup:releases
 *
 * Fields:
 *   releaseKey  Short text  "<slug>@<version>"  (required, unique)
 *   data        JSON object  Full Release object (required)
 */

import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load env from .env file if not already set
function loadEnv() {
  try {
    const envPath = resolve(__dirname, "../.env");
    const lines = readFileSync(envPath, "utf-8").split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const [key, ...rest] = trimmed.split("=");
      if (key && !process.env[key]) {
        process.env[key] = rest.join("=").trim();
      }
    }
  } catch {
    // .env not found, rely on environment
  }
}

loadEnv();

const SPACE_ID = process.env.CONTENTFUL_SPACE_ID;
const TOKEN = process.env.CONTENTFUL_MANAGEMENT_TOKEN;

if (!SPACE_ID || !TOKEN) {
  console.error("Missing CONTENTFUL_SPACE_ID or CONTENTFUL_MANAGEMENT_TOKEN");
  process.exit(1);
}

const BASE = `https://api.contentful.com/spaces/${SPACE_ID}/environments/master`;
const HEADERS = {
  Authorization: `Bearer ${TOKEN}`,
  "Content-Type": "application/vnd.contentful.management.v1+json",
};

async function run() {
  // Check if content type already exists
  const check = await fetch(`${BASE}/content_types/pageRelease`, { headers: HEADERS });
  if (check.ok) {
    console.log("✓ Content type 'pageRelease' already exists.");
    return;
  }

  console.log("Creating content type 'pageRelease'...");

  const res = await fetch(`${BASE}/content_types/pageRelease`, {
    method: "PUT",
    headers: HEADERS,
    body: JSON.stringify({
      name: "Page Release",
      displayField: "releaseKey",
      fields: [
        {
          id: "releaseKey",
          name: "Release Key",
          type: "Symbol",
          required: true,
        },
        {
          id: "data",
          name: "Data",
          type: "Object",
          required: true,
        },
      ],
    }),
  });

  if (!res.ok) {
    console.error("Failed to create content type:", await res.text());
    process.exit(1);
  }

  // Publish the content type so it can be used
  const ct = await res.json();
  const version = ct.sys.version;

  const pub = await fetch(`${BASE}/content_types/pageRelease/published`, {
    method: "PUT",
    headers: { ...HEADERS, "X-Contentful-Version": String(version) },
  });

  if (!pub.ok) {
    console.error("Failed to publish content type:", await pub.text());
    process.exit(1);
  }

  console.log("✓ Content type 'pageRelease' created and published.");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
