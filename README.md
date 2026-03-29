# Eli Zibin

A personal website.

## Blog Planning + Authoring

Blog implementation planning and post authoring conventions are documented in:

- `docs/blog-style-guide.md`
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
2. Set `published: false` while drafting, then flip to `published: true` when ready to ship.
3. Export it from `content/blog-posts/index.ts` and include it in `blogPosts` ordering.

Paragraph and summary text support a small inline markup set:

- backticks for inline code: `inline code`
- `[Link text](https://example.com)`
- `~~strikethrough~~`
- raw `<i>` / `<em>` tags

Blog posts support block-based composition:

- `paragraph`
- `heading`
- `image`
- `video` (MP4 via `<video>`, supports autoplay/loop/muted/controls)
- `code` (Shiki-highlighted, light/dark theme aware)
- `tweet` (Twitter/X status embed via URL)

### Build

Run:

```bash
bun run build
```

Default build behavior:

- Only posts with `published: true` are validated and generated.
- Unpublished posts are skipped, so draft work does not block deploy builds.

Optional (for absolute social/canonical URLs):

```bash
SITE_URL="https://elizibin.com" bun run build
```

Optional (include drafts in a local build):

```bash
BLOG_INCLUDE_UNPUBLISHED=true bun run build
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
Dev mode sets `BLOG_INCLUDE_UNPUBLISHED=true`, so unpublished drafts are visible locally.

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
- `img/blog/<slug>/<name>-light.svg` (light mode SVG export)
- `img/blog/<slug>/<name>-dark.svg` (dark mode SVG export)
- `img/blog/<slug>/<name>-light.png` (light mode PNG export, default blog `src`)
- `img/blog/<slug>/<name>-dark.png` (dark mode PNG export, default blog `darkSrc`)

Default style preset: `handdrawn-soft`

- Shapes: hachure fill, rounded corners (rectangles), medium roughness
- Text: hand-drawn font family (Virgil-style)
- Arrows/lines: medium sloppiness with arrowhead defaults

Text rendering reliability note:

- `bun run excalidraw:asset` now auto-promotes shape/arrow `label` text into standalone
  `text` elements before export (and strips `label` fields in output assets), so labels survive
  PNG/SVG export reliably.
- Still prefer concise, explicit `text` elements in the authored checkpoint for critical captions.

Clipping prevention note:

- Keep all important text at least ~40px away from diagram edges.
- Prefer short lines (roughly <= 30-35 characters per line) over very long single-line captions.
- Always visually verify generated PNG(s) before finalizing the post.

Default theme export note:

- `bun run excalidraw:asset` now exports both light and dark variants by default.
- The emitted snippet uses `src` plus `darkSrc` so blog images can switch automatically with
  `prefers-color-scheme`.
- If you need a one-off export, pass `--variants light` or `--variants dark`.

Skip PNG generation:

```bash
bun run excalidraw:asset -- --input /tmp/diagram.json --slug my-post --name system-flow --no-png
```

Disable style preset and keep source styles exactly:

```bash
bun run excalidraw:asset -- --input /tmp/diagram.json --slug my-post --name system-flow --no-style-preset
```

Legacy export parity note:

- When regenerating from a preserved repo-local `.excalidraw.json`, start with
  `--no-style-preset`.
- If the preserved scene relied on inline Excalidraw `label` rendering and the new `-light`
  output does not match, retry with `--no-promote-labels` so the source scene and exported light
  asset stay exact.
- If the new `-light` export does not match the existing unsuffixed asset dimensions or bytes,
  retry with the historical padding used by some older diagrams:

```bash
bun run excalidraw:asset -- --input /tmp/diagram.json --slug my-post --name system-flow --no-style-preset --no-promote-labels --export-padding 48
```

You can also pipe JSON from stdin:

```bash
cat /tmp/diagram.json | bun run excalidraw:asset -- --slug my-post --name system-flow
```

Then use the emitted snippet in the matching post file in `content/blog-posts/`.

Theme-aware image blocks support:

```ts
{
    type: "image",
    src: "/img/blog/my-post/system-flow-light.png",
    darkSrc: "/img/blog/my-post/system-flow-dark.png",
    alt: "Meaningful description of the diagram",
    caption: "Optional caption",
}
```

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
- local blog media file existence (`image`, `video`, and optional `video.poster`)
- generated internal `href` and `src` references

Validation runs against the set of posts being built:

- default `bun run build`: published posts only
- `BLOG_INCLUDE_UNPUBLISHED=true`: published + unpublished posts

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
