# Eli Zibin

A personal website.

## Blog Planning + Authoring

Blog implementation planning and post authoring conventions are documented in:

- `docs/blog-feature-plan-and-authoring.md`

## Blog Site

This site now uses a Bun + TypeScript build step to generate static pages.

### Content source

Blog post files:

- `content/blog-posts/*.ts` (one file per post)
- `content/blog-posts/index.ts` (post exports + `blogPosts` ordering)
- `content/site-content.ts` (build entrypoint that re-exports blog content/types)

When adding a new post:

1. Add a new post file in `content/blog-posts/`.
2. Export it from `content/blog-posts/index.ts` and include it in `blogPosts` ordering.

You can embed links in paragraph text using markdown-style links:

- `[Link text](https://example.com)`

Blog posts support block-based composition:

- `paragraph`
- `heading`
- `image`
- `code` (Shiki-highlighted, light/dark theme aware)
- `tweet` (Twitter/X status embed via URL)

### Build

Run:

```bash
bun run build
```

Optional (for absolute social/canonical URLs):

```bash
SITE_URL="https://elizibin.com" bun run build
```

### Dev (Auto Rebuild + Live Reload)

Run:

```bash
npm run dev
```

This starts a local static server (default `http://localhost:5173`) and watches:

- `content/**`
- `img/**`
- `scripts/build.ts`

When those files change, it rebuilds the site and reloads any open browser tabs automatically.

Optional custom port:

```bash
PORT=3000 npm run dev
```

This generates:

- `index.html` (home page with blog post list)
- `blog/<slug>/index.html` (blog post pages)
- `bun.lock` (Bun dependency lockfile)

### Excalidraw blog asset helper

Convert Excalidraw checkpoint JSON (from MCP `read_checkpoint`) into repo-local blog assets:

```bash
bun run excalidraw:asset -- --input /tmp/diagram.json --slug my-post --name system-flow
```

This writes:

- `img/blog/<slug>/<name>.excalidraw.json` (source scene)
- `img/blog/<slug>/<name>.svg` (native Excalidraw style export)
- `img/blog/<slug>/<name>.png` (default output for blog embedding)

Default style preset: `handdrawn-soft`

- Shapes: hachure fill, rounded corners (rectangles), medium roughness
- Text: hand-drawn font family (Virgil-style)
- Arrows/lines: medium sloppiness with arrowhead defaults

Text rendering reliability note:

- Prefer explicit `text` elements for diagram node captions.
- Do not rely only on shape `label` values for critical text.
- If generated PNG/SVG assets show unlabeled boxes, move those labels into standalone
  `text` elements in the checkpoint JSON and rerun `bun run excalidraw:asset`.

Skip PNG generation:

```bash
bun run excalidraw:asset -- --input /tmp/diagram.json --slug my-post --name system-flow --no-png
```

Disable style preset and keep source styles exactly:

```bash
bun run excalidraw:asset -- --input /tmp/diagram.json --slug my-post --name system-flow --no-style-preset
```

You can also pipe JSON from stdin:

```bash
cat /tmp/diagram.json | bun run excalidraw:asset -- --slug my-post --name system-flow
```

Then use the emitted snippet in the matching post file in `content/blog-posts/`.

### Typecheck

Run:

```bash
npm run typecheck
```

### Build checks

The build validates:

- blog slug format, dates, and content blocks
- blog code block language support
- tweet block URL format (`twitter.com` / `x.com` status links)
- blog share metadata image presence (`heroImage` or at least one `image` block)
- local blog image file existence
- generated internal `href` and `src` references

Internal links are emitted as explicit `index.html` paths so local `file://` browsing works consistently.

### Blog code highlighting

- Blog code blocks are highlighted at build time with Shiki.
- Theme pairing:
  - Light: `catppuccin-latte`
  - Dark: `catppuccin-mocha`
- Current language support: `ts`, `tsx`, `js`, `jsx`, `json`, `bash` (with aliases documented in `docs/blog-feature-plan-and-authoring.md`).

## Deploy

This project is still a plain static site. There is no SSR/runtime requirement.

### Recommended flow

1. Edit a post in `content/blog-posts/` (and/or `content/blog-posts/index.ts`), plus images in `img/blog/` (or reused assets).
2. Do not manually edit generated files in `blog/**` (they are overwritten by build).
3. Run `bun run build`.
4. Run `npm run typecheck`.
5. Commit and push.
6. Deploy the repo as static files.

### Netlify (simple setup)

- Site type: static
- Build command: _(leave blank if you commit generated files)_
- Publish directory: `.`
- Optional env var: `SITE_URL=https://your-domain.com` (only needed if Netlify runs the build command)

If you keep generated files committed (`index.html` + `blog/**`), Netlify can deploy directly without running Bun in CI.

## Dependency Management

- This repo uses Bun as the package manager/runtime for build tasks.
- Commit `bun.lock`.
- Do not commit `package-lock.json` (npm lockfile).
