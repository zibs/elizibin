import { mkdir, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { createHighlighter } from "shiki";
import {
    blogPosts,
    type BlogBlock,
    type BlogPost,
} from "../content/site-content";

const ROOT_DIR = process.cwd();
const HOME_PAGE = "index.html";
const DEFAULT_SITE_URL = "https://elizibin.com";
const SITE_URL = normalizeSiteUrl(process.env.SITE_URL ?? DEFAULT_SITE_URL);

const PRIMARY_LINK_CLASSES =
    "text-primary-light hover:text-secondary-light dark:text-[rgba(255,230,0,0.95)] dark:hover:text-[rgba(0,255,136,0.98)]";
const BODY_CLASSES =
    "bg-[rgb(252,252,252)] dark:bg-[rgb(7,7,7)] text-black dark:text-[rgb(238,234,234)]";
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const MARKDOWN_LINK_PATTERN = /\[([^\]]+)\]\(([^)]+)\)/g;
const BLOG_LIST_LIKE_PARAGRAPH_PATTERN = /^\s*(?:[-*]\s+|\d+\.\s+)/;
const BLOG_CODE_THEME_LIGHT = "catppuccin-latte";
const BLOG_CODE_THEME_DARK = "catppuccin-mocha";
const BLOG_CODE_LANGUAGES = ["ts", "tsx", "js", "jsx", "json", "bash"] as const;
const IMAGE_THEME_VARIANT_PATTERN = /-(dark|light)$/;
const TWEET_EMBED_HOSTS = new Set([
    "twitter.com",
    "www.twitter.com",
    "mobile.twitter.com",
    "x.com",
    "www.x.com",
    "mobile.x.com",
]);
const TWEET_STATUS_PATH_PATTERN =
    /^\/(?:i\/web\/)?(?:[A-Za-z0-9_]+\/)?status\/\d+(?:\/.*)?$/;
const BLOG_CODE_LANGUAGE_ALIASES: Record<string, (typeof BLOG_CODE_LANGUAGES)[number]> = {
    ts: "ts",
    typescript: "ts",
    tsx: "tsx",
    js: "js",
    javascript: "js",
    jsx: "jsx",
    json: "json",
    bash: "bash",
    sh: "bash",
    shell: "bash",
};

type RenderTools = {
    outputPath: string;
    linkTo: (targetOutputPath: string) => string;
    assetTo: (rootRelativePath: string) => string;
};

type SocialMeta = {
    type?: "website" | "article";
    imagePath?: string | null;
    imageAlt?: string;
};

type RenderPageOptions = {
    tools: RenderTools;
    title: string;
    description: string;
    headingLinksHome?: boolean;
    socialMeta?: SocialMeta;
    content: string;
};

type BlogCodeLanguage = (typeof BLOG_CODE_LANGUAGES)[number];

type BlogCodeHighlight = (code: string, language: string) => string;
type BlogParagraphSpacing = "default" | "list-item" | "list-item-last";
type BlogImageBlock = Extract<BlogBlock, { type: "image" }>;
type ImageThemeVariant = "light" | "dark" | null;
type FirstBlogImageBlock = {
    index: number;
    block: BlogImageBlock;
};
type BlogHeroThemeImagePair = {
    lightPath: string;
    darkPath: string;
    alt: string;
    caption?: string;
    pairedBlockIndex: number;
};

function normalizeRootRelative(value: string): string {
    return value.replace(/^\/+/, "");
}

function normalizeSiteUrl(value: string): string {
    return value.trim().replace(/\/+$/, "");
}

function escapeHtml(value: string): string {
    return value
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}

function stripIndent(text: string): string {
    const lines = text.replaceAll("\r\n", "\n").split("\n");

    while (lines.length > 0 && lines[0].trim() === "") {
        lines.shift();
    }

    while (lines.length > 0 && lines[lines.length - 1].trim() === "") {
        lines.pop();
    }

    const nonEmptyLines = lines.filter((line) => line.trim() !== "");
    const indentSize =
        nonEmptyLines.length === 0
            ? 0
            : Math.min(
                  ...nonEmptyLines.map((line) => {
                      const match = line.match(/^ */);
                      return match ? match[0].length : 0;
                  }),
              );

    return lines.map((line) => line.slice(indentSize)).join("\n");
}

function html(markup: string): string {
    return `${stripIndent(markup)}\n`;
}

function toPosixPath(value: string): string {
    return value.split(path.sep).join(path.posix.sep);
}

function relativeHref(fromOutputPath: string, toOutputPath: string): string {
    const fromDir = path.posix.dirname(fromOutputPath);
    const relativePath = path.posix.relative(fromDir, toOutputPath);
    return relativePath === "" ? "index.html" : relativePath;
}

function createRenderTools(outputPath: string): RenderTools {
    const normalizedOutputPath = toPosixPath(outputPath);

    return {
        outputPath: normalizedOutputPath,
        linkTo(targetOutputPath: string) {
            return relativeHref(normalizedOutputPath, toPosixPath(targetOutputPath));
        },
        assetTo(rootRelativePath: string) {
            return relativeHref(
                normalizedOutputPath,
                toPosixPath(normalizeRootRelative(rootRelativePath)),
            );
        },
    };
}

function blogPostOutputPath(slug: string): string {
    return `blog/${encodeURIComponent(slug)}/index.html`;
}

function outputPathToPublicPath(outputPath: string): string {
    const normalized = toPosixPath(outputPath);

    if (normalized === "index.html") {
        return "/";
    }

    if (normalized.endsWith("/index.html")) {
        return `/${normalized.slice(0, -"/index.html".length)}/`;
    }

    return `/${normalized}`;
}

function toAbsoluteSiteUrl(pathname: string): string {
    const normalizedPath = pathname.startsWith("/") ? pathname : `/${pathname}`;
    return new URL(normalizedPath, `${SITE_URL}/`).toString();
}

function toAbsoluteShareImageUrl(imagePath: string): string {
    if (/^https?:\/\//.test(imagePath)) {
        return imagePath;
    }

    return toAbsoluteSiteUrl(`/${normalizeRootRelative(imagePath)}`);
}

function parsePublishedAt(publishedAt: string): Date | null {
    const trimmed = publishedAt.trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
        return null;
    }

    const parsedDate = new Date(`${trimmed}T00:00:00.000Z`);
    if (Number.isNaN(parsedDate.getTime())) {
        return null;
    }

    const isoDate = parsedDate.toISOString().slice(0, 10);
    if (isoDate !== trimmed) {
        return null;
    }

    return parsedDate;
}

function formatPublishedAt(publishedAt: string): string {
    const parsedDate = parsePublishedAt(publishedAt);
    if (!parsedDate) {
        return publishedAt;
    }

    const day = String(parsedDate.getUTCDate()).padStart(2, "0");
    const month = String(parsedDate.getUTCMonth() + 1).padStart(2, "0");
    const year = String(parsedDate.getUTCFullYear());

    return `${day}/${month}/${year}`;
}

function normalizeBlogCodeLanguage(language: string): BlogCodeLanguage | null {
    const normalizedLanguage = language.trim().toLowerCase();
    return BLOG_CODE_LANGUAGE_ALIASES[normalizedLanguage] ?? null;
}

function formatSupportedBlogCodeLanguages(): string {
    return [...BLOG_CODE_LANGUAGES].join(", ");
}

function normalizeTweetEmbedUrl(value: string): string | null {
    const trimmedValue = value.trim();
    if (trimmedValue === "") {
        return null;
    }

    let parsedUrl: URL;
    try {
        parsedUrl = new URL(trimmedValue);
    } catch {
        return null;
    }

    if (parsedUrl.protocol !== "https:" && parsedUrl.protocol !== "http:") {
        return null;
    }

    if (!TWEET_EMBED_HOSTS.has(parsedUrl.hostname.toLowerCase())) {
        return null;
    }

    if (!TWEET_STATUS_PATH_PATTERN.test(parsedUrl.pathname)) {
        return null;
    }

    parsedUrl.protocol = "https:";
    parsedUrl.search = "";
    parsedUrl.hash = "";
    return parsedUrl.toString();
}

async function createBlogCodeHighlighter(): Promise<BlogCodeHighlight> {
    const highlighter = await createHighlighter({
        themes: [BLOG_CODE_THEME_LIGHT, BLOG_CODE_THEME_DARK],
        langs: [...BLOG_CODE_LANGUAGES],
    });

    return (code: string, language: string): string => {
        const normalizedLanguage = normalizeBlogCodeLanguage(language);
        if (!normalizedLanguage) {
            throw new Error(
                `Unsupported blog code language "${language}". Supported languages: ${formatSupportedBlogCodeLanguages()}.`,
            );
        }

        return highlighter.codeToHtml(code, {
            lang: normalizedLanguage,
            themes: {
                light: BLOG_CODE_THEME_LIGHT,
                dark: BLOG_CODE_THEME_DARK,
            },
            defaultColor: false,
        });
    };
}

function renderHead(
    tools: RenderTools,
    title: string,
    description: string,
    socialMeta?: SocialMeta,
): string {
    const canonicalUrl = toAbsoluteSiteUrl(outputPathToPublicPath(tools.outputPath));
    const socialType = socialMeta?.type ?? "website";
    const socialImageUrl = socialMeta?.imagePath
        ? toAbsoluteShareImageUrl(socialMeta.imagePath)
        : null;
    const socialImageAlt = socialMeta?.imageAlt;
    const twitterCard = socialImageUrl ? "summary_large_image" : "summary";

    return html(`
        <head>
            <meta charset="utf-8" />
            <meta http-equiv="x-ua-compatible" content="ie=edge" />
            <title>${escapeHtml(title)}</title>
            <meta
                name="description"
                content="${escapeHtml(description)}"
            />
            <link rel="canonical" href="${escapeHtml(canonicalUrl)}" />
            <meta property="og:type" content="${escapeHtml(socialType)}" />
            <meta property="og:title" content="${escapeHtml(title)}" />
            <meta property="og:description" content="${escapeHtml(description)}" />
            <meta property="og:url" content="${escapeHtml(canonicalUrl)}" />
            ${
                socialImageUrl
                    ? `<meta property="og:image" content="${escapeHtml(socialImageUrl)}" />`
                    : ""
            }
            ${
                socialImageUrl && socialImageAlt
                    ? `<meta property="og:image:alt" content="${escapeHtml(socialImageAlt)}" />`
                    : ""
            }
            <meta name="twitter:card" content="${twitterCard}" />
            <meta name="twitter:title" content="${escapeHtml(title)}" />
            <meta name="twitter:description" content="${escapeHtml(description)}" />
            ${
                socialImageUrl
                    ? `<meta name="twitter:image" content="${escapeHtml(socialImageUrl)}" />`
                    : ""
            }
            ${
                socialImageUrl && socialImageAlt
                    ? `<meta name="twitter:image:alt" content="${escapeHtml(socialImageAlt)}" />`
                    : ""
            }
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <link rel="shortcut icon" href="${tools.assetTo("img/favicon.ico")}" type="image/x-icon" />
            <link
                href="https://fonts.googleapis.com/css?family=Abril+Fatface|Great+Vibes|Roboto+Mono"
                rel="stylesheet"
            />
            <script src="https://cdn.tailwindcss.com?v=3.4.1"></script>
            <script>
                tailwind.config = {
                    darkMode: "media",
                    theme: {
                        extend: {
                            fontFamily: {
                                abril: ['"Abril Fatface"', "cursive"],
                                "great-vibes": ['"Great Vibes"', "cursive"],
                                "roboto-mono": ['"Roboto Mono"', "monospace"],
                            },
                            colors: {
                                primary: {
                                    light: "rgba(0, 111, 255, 0.9)",
                                    dark: "rgba(0, 255, 136, 0.9)",
                                },
                                secondary: {
                                    light: "rgba(255, 0, 255, 0.9)",
                                    dark: "rgba(255, 230, 0, 0.9)",
                                },
                            },
                        },
                    },
                };
            </script>
            <style>
                .gradient-text {
                    background: linear-gradient(
                        to right,
                        rgba(0, 111, 255, 0.9),
                        rgba(255, 0, 255, 0.9)
                    );
                    -webkit-background-clip: text;
                    background-clip: text;
                    color: transparent;
                }

                .gradient-underline {
                    height: 5px;
                    width: 100%;
                    background: linear-gradient(
                        to right,
                        rgba(0, 111, 255, 0.9),
                        rgba(255, 0, 255, 0.9)
                    );
                }

                .blog-code-block .shiki,
                .blog-code-block .shiki span {
                    background-color: var(--shiki-light-bg);
                    color: var(--shiki-light);
                }

                .blog-code-block .shiki {
                    overflow-x: auto;
                    padding: 1rem 1.125rem;
                    border-radius: 0.85rem;
                    border: 1px solid rgba(0, 0, 0, 0.14);
                    box-shadow: 0 16px 35px rgba(0, 0, 0, 0.08);
                }

                .blog-code-block .shiki code {
                    font-family: "Roboto Mono", monospace;
                    font-size: 0.9rem;
                    line-height: 1.6;
                }

                @media (prefers-color-scheme: dark) {
                    .gradient-text {
                        background: linear-gradient(
                            to right,
                            rgba(0, 255, 136, 0.9),
                            rgba(255, 230, 0, 0.9)
                        );
                        -webkit-background-clip: text;
                        background-clip: text;
                        color: transparent;
                    }

                    .gradient-underline {
                        background: linear-gradient(
                            to right,
                            rgba(0, 255, 136, 0.9),
                            rgba(255, 230, 0, 0.9)
                        );
                    }

                    .blog-code-block .shiki,
                    .blog-code-block .shiki span {
                        background-color: var(--shiki-dark-bg);
                        color: var(--shiki-dark);
                    }

                    .blog-code-block .shiki {
                        border-color: rgba(255, 255, 255, 0.2);
                        box-shadow: 0 18px 40px rgba(0, 0, 0, 0.45);
                    }
                }
            </style>
        </head>
    `);
}

function renderHeader(
    tools: RenderTools,
    headingLinksHome: boolean,
): string {
    if (headingLinksHome) {
        return html(`
            <header class="max-w-3xl mx-auto mb-16">
                <h1
                    class="font-great-vibes text-6xl md:text-7xl relative inline-block tracking-wider"
                >
                    <a href="${tools.linkTo(HOME_PAGE)}" class="hover:opacity-90">
                        Eli Zibin
                        <span class="gradient-underline absolute bottom-0 left-0"></span>
                    </a>
                </h1>
            </header>
        `);
    }

    return html(`
        <header class="max-w-3xl mx-auto mb-16">
            <h1
                class="font-great-vibes text-6xl md:text-7xl relative inline-block tracking-wider"
            >
                Eli Zibin
                <span class="gradient-underline absolute bottom-0 left-0"></span>
            </h1>
        </header>
    `);
}

function renderLayout({
    tools,
    title,
    description,
    headingLinksHome = false,
    socialMeta,
    content,
}: RenderPageOptions): string {
    return html(`
        <!DOCTYPE html>
        <html lang="en">
        ${renderHead(tools, title, description, socialMeta)}
            <body class="${BODY_CLASSES}">
                <main class="container mx-auto px-4 py-8">
        ${renderHeader(tools, headingLinksHome)}
        ${content}
                </main>
            </body>
        </html>
    `);
}

function renderGithubIconLink(githubUrl: string, label: string): string {
    return `<a href="${escapeHtml(githubUrl)}" target="_blank" rel="noreferrer" aria-label="${escapeHtml(label)}" title="${escapeHtml(label)}" class="inline-flex items-center leading-none text-black/75 hover:text-black dark:text-white/80 dark:hover:text-white"><svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8a8.01 8.01 0 0 0 5.47 7.59c.4.08.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82A7.65 7.65 0 0 1 8 4.86a7.7 7.7 0 0 1 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z"></path></svg></a>`;
}

function renderHomeBlogList(tools: RenderTools, blogEntries: BlogPost[]): string {
    const allItems = blogEntries.map((post) => {
        const postHref = tools.linkTo(blogPostOutputPath(post.slug));
        const githubUrl = post.githubUrl;
        const githubIconMarkup = githubUrl
            ? renderGithubIconLink(githubUrl, "Open GitHub repository")
            : "";
        const metaRowMarkup = `<div class="mt-1 flex items-center gap-x-2"><span class="font-roboto-mono text-xs opacity-70">(${escapeHtml(formatPublishedAt(post.publishedAt))})</span>${githubIconMarkup}</div>`;

        return `<li><div><a href="${postHref}" class="${PRIMARY_LINK_CLASSES}">${escapeHtml(post.title)}</a></div>${metaRowMarkup}<p class="font-roboto-mono text-base leading-relaxed mt-1">${renderParagraphWithInlineLinks(post.summary)}</p></li>`;
    });

    if (allItems.length === 0) {
        return html(`
            <p class="font-roboto-mono text-lg leading-relaxed">
                Nothing published yet.
            </p>
        `);
    }

    return html(`
        <ul class="font-roboto-mono text-lg leading-relaxed list-disc pl-7 space-y-5">
                ${allItems.join("\n                ")}
        </ul>
    `);
}

function markdownLinkToHtml(label: string, href: string): string {
    const trimmedHref = href.trim();
    const externalLink =
        trimmedHref.startsWith("http://") || trimmedHref.startsWith("https://");
    const targetAttributes = externalLink ? ` target="_blank" rel="noreferrer"` : "";

    return `<a href="${escapeHtml(trimmedHref)}"${targetAttributes} class="${PRIMARY_LINK_CLASSES}">${escapeHtml(label)}</a>`;
}

function renderParagraphWithInlineLinks(paragraph: string): string {
    const matches = Array.from(paragraph.matchAll(MARKDOWN_LINK_PATTERN));
    if (matches.length === 0) {
        return escapeHtml(paragraph);
    }

    let cursor = 0;
    let rendered = "";

    for (const match of matches) {
        const fullMatch = match[0];
        const label = match[1];
        const href = match[2];
        const matchIndex = match.index ?? 0;

        rendered += escapeHtml(paragraph.slice(cursor, matchIndex));
        rendered += markdownLinkToHtml(label, href);
        cursor = matchIndex + fullMatch.length;
    }

    rendered += escapeHtml(paragraph.slice(cursor));
    return rendered;
}

function renderHomePage(
    tools: RenderTools,
    blogEntries: BlogPost[],
): string {
    return renderLayout({
        tools,
        title: "Eli Zibin",
        description: "Eli Zibin is web and mobile software developer in Vancouver, BC",
        content: html(`
            <article class="max-w-3xl mx-auto mb-12">
                <p class="font-roboto-mono text-lg leading-relaxed mb-9">
                    Hi, I'm Eli. I'm a staff software developer at
                    <a
                        href="https://www.nearform.com"
                        class="${PRIMARY_LINK_CLASSES}"
                        >Nearform</a
                    >
                    working remotely from Vancouver, BC.
                </p>
                <p class="font-roboto-mono text-lg leading-relaxed mb-9">
                    I have a Bachelor of Arts in English Literature from the
                    <i>University of British Columbia</i>, as well as a
                    certificate in software development from <i>CodeCore</i>.
                </p>
            </article>
            <section class="max-w-3xl mx-auto">
                <p class="font-roboto-mono text-lg leading-relaxed mb-6">
                    writing:
                </p>
                ${renderHomeBlogList(tools, blogEntries)}
            </section>
        `),
    });
}

function resolveImageSource(
    tools: RenderTools,
    imagePath?: string,
): string | null {
    if (!imagePath) {
        return null;
    }

    if (/^https?:\/\//.test(imagePath)) {
        return imagePath;
    }

    return tools.assetTo(imagePath);
}

function resolveBlogShareImage(post: BlogPost): { path: string; alt: string } | null {
    if (post.heroImage) {
        return {
            path: post.heroImage,
            alt: `Hero image for ${post.title}`,
        };
    }

    const firstImageBlock = post.blocks.find(
        (block): block is Extract<BlogBlock, { type: "image" }> =>
            block.type === "image",
    );

    if (!firstImageBlock) {
        return null;
    }

    return {
        path: firstImageBlock.src,
        alt: firstImageBlock.alt,
    };
}

function normalizeImagePathIdentity(imagePath: string): string {
    const trimmedPath = imagePath.trim();
    if (trimmedPath === "") {
        return "";
    }

    let normalizedPath = trimmedPath;
    if (/^https?:\/\//.test(trimmedPath)) {
        try {
            normalizedPath = new URL(trimmedPath).pathname;
        } catch {
            normalizedPath = trimmedPath;
        }
    }

    const withoutQueryOrHash = normalizedPath.split(/[?#]/, 1)[0];
    const rootRelativePath = normalizeRootRelative(withoutQueryOrHash).toLowerCase();
    return rootRelativePath.replace(/\.[^./]+$/, "");
}

function imagePathThemeVariant(imagePath: string): ImageThemeVariant {
    const normalizedPathIdentity = normalizeImagePathIdentity(imagePath);
    if (normalizedPathIdentity.endsWith("-dark")) {
        return "dark";
    }

    if (normalizedPathIdentity.endsWith("-light")) {
        return "light";
    }

    return null;
}

function normalizeThemeImagePathIdentity(imagePath: string): string {
    const normalizedPathIdentity = normalizeImagePathIdentity(imagePath);
    return normalizedPathIdentity.replace(IMAGE_THEME_VARIANT_PATTERN, "");
}

function findFirstImageBlock(blocks: BlogBlock[]): FirstBlogImageBlock | null {
    for (const [index, block] of blocks.entries()) {
        if (block.type === "image") {
            return { index, block };
        }
    }

    return null;
}

function resolveBlogHeroThemeImagePair(post: BlogPost): BlogHeroThemeImagePair | null {
    if (!post.heroImage) {
        return null;
    }

    const firstImageBlock = findFirstImageBlock(post.blocks);
    if (!firstImageBlock) {
        return null;
    }

    const heroThemeVariant = imagePathThemeVariant(post.heroImage) ?? "light";
    const blockThemeVariant = imagePathThemeVariant(firstImageBlock.block.src) ?? "light";
    if (heroThemeVariant === blockThemeVariant) {
        return null;
    }

    if (
        normalizeThemeImagePathIdentity(post.heroImage) !==
        normalizeThemeImagePathIdentity(firstImageBlock.block.src)
    ) {
        return null;
    }

    return {
        lightPath: heroThemeVariant === "light" ? post.heroImage : firstImageBlock.block.src,
        darkPath: heroThemeVariant === "dark" ? post.heroImage : firstImageBlock.block.src,
        alt: firstImageBlock.block.alt,
        caption: firstImageBlock.block.caption,
        pairedBlockIndex: firstImageBlock.index,
    };
}

function shouldRenderBlogHeroImage(post: BlogPost): boolean {
    if (!post.heroImage) {
        return false;
    }

    const firstImageBlock = findFirstImageBlock(post.blocks);

    if (!firstImageBlock) {
        return true;
    }

    return (
        normalizeImagePathIdentity(post.heroImage) !==
        normalizeImagePathIdentity(firstImageBlock.block.src)
    );
}

function renderBlogTags(tags: string[] | undefined): string {
    if (!tags || tags.length === 0) {
        return "";
    }

    const tagMarkup = tags
        .map(
            (tag) =>
                `<span class="inline-flex rounded-full border border-black/15 dark:border-white/20 px-3 py-1 text-xs uppercase tracking-wide">${escapeHtml(tag)}</span>`,
        )
        .join("\n                        ");

    return html(`
        <p class="font-roboto-mono text-sm leading-relaxed flex flex-wrap gap-2 mb-8">
                        ${tagMarkup}
        </p>
    `);
}

function isListLikeBlogParagraph(text: string): boolean {
    return BLOG_LIST_LIKE_PARAGRAPH_PATTERN.test(text);
}

function blogParagraphMarginClass(spacing: BlogParagraphSpacing): string {
    if (spacing === "list-item") {
        return "mb-3";
    }

    if (spacing === "list-item-last") {
        return "mb-6";
    }

    return "mb-7";
}

function renderBlogBlock(
    tools: RenderTools,
    block: BlogBlock,
    highlightCode: BlogCodeHighlight,
    paragraphSpacing: BlogParagraphSpacing = "default",
): string {
    if (block.type === "paragraph") {
        const marginClass = blogParagraphMarginClass(paragraphSpacing);
        return `<p class="font-roboto-mono text-lg leading-relaxed ${marginClass}">${renderParagraphWithInlineLinks(block.text)}</p>`;
    }

    if (block.type === "heading") {
        if (block.level === 2) {
            return `<h2 class="font-roboto-mono text-2xl md:text-3xl leading-tight tracking-normal mt-12 mb-6">${escapeHtml(block.text)}</h2>`;
        }

        if (block.level === 3) {
            return `<h3 class="font-roboto-mono text-xl md:text-2xl leading-tight tracking-normal mt-10 mb-5">${escapeHtml(block.text)}</h3>`;
        }

        return `<h4 class="font-roboto-mono text-lg md:text-xl leading-tight tracking-normal mt-8 mb-4">${escapeHtml(block.text)}</h4>`;
    }

    if (block.type === "code") {
        const normalizedLanguage = normalizeBlogCodeLanguage(block.language);
        const languageLabel = normalizedLanguage ? normalizedLanguage.toUpperCase() : block.language;
        const highlightedCode = highlightCode(block.code, block.language);

        return html(`
            <figure class="mb-9 max-w-3xl mx-auto">
                <p class="font-roboto-mono text-xs uppercase tracking-wider opacity-70 mb-3">
                    ${escapeHtml(languageLabel)}
                </p>
                <div class="blog-code-block">
                    ${highlightedCode}
                </div>
                ${
                    block.caption
                        ? `<figcaption class="font-roboto-mono text-sm leading-relaxed mt-3 opacity-80">${escapeHtml(block.caption)}</figcaption>`
                        : ""
                }
            </figure>
        `);
    }

    if (block.type === "tweet") {
        const tweetUrl = normalizeTweetEmbedUrl(block.url);
        if (!tweetUrl) {
            return "";
        }

        return html(`
            <figure class="mb-9 max-w-3xl mx-auto">
                <div class="flex justify-center">
                    <blockquote class="twitter-tweet" data-dnt="true">
                        <a href="${escapeHtml(tweetUrl)}">${escapeHtml(tweetUrl)}</a>
                    </blockquote>
                </div>
                ${
                    block.caption
                        ? `<figcaption class="font-roboto-mono text-sm leading-relaxed mt-3 opacity-80">${escapeHtml(block.caption)}</figcaption>`
                        : ""
                }
            </figure>
        `);
    }

    const imageSrc = resolveImageSource(tools, block.src);
    if (!imageSrc) {
        return "";
    }

    const maxHeightPx =
        typeof block.maxHeightPx === "number" && Number.isFinite(block.maxHeightPx)
            ? Math.max(1, Math.round(block.maxHeightPx))
            : undefined;
    const imageSizeClasses = maxHeightPx ? "w-auto max-w-full h-auto object-contain" : "w-full h-auto";
    const imageAlignmentClasses = block.centered ? "block mx-auto" : "";
    const imageClassName =
        `${imageSizeClasses} ${imageAlignmentClasses} rounded-xl border border-black/10 dark:border-white/15`.trim();

    return html(`
        <figure class="mb-9 max-w-3xl mx-auto">
            <img
                src="${escapeHtml(imageSrc)}"
                alt="${escapeHtml(block.alt)}"
                loading="lazy"
                class="${imageClassName}"
                ${maxHeightPx ? `style="max-height: ${maxHeightPx}px;"` : ""}
            />
            ${
                block.caption
                    ? `<figcaption class="font-roboto-mono text-sm leading-relaxed mt-3 opacity-80">${escapeHtml(block.caption)}</figcaption>`
                    : ""
            }
        </figure>
    `);
}

function renderBlogBlocks(
    tools: RenderTools,
    blocks: BlogBlock[],
    highlightCode: BlogCodeHighlight,
): string {
    return blocks
        .map((block, index) => {
            if (block.type !== "paragraph") {
                return renderBlogBlock(tools, block, highlightCode);
            }

            if (!isListLikeBlogParagraph(block.text)) {
                return renderBlogBlock(tools, block, highlightCode);
            }

            const nextBlock = blocks[index + 1];
            const isNextListLikeParagraph =
                nextBlock?.type === "paragraph" && isListLikeBlogParagraph(nextBlock.text);
            const paragraphSpacing: BlogParagraphSpacing = isNextListLikeParagraph
                ? "list-item"
                : "list-item-last";

            return renderBlogBlock(tools, block, highlightCode, paragraphSpacing);
        })
        .join("\n                ");
}

function renderBlogPostPage(
    tools: RenderTools,
    post: BlogPost,
    highlightCode: BlogCodeHighlight,
): string {
    const shareImage = resolveBlogShareImage(post);
    const heroThemeImagePair = resolveBlogHeroThemeImagePair(post);
    const heroImageSrc = resolveImageSource(tools, post.heroImage);
    const hasTweetEmbed = post.blocks.some((block) => block.type === "tweet");
    const shouldRenderHeroImage = shouldRenderBlogHeroImage(post);
    const heroThemeLightImageSrc = resolveImageSource(tools, heroThemeImagePair?.lightPath);
    const heroThemeDarkImageSrc = resolveImageSource(tools, heroThemeImagePair?.darkPath);
    const heroImageMarkup =
        heroThemeImagePair && heroThemeLightImageSrc && heroThemeDarkImageSrc && shouldRenderHeroImage
            ? html(`
                <figure class="mb-9 max-w-3xl mx-auto">
                    <picture>
                        <source
                            srcset="${escapeHtml(heroThemeDarkImageSrc)}"
                            media="(prefers-color-scheme: dark)"
                        />
                        <img
                            src="${escapeHtml(heroThemeLightImageSrc)}"
                            alt="${escapeHtml(heroThemeImagePair.alt)}"
                            class="w-full h-auto rounded-xl border border-black/10 dark:border-white/15"
                        />
                    </picture>
                    ${
                        heroThemeImagePair.caption
                            ? `<figcaption class="font-roboto-mono text-sm leading-relaxed mt-3 opacity-80">${escapeHtml(heroThemeImagePair.caption)}</figcaption>`
                            : ""
                    }
                </figure>
            `)
            : heroImageSrc && shouldRenderHeroImage
        ? html(`
            <figure class="mb-9 max-w-3xl mx-auto">
                <img
                    src="${escapeHtml(heroImageSrc)}"
                    alt="Hero image for ${escapeHtml(post.title)}"
                    class="w-full h-auto rounded-xl border border-black/10 dark:border-white/15"
                />
            </figure>
        `)
        : "";
    const blogBlocksToRender = heroThemeImagePair
        ? post.blocks.filter((_block, index) => index !== heroThemeImagePair.pairedBlockIndex)
        : post.blocks;
    const tweetWidgetScriptMarkup = hasTweetEmbed
        ? `<script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>`
        : "";

    return renderLayout({
        tools,
        title: `${post.title} | Blog | Eli Zibin`,
        description: post.summary,
        headingLinksHome: true,
        socialMeta: {
            type: "article",
            imagePath: shareImage?.path ?? null,
            imageAlt: shareImage?.alt,
        },
        content: html(`
            <article class="max-w-3xl mx-auto">
                <p class="mb-9">
                    <a
                        href="${tools.linkTo(HOME_PAGE)}"
                        class="inline-flex items-center text-2xl leading-none ${PRIMARY_LINK_CLASSES}"
                        aria-label="Back home"
                        title="Back home"
                    >
                        &#8592;
                    </a>
                </p>
                <h2 class="font-roboto-mono text-2xl md:text-3xl tracking-normal leading-tight mb-3">
                    ${escapeHtml(post.title)}
                </h2>
                <p class="font-roboto-mono text-sm leading-relaxed opacity-75 mb-6">
                    ${escapeHtml(formatPublishedAt(post.publishedAt))}
                </p>
                ${renderBlogTags(post.tags)}
                <p class="font-roboto-mono text-lg leading-relaxed mb-9">
                    ${escapeHtml(post.summary)}
                </p>
                ${heroImageMarkup}
                ${renderBlogBlocks(tools, blogBlocksToRender, highlightCode)}
            </article>
            ${tweetWidgetScriptMarkup}
        `),
    });
}

function assertNonEmpty(
    value: string,
    fieldName: string,
    entityType: string,
    slug: string,
): void {
    if (value.trim() === "") {
        throw new Error(
            `${entityType} "${slug}" is missing a non-empty "${fieldName}" value.`,
        );
    }
}

function validateLocalImagePath(
    imagePath: string,
    entityType: string,
    slug: string,
    fieldName: string,
): void {
    if (/^https?:\/\//.test(imagePath)) {
        return;
    }

    const normalizedPath = normalizeRootRelative(imagePath);
    if (normalizedPath.trim() === "") {
        throw new Error(
            `${entityType} "${slug}" has an empty "${fieldName}" path.`,
        );
    }
}

function validateParagraphLink(
    href: string,
    entityType: string,
    slug: string,
    fieldName: string,
): void {
    const trimmedHref = href.trim();
    if (trimmedHref === "") {
        throw new Error(
            `${entityType} "${slug}" has an empty markdown link in "${fieldName}".`,
        );
    }

    if (
        trimmedHref.startsWith("/") ||
        trimmedHref.startsWith("#") ||
        trimmedHref.startsWith("mailto:") ||
        trimmedHref.startsWith("tel:")
    ) {
        return;
    }

    try {
        const parsedUrl = new URL(trimmedHref);
        if (parsedUrl.protocol !== "https:" && parsedUrl.protocol !== "http:") {
            throw new Error();
        }
    } catch {
        throw new Error(
            `${entityType} "${slug}" has an invalid markdown link in "${fieldName}": ${trimmedHref}`,
        );
    }
}

async function assertLocalImageExists(
    imagePath: string,
    entityType: string,
    slug: string,
    fieldName: string,
): Promise<void> {
    const absolutePath = path.join(ROOT_DIR, normalizeRootRelative(imagePath));

    let imageStat;
    try {
        imageStat = await stat(absolutePath);
    } catch {
        throw new Error(
            `Image for ${entityType.toLowerCase()} "${slug}" not found (${fieldName}): ${imagePath}`,
        );
    }

    if (!imageStat.isFile()) {
        throw new Error(
            `Image for ${entityType.toLowerCase()} "${slug}" is not a file (${fieldName}): ${imagePath}`,
        );
    }
}

async function validateBlogPosts(postEntries: BlogPost[]): Promise<void> {
    const seenSlugs = new Set<string>();

    for (const post of postEntries) {
        assertNonEmpty(post.slug, "slug", "Blog post", post.slug || "<unknown>");
        assertNonEmpty(post.title, "title", "Blog post", post.slug);
        assertNonEmpty(post.summary, "summary", "Blog post", post.slug);
        assertNonEmpty(post.publishedAt, "publishedAt", "Blog post", post.slug);

        if (!SLUG_PATTERN.test(post.slug)) {
            throw new Error(
                `Invalid blog slug "${post.slug}". Use lowercase letters, numbers, and hyphens only.`,
            );
        }

        if (seenSlugs.has(post.slug)) {
            throw new Error(`Duplicate blog slug "${post.slug}".`);
        }

        seenSlugs.add(post.slug);

        if (!parsePublishedAt(post.publishedAt)) {
            throw new Error(
                `Blog post "${post.slug}" has invalid "publishedAt" value "${post.publishedAt}". Use YYYY-MM-DD.`,
            );
        }

        if (post.tags) {
            for (const [tagIndex, tag] of post.tags.entries()) {
                assertNonEmpty(tag, `tags[${tagIndex}]`, "Blog post", post.slug);
            }
        }

        if (post.heroImage) {
            validateLocalImagePath(post.heroImage, "Blog post", post.slug, "heroImage");
            if (!/^https?:\/\//.test(post.heroImage)) {
                await assertLocalImageExists(
                    post.heroImage,
                    "Blog post",
                    post.slug,
                    "heroImage",
                );
            }
        }

        if (post.blocks.length === 0) {
            throw new Error(`Blog post "${post.slug}" must include at least one block.`);
        }

        const hasImageBlock = post.blocks.some((block) => block.type === "image");
        if (!post.heroImage && !hasImageBlock) {
            throw new Error(
                `Blog post "${post.slug}" must include "heroImage" or at least one image block so share metadata has an image.`,
            );
        }

        for (const [blockIndex, block] of post.blocks.entries()) {
            const blockPath = `blocks[${blockIndex}]`;

            if (block.type === "paragraph") {
                assertNonEmpty(block.text, `${blockPath}.text`, "Blog post", post.slug);

                for (const match of block.text.matchAll(MARKDOWN_LINK_PATTERN)) {
                    const href = match[2];
                    validateParagraphLink(
                        href,
                        "Blog post",
                        post.slug,
                        `${blockPath}.text`,
                    );
                }
                continue;
            }

            if (block.type === "heading") {
                assertNonEmpty(block.text, `${blockPath}.text`, "Blog post", post.slug);

                if (![2, 3, 4].includes(block.level)) {
                    throw new Error(
                        `Blog post "${post.slug}" has invalid heading level in "${blockPath}.level".`,
                    );
                }
                continue;
            }

            if (block.type === "code") {
                assertNonEmpty(
                    block.language,
                    `${blockPath}.language`,
                    "Blog post",
                    post.slug,
                );
                assertNonEmpty(block.code, `${blockPath}.code`, "Blog post", post.slug);

                if (!normalizeBlogCodeLanguage(block.language)) {
                    throw new Error(
                        `Blog post "${post.slug}" has unsupported code language in "${blockPath}.language": ${block.language}. Supported languages: ${formatSupportedBlogCodeLanguages()}.`,
                    );
                }

                if (block.caption !== undefined) {
                    assertNonEmpty(
                        block.caption,
                        `${blockPath}.caption`,
                        "Blog post",
                        post.slug,
                    );
                }

                continue;
            }

            if (block.type === "tweet") {
                assertNonEmpty(block.url, `${blockPath}.url`, "Blog post", post.slug);

                if (!normalizeTweetEmbedUrl(block.url)) {
                    throw new Error(
                        `Blog post "${post.slug}" has an invalid tweet URL in "${blockPath}.url": ${block.url}`,
                    );
                }

                if (block.caption !== undefined) {
                    assertNonEmpty(
                        block.caption,
                        `${blockPath}.caption`,
                        "Blog post",
                        post.slug,
                    );
                }

                continue;
            }

            assertNonEmpty(block.src, `${blockPath}.src`, "Blog post", post.slug);
            assertNonEmpty(block.alt, `${blockPath}.alt`, "Blog post", post.slug);

            if (block.caption !== undefined) {
                assertNonEmpty(
                    block.caption,
                    `${blockPath}.caption`,
                    "Blog post",
                    post.slug,
                );
            }

            validateLocalImagePath(block.src, "Blog post", post.slug, `${blockPath}.src`);

            if (/^https?:\/\//.test(block.src)) {
                continue;
            }

            await assertLocalImageExists(
                block.src,
                "Blog post",
                post.slug,
                `${blockPath}.src`,
            );
        }
    }
}

async function writePage(outputPath: string, htmlContent: string): Promise<void> {
    const absolutePath = path.join(ROOT_DIR, outputPath);
    await mkdir(path.dirname(absolutePath), { recursive: true });
    await writeFile(absolutePath, htmlContent, "utf8");
}

function isSkippableReference(reference: string): boolean {
    return (
        reference.startsWith("http://") ||
        reference.startsWith("https://") ||
        reference.startsWith("mailto:") ||
        reference.startsWith("tel:") ||
        reference.startsWith("data:") ||
        reference.startsWith("#")
    );
}

async function validateGeneratedReferences(
    generatedPages: Map<string, string>,
): Promise<void> {
    const attributePattern = /(href|src|srcset)="([^"]+)"/g;

    for (const [outputPath, fileContents] of generatedPages) {
        for (const match of fileContents.matchAll(attributePattern)) {
            const reference = match[2];
            if (isSkippableReference(reference)) {
                continue;
            }

            const [referencePath] = reference.split(/[?#]/, 1);
            const resolvedPath = referencePath.startsWith("/")
                ? path.posix.normalize(referencePath.slice(1))
                : path.posix.normalize(
                      path.posix.join(path.posix.dirname(outputPath), referencePath),
                  );

            if (resolvedPath.startsWith("../") || resolvedPath.startsWith("/")) {
                throw new Error(
                    `Reference escapes project root in "${outputPath}": ${reference}`,
                );
            }

            const absolutePath = path.join(ROOT_DIR, resolvedPath);
            try {
                const fileStat = await stat(absolutePath);
                if (!fileStat.isFile()) {
                    throw new Error();
                }
            } catch {
                throw new Error(
                    `Broken ${match[1]} in "${outputPath}": ${reference}`,
                );
            }
        }
    }
}

async function buildSite(): Promise<void> {
    await validateBlogPosts(blogPosts);

    const orderedBlogPosts = blogPosts;
    const highlightBlogCode = await createBlogCodeHighlighter();

    await rm(path.join(ROOT_DIR, "oss"), { recursive: true, force: true });
    await rm(path.join(ROOT_DIR, "blog"), { recursive: true, force: true });

    const generatedPages = new Map<string, string>();

    const homeTools = createRenderTools(HOME_PAGE);
    const homeHtml = renderHomePage(homeTools, orderedBlogPosts);
    generatedPages.set(HOME_PAGE, homeHtml);
    await writePage(HOME_PAGE, homeHtml);

    for (const post of orderedBlogPosts) {
        const outputPath = blogPostOutputPath(post.slug);
        const pageTools = createRenderTools(outputPath);
        const pageHtml = renderBlogPostPage(pageTools, post, highlightBlogCode);
        generatedPages.set(outputPath, pageHtml);
        await writePage(outputPath, pageHtml);
    }

    await validateGeneratedReferences(generatedPages);
}

await buildSite();
console.log(`Built ${blogPosts.length} blog page(s).`);
