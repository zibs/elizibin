# Eli Zibin

A personal website.

## Blog Planning + Authoring

Blog implementation planning and post authoring conventions are documented in:

- `docs/blog-feature-plan-and-authoring.md`

## Open Source Project Pages + Blog

This site now uses a Bun + TypeScript build step to generate static pages.

### Content source

Add/update projects in:

- `content/projects.ts`
- `content/blog.ts` (for blog posts)

Each project has:

- `slug`
- `title`
- `oneSentence`
- `paragraphs` (array of paragraph strings)
- `githubUrl`
- `socialImageLight` (optional)
- `socialImageDark` (optional)
- `socialImage` (optional fallback if you only have one image)
- `secondaryImage` (optional, displayed below the main image)

You can embed links in paragraph text using markdown-style links:

- `[Link text](https://example.com)`

Blog posts support block-based composition:

- `paragraph`
- `heading`
- `image`
- `code` (Shiki-highlighted, light/dark theme aware)

### Build

Run:

```bash
bun run build
```

Optional (for absolute social/canonical URLs):

```bash
SITE_URL="https://elizibin.com" bun run build
```

This generates:

- `index.html` (home page, including projects and recent blog posts)
- `oss/<slug>/index.html` (project detail pages)
- `blog/index.html` (blog index)
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

Then use the emitted snippet in `content/blog.ts`.

### Typecheck

Run:

```bash
npm run typecheck
```

### Build checks

The build validates:

- project slug format and duplicates
- blog slug format, dates, and content blocks
- blog code block language support
- local social image file existence
- local blog image file existence
- generated internal `href` and `src` references

Internal links are emitted as explicit `index.html` paths so local `file://` browsing works consistently.

Project detail pages emit Open Graph and Twitter meta tags using the project's share image fields.

### Blog code highlighting

- Blog code blocks are highlighted at build time with Shiki.
- Theme pairing:
  - Light: `catppuccin-latte`
  - Dark: `catppuccin-mocha`
- Current language support: `ts`, `tsx`, `js`, `jsx`, `json`, `bash` (with aliases documented in `docs/blog-feature-plan-and-authoring.md`).

## Deploy

This project is still a plain static site. There is no SSR/runtime requirement.

### Recommended flow

1. Edit `content/projects.ts` or `content/blog.ts`, and add/update images in `img/projects/` or `img/blog/`.
2. Do not manually edit generated files in `oss/**` or `blog/**` (they are overwritten by build).
3. Run `bun run build`.
4. Run `npm run typecheck`.
5. Commit and push.
6. Deploy the repo as static files.

### Netlify (simple setup)

- Site type: static
- Build command: _(leave blank if you commit generated files)_
- Publish directory: `.`
- Optional env var: `SITE_URL=https://your-domain.com` (only needed if Netlify runs the build command)

If you keep generated files committed (`index.html` + `oss/**` + `blog/**`), Netlify can deploy directly without running Bun in CI.

## Dependency Management

- This repo uses Bun as the package manager/runtime for build tasks.
- Commit `bun.lock`.
- Do not commit `package-lock.json` (npm lockfile).
