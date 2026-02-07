# Eli Zibin

A personal website.

## Open Source Project Pages

This site now uses a Bun + TypeScript build step to generate static pages.

### Content source

Add/update projects in:

- `content/projects.ts`

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

- `index.html` (home page, including the sentence + unordered project list)
- `oss/<slug>/index.html` (project detail pages)
- `bun.lock` (Bun dependency lockfile)

### Typecheck

Run:

```bash
npm run typecheck
```

### Build checks

The build validates:

- project slug format and duplicates
- local social image file existence
- generated internal `href` and `src` references

Internal links are emitted as explicit `index.html` paths so local `file://` browsing works consistently.

Project detail pages emit Open Graph and Twitter meta tags using the project's share image fields.

## Deploy

This project is still a plain static site. There is no SSR/runtime requirement.

### Recommended flow

1. Edit `content/projects.ts` and add/update images in `img/projects/`.
2. Do not manually edit generated files in `oss/**` (they are overwritten by build).
3. Run `bun run build`.
4. Run `npm run typecheck`.
5. Commit and push.
6. Deploy the repo as static files.

### Netlify (simple setup)

- Site type: static
- Build command: _(leave blank if you commit generated files)_
- Publish directory: `.`
- Optional env var: `SITE_URL=https://your-domain.com` (only needed if Netlify runs the build command)

If you keep generated files committed (`index.html` + `oss/**`), Netlify can deploy directly without running Bun in CI.

## Dependency Management

- This repo uses Bun as the package manager/runtime for build tasks.
- Commit `bun.lock`.
- Do not commit `package-lock.json` (npm lockfile).
