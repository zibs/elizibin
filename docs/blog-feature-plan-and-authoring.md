# Blog Feature Plan And Authoring Spec

Status: Phase 1 implemented on 2026-02-16.

## Goals

- Add a simple blog to this static site.
- Support flexible post composition with no hard cap on text/image sections.
- Support text, titles, headers, images, GIFs, and diagram images (PNG/WebP/JPG).
- Keep implementation aligned with the existing TypeScript build pipeline (`scripts/build.ts`).
- Define a clear authoring contract so agents from other repos can generate post content and paste it here.

## MVP Scope

- Blog index page: `blog/index.html`.
- Blog post pages: `blog/<slug>/index.html`.
- Content blocks:
  - `paragraph`
  - `heading`
  - `image`
- Optional inline markdown-style links in paragraph text: `[label](https://example.com)`.
- Reuse existing site shell (head, typography, color system) for visual consistency.

Out of scope for MVP:

- Code syntax highlighting (planned follow-up).
- RSS feed.
- Full markdown parser.
- CMS/editor UI.

## Proposed Content Model

Create a typed, block-based schema so each post can have any number of sections.

```ts
export type BlogBlock =
    | {
          type: "paragraph";
          text: string;
      }
    | {
          type: "heading";
          level: 2 | 3 | 4;
          text: string;
      }
    | {
          type: "image";
          src: string; // local (/img/blog/...) or https URL
          alt: string;
          caption?: string;
      };

export type BlogPost = {
    slug: string; // kebab-case, unique
    title: string;
    summary: string; // used in blog index cards + meta description
    publishedAt: string; // YYYY-MM-DD
    heroImage?: string; // optional social/share image
    tags?: string[];
    blocks: BlogBlock[]; // unlimited length
};
```

## Repo Structure (Planned)

- `content/blog.ts`
  - Exports `BlogPost` type, `BlogBlock` type, and `blogPosts` array.
- `img/blog/<slug>/...`
  - Store post images and diagrams per post.
- `blog/index.html` (generated)
- `blog/<slug>/index.html` (generated)

## Rendering Rules

- Render blocks in array order; do not enforce a max block count.
- `paragraph` -> `<p>` with existing body typography class.
- `heading` -> `<h2>/<h3>/<h4>` based on `level`.
- `image` -> `<figure><img/><figcaption/></figure>` when caption exists.
- GIFs are handled exactly like images (`<img>`), no special-case renderer needed.
- Require non-empty `alt` text on every image block.

## Build/Validation Rules (Planned)

Extend `scripts/build.ts` with blog validation similar to existing project validation:

- `slug` is unique and matches existing slug pattern.
- `publishedAt` is valid `YYYY-MM-DD`.
- `title`, `summary`, and `blocks` are non-empty.
- Local image paths exist and are files.
- Generated internal links and image references resolve.

## Implementation Plan

1. Add blog content model
   - Create `content/blog.ts` and add one seed post.
2. Add blog rendering in build script
   - Add `renderBlogIndexPage`.
   - Add `renderBlogPostPage`.
   - Write pages to `blog/` output paths.
3. Connect navigation
   - Add a blog link from home page (`index.html` template generation).
4. Add validation
   - Validate post schema and local assets.
5. Verify + document
   - Run build and typecheck.
   - Keep this spec updated as schema evolves.

## Agent Authoring Contract

When generating a new blog post from another repo/agent:

1. Create or reuse image assets in `img/blog/<slug>/`.
2. Add one `BlogPost` entry to `content/blog.ts`.
3. Use only supported block types (`paragraph`, `heading`, `image`) for MVP.
4. Keep paragraphs plain text with optional inline markdown links.
5. Ensure every image has meaningful `alt`.
6. Run:
   - `bun run build`
   - `npm run typecheck`

## Copy/Paste Template For New Posts

```ts
{
    slug: "descriptive-kebab-slug",
    title: "Post Title",
    summary: "One-sentence summary for cards and metadata.",
    publishedAt: "2026-02-16",
    heroImage: "/img/blog/descriptive-kebab-slug/hero.png",
    tags: ["engineering"],
    blocks: [
        {
            type: "paragraph",
            text: "Intro paragraph with an optional [link](https://example.com).",
        },
        {
            type: "heading",
            level: 2,
            text: "Section Heading",
        },
        {
            type: "paragraph",
            text: "More body content.",
        },
        {
            type: "image",
            src: "/img/blog/descriptive-kebab-slug/system-diagram.png",
            alt: "System diagram showing request flow from client to API.",
            caption: "Request flow for the blog publish pipeline.",
        },
    ],
}
```

## Follow-Up: Code Blocks (Phase 2)

When ready, add a `code` block type instead of free-form HTML:

```ts
{
    type: "code";
    language: string;
    code: string;
    caption?: string;
}
```

Then render with a highlighter (server-time in build step) while preserving static output.
