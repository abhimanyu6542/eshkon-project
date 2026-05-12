# Page Studio

A schema-driven, WYSIWYG-lite page editor built with Next.js App Router, Redux Toolkit, Contentful, and Tailwind CSS.

---

## Architecture Overview

```
src/
├── app/                        # Next.js App Router
│   ├── api/
│   │   ├── auth/[...nextauth]/ # NextAuth route handler
│   │   └── publish/[slug]/     # Publish API (publisher-only)
│   ├── login/                  # Sign-in page
│   ├── preview/[slug]/         # Public preview (server component, Contentful)
│   ├── studio/[slug]/          # Editor (server shell + client Redux)
│   └── unauthorized/           # RBAC rejection page
├── components/
│   ├── auth/                   # LoginForm
│   ├── sections/               # HeroSection, FeatureGridSection, etc.
│   ├── studio/                 # StudioShell, Toolbar, Sidebar, Canvas, PropsEditor
│   └── ui/                     # SkipLink, ToastNotification, PreviewBanner
├── lib/
│   ├── auth.ts                 # NextAuth config (credentials provider + RBAC callbacks)
│   ├── contentful/
│   │   └── contentfulClient.ts # Contentful adapter (isolated)
│   ├── sectionRegistry.ts      # type → component map (TS-enforced completeness)
│   └── semver.ts               # Deterministic SemVer diff logic
├── store/
│   ├── slices/
│   │   ├── draftPageSlice.ts   # Page structure + props mutations
│   │   ├── uiSlice.ts          # Selected section, panel, toasts
│   │   └── publishSlice.ts     # Async publish thunk + status
│   ├── store.ts                # Redux store with redux-persist
│   └── hooks.ts                # Typed useAppDispatch / useAppSelector
├── tests/                      # Vitest unit tests
└── types/
    ├── auth.ts                 # Role, Permission, hasPermission
    └── page.ts                 # Zod schemas + inferred TypeScript types
e2e/
└── preview.spec.ts             # Playwright + axe e2e tests
releases/                       # Immutable versioned snapshots (gitignored in prod)
```

**Data flow:**
1. Server component fetches page from Contentful → passes to `StudioShell`
2. `StudioShell` dispatches `loadPage` into Redux (only if no persisted draft for that slug)
3. All edits go through Redux actions — no direct mutation
4. `StudioCanvas` renders the live Redux draft via `PageRenderer`
5. Publish button calls `/api/publish/[slug]` with the current draft

---

## Redux Slice Responsibilities

### `draftPage`
Owns the mutable page state in the editor.

| Action | Effect |
|---|---|
| `loadPage(page)` | Replace draft with Contentful data, mark clean |
| `updatePageTitle(title)` | Update title, mark dirty |
| `addSection(section)` | Append section, mark dirty |
| `removeSection(id)` | Remove by id, mark dirty |
| `reorderSections({fromIndex, toIndex})` | Move section, mark dirty |
| `updateSectionProps({id, props})` | Merge props for a section, mark dirty |
| `markClean()` | Clear dirty flag after publish |

Persisted via `redux-persist` (localStorage) so drafts survive page reload.

### `ui`
Ephemeral UI state — not persisted.

| State | Purpose |
|---|---|
| `selectedSectionId` | Which section is being edited |
| `activePanel` | `sections` / `props` / `preview` |
| `isSidebarOpen` | Sidebar toggle |
| `toastMessage / toastType` | Notification system |

### `publish`
Manages the async publish lifecycle.

| State | Purpose |
|---|---|
| `status` | `idle / publishing / success / error` |
| `latestRelease` | Most recent `Release` object |
| `history` | All releases this session |
| `error` | Error message if publish failed |

The `publishPage` async thunk POSTs to `/api/publish/[slug]` and handles all three states.

---

## Contentful Model + Adapter

### Content Model

Create two content types in Contentful:

**`page`**
| Field | Type | Required |
|---|---|---|
| `pageId` | Short text | ✓ |
| `slug` | Short text | ✓ |
| `title` | Short text | ✓ |
| `sections` | References (many) → `section` | ✓ |

**`section`**
| Field | Type | Required |
|---|---|---|
| `sectionId` | Short text | ✓ |
| `sectionType` | Short text (enum: hero, featureGrid, testimonial, cta) | ✓ |
| `props` | JSON object | ✓ |

### Adapter (`src/lib/contentful/contentfulClient.ts`)

All Contentful logic is isolated here. The adapter:
- Creates the client with either Delivery API (published) or Preview API (draft) based on the `preview` flag
- Maps raw Contentful `Entry` shapes to the internal `Page` / `Section` types
- Validates the result through `PageSchema.parse()` — invalid Contentful data throws a `ZodError` before it reaches any UI component
- Exports only `getPageBySlug(slug, preview?)` and `getAllPageSlugs(preview?)` — no Contentful types leak out

Switching environments is a single boolean: `getPageBySlug(slug, true)` for draft, `getPageBySlug(slug)` for published.

---

## Publish + SemVer Logic

### Rules (deterministic, no heuristics)

| Change | Bump |
|---|---|
| Text / prop value changed | `patch` |
| Section added | `minor` |
| Optional prop added | `minor` |
| Section removed | `major` |
| Section type changed | `major` |
| Required prop removed | `major` |

Multiple changes in one publish take the highest bump.

### Flow (`/api/publish/[slug]`)

1. Auth check — must be `publisher` role (middleware + server-side double check)
2. Parse + validate draft via `PageSchema.parse()`
3. Load latest release from `releases/<slug>/<version>.json`
4. **Idempotency**: if `JSON.stringify(latest.snapshot) === JSON.stringify(draft)` → return existing release, no new version
5. Run `diffPages(prev, next)` → `{ bump, changelog }`
6. `incrementVersion(prevVersion, bump)` → new semver string
7. Write immutable snapshot to `releases/<slug>/<newVersion>.json`
8. Return `Release` object to client

### Release file format

```json
{
  "version": "1.2.0",
  "slug": "home",
  "publishedAt": "2026-05-12T10:00:00.000Z",
  "publishedBy": "publisher@example.com",
  "snapshot": { /* full Page object */ },
  "changelog": "Added section \"s3\" (type: testimonial)"
}
```

---

## Accessibility Evidence

### Implementation

- **Skip link**: visible on focus, links to `#main-content`
- **Heading hierarchy**: `h1` on every page, `h2` for sections, `h3` for sub-items
- **Focus management**: all interactive elements have `focus-visible` outlines (3px indigo, 2px offset)
- **Keyboard operability**: all studio controls (add/remove/reorder sections, props editor) are keyboard-accessible
- **ARIA labels**: sidebar buttons have `aria-label`, live regions use `aria-live="polite"`, errors use `role="alert"` + `aria-live="assertive"`
- **Reduced motion**: `globals.css` disables all animations/transitions when `prefers-reduced-motion: reduce`
- **Form labels**: every input has an associated `<label>` with matching `htmlFor`/`id`
- **Error announcements**: login errors use `role="alert"` so screen readers announce them immediately
- **Semantic HTML**: `<main>`, `<header>`, `<nav>`, `<aside>`, `<section>`, `<figure>`, `<blockquote>`, `<figcaption>`, `<ul role="list">` used throughout

### Automated checks

Playwright + `@axe-core/playwright` runs on every CI build:
- Tags: `wcag2a`, `wcag2aa`, `wcag21aa`
- Report saved to `a11y-reports/a11y-report.json` (CI artifact)
- CI fails on any `critical` or `serious` violation

> Full WCAG 2.2 AAA compliance requires manual testing with assistive technologies (NVDA, VoiceOver, JAWS) and expert review. The automated axe checks cover a significant subset but cannot replace manual audit.

---

## What Is Incomplete and Why

### 1. Contentful write-back
The studio edits Redux state only. Publishing saves a local JSON snapshot but does **not** write back to Contentful. A full implementation would use the Contentful Management API to update the draft entry. This was omitted because it requires a Management Token (different from Delivery/Preview) and adds significant complexity around conflict resolution.

### 2. Drag-and-drop reordering
Section reordering uses up/down buttons instead of drag-and-drop. A full DnD implementation (e.g. `@dnd-kit/core`) would improve UX but was deprioritised in favour of correctness and accessibility (DnD requires careful ARIA live region work to be accessible).

### 3. Vercel KV / database for releases
Releases are stored as local JSON files (`releases/<slug>/<version>.json`). On Vercel's serverless/edge runtime, the filesystem is read-only except for `/tmp`. A production deployment should use Vercel KV, a database, or an S3 bucket. The file-based approach works locally and in CI.

### 4. Feature grid item editing
The `featureGrid` section's `features` array is not editable in the studio props panel (only the heading is). Full array editing requires a dynamic list editor component which was scoped out.

### 5. WCAG 2.2 AAA manual audit
Automated axe covers WCAG 2.0/2.1 A/AA. AAA criteria (e.g. 1.4.6 Contrast Enhanced, 2.4.9 Link Purpose Link Only, 3.1.5 Reading Level) require manual review and are not fully verified.

---

## Setup

```bash
# 1. Clone and install
npm ci --legacy-peer-deps

# 2. Configure environment
cp .env.example .env.local
# Fill in CONTENTFUL_SPACE_ID, CONTENTFUL_DELIVERY_TOKEN, CONTENTFUL_PREVIEW_TOKEN, NEXTAUTH_SECRET

# 3. Run dev server
npm run dev

# 4. Run unit tests
npm test

# 5. Run e2e tests (requires running server)
npm run test:e2e
```

### Demo accounts

| Email | Password | Role |
|---|---|---|
| viewer@example.com | viewer123 | viewer |
| editor@example.com | editor123 | editor |
| publisher@example.com | publisher123 | publisher |

### Contentful setup

1. Create a Contentful space
2. Create content types `page` and `section` as described above
3. Add a `page` entry with slug `home` and at least one `section` entry
4. Copy your Space ID, Delivery Token, and Preview Token to `.env.local`
