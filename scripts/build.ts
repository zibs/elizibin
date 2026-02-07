import { mkdir, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { projects, type Project } from "../content/projects";

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

type ProjectImageSources = {
    light: string | null;
    dark: string | null;
};

type ProjectSecondaryImage = {
    src: string | null;
};

type RenderPageOptions = {
    tools: RenderTools;
    title: string;
    description: string;
    headingLinksHome?: boolean;
    socialMeta?: SocialMeta;
    content: string;
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

function projectOutputPath(slug: string): string {
    return `oss/${encodeURIComponent(slug)}/index.html`;
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

function renderProjectsList(tools: RenderTools, projectEntries: Project[]): string {
    if (projectEntries.length === 0) {
        return html(`
            <ul class="font-roboto-mono text-lg leading-relaxed list-disc pl-7">
                <li>No projects listed yet.</li>
            </ul>
        `);
    }

    const listItems = projectEntries
        .map((project) => {
            const projectHref = tools.linkTo(projectOutputPath(project.slug));
            return `<li><a href="${projectHref}" class="${PRIMARY_LINK_CLASSES}">${escapeHtml(project.title)}</a>: ${escapeHtml(project.oneSentence)}</li>`;
        })
        .join("\n                ");

    return html(`
        <ul class="font-roboto-mono text-lg leading-relaxed list-disc pl-7 space-y-4">
                ${listItems}
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

function renderProjectParagraphs(paragraphs: string[]): string {
    return paragraphs
        .map(
            (paragraph) =>
                `<p class="font-roboto-mono text-lg leading-relaxed mb-9">${renderParagraphWithInlineLinks(paragraph)}</p>`,
        )
        .join("\n                ");
}

function renderHomePage(tools: RenderTools, projectEntries: Project[]): string {
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
                    Here are some of the open source projects I'm working on or I've built recently.
                </p>
                ${renderProjectsList(tools, projectEntries)}
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

function resolveProjectImageSources(
    tools: RenderTools,
    project: Project,
): ProjectImageSources {
    const lightPath = project.socialImageLight ?? project.socialImage;
    const darkPath = project.socialImageDark;

    return {
        light: resolveImageSource(tools, lightPath),
        dark: resolveImageSource(tools, darkPath),
    };
}

function resolveProjectSecondaryImage(
    tools: RenderTools,
    project: Project,
): ProjectSecondaryImage {
    return {
        src: resolveImageSource(tools, project.secondaryImage),
    };
}

function resolveProjectShareImagePath(project: Project): string | null {
    return (
        project.socialImageLight ??
        project.socialImage ??
        project.socialImageDark ??
        project.secondaryImage ??
        null
    );
}

function renderProjectPage(tools: RenderTools, project: Project): string {
    const imageSources = resolveProjectImageSources(tools, project);
    const secondaryImage = resolveProjectSecondaryImage(tools, project);
    const fallbackImageSrc = imageSources.light ?? imageSources.dark;
    const imageMarkup = fallbackImageSrc
        ? imageSources.dark
            ? html(`
                <figure class="mb-9 max-w-2xl mx-auto">
                    <picture>
                        <source media="(prefers-color-scheme: dark)" srcset="${escapeHtml(imageSources.dark)}" />
                        <img
                            src="${escapeHtml(fallbackImageSrc)}"
                            alt="Social preview for ${escapeHtml(project.title)}"
                            class="w-full h-auto rounded-xl border border-black/10 dark:border-white/15"
                        />
                    </picture>
                </figure>
            `)
            : html(`
                <figure class="mb-9 max-w-2xl mx-auto">
                    <img
                        src="${escapeHtml(fallbackImageSrc)}"
                        alt="Social preview for ${escapeHtml(project.title)}"
                        class="w-full h-auto rounded-xl border border-black/10 dark:border-white/15"
                    />
                </figure>
            `)
        : "";

    const secondaryImageMarkup = secondaryImage.src
        ? html(`
            <figure class="mb-9 max-w-2xl mx-auto">
                <img
                    src="${escapeHtml(secondaryImage.src)}"
                    alt="Additional preview for ${escapeHtml(project.title)}"
                    class="w-full h-auto rounded-xl border border-black/10 dark:border-white/15"
                />
            </figure>
        `)
        : "";

    return renderLayout({
        tools,
        title: `${project.title} | Eli Zibin`,
        description: project.oneSentence,
        headingLinksHome: true,
        socialMeta: {
            type: "article",
            imagePath: resolveProjectShareImagePath(project),
            imageAlt: `Social preview for ${project.title}`,
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
                <h2 class="font-roboto-mono text-2xl md:text-3xl tracking-normal leading-tight mb-6">
                    ${escapeHtml(project.title)}
                </h2>
                ${imageMarkup}
                ${secondaryImageMarkup}
                <p class="font-roboto-mono text-lg leading-relaxed mb-6">
                    ${escapeHtml(project.oneSentence)}
                </p>
                ${renderProjectParagraphs(project.paragraphs)}
                <p class="font-roboto-mono text-lg leading-relaxed">
                    <a
                        href="${escapeHtml(project.githubUrl)}"
                        target="_blank"
                        rel="noreferrer"
                        class="${PRIMARY_LINK_CLASSES}"
                    >
                        View on GitHub
                    </a>
                </p>
            </article>
        `),
    });
}

function assertNonEmpty(value: string, fieldName: string, slug: string): void {
    if (value.trim() === "") {
        throw new Error(`Project "${slug}" is missing a non-empty "${fieldName}" value.`);
    }
}

function validateLocalImagePath(imagePath: string, slug: string, fieldName: string): void {
    if (/^https?:\/\//.test(imagePath)) {
        return;
    }

    const normalizedPath = normalizeRootRelative(imagePath);
    if (normalizedPath.trim() === "") {
        throw new Error(`Project "${slug}" has an empty "${fieldName}" path.`);
    }
}

function validateParagraphLink(href: string, slug: string, fieldName: string): void {
    const trimmedHref = href.trim();
    if (trimmedHref === "") {
        throw new Error(`Project "${slug}" has an empty markdown link in "${fieldName}".`);
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
            `Project "${slug}" has an invalid markdown link in "${fieldName}": ${trimmedHref}`,
        );
    }
}

async function validateProjects(projectEntries: Project[]): Promise<void> {
    const seenSlugs = new Set<string>();

    for (const project of projectEntries) {
        assertNonEmpty(project.slug, "slug", project.slug || "<unknown>");
        assertNonEmpty(project.title, "title", project.slug);
        assertNonEmpty(project.oneSentence, "oneSentence", project.slug);
        assertNonEmpty(project.githubUrl, "githubUrl", project.slug);

        if (project.paragraphs.length === 0) {
            throw new Error(`Project "${project.slug}" must include at least one paragraph.`);
        }

        for (const [index, paragraph] of project.paragraphs.entries()) {
            const fieldName = `paragraphs[${index}]`;
            assertNonEmpty(paragraph, fieldName, project.slug);

            for (const match of paragraph.matchAll(MARKDOWN_LINK_PATTERN)) {
                const href = match[2];
                validateParagraphLink(href, project.slug, fieldName);
            }
        }

        if (!SLUG_PATTERN.test(project.slug)) {
            throw new Error(
                `Invalid slug "${project.slug}". Use lowercase letters, numbers, and hyphens only.`,
            );
        }

        if (seenSlugs.has(project.slug)) {
            throw new Error(`Duplicate slug "${project.slug}".`);
        }

        seenSlugs.add(project.slug);

        try {
            const parsedUrl = new URL(project.githubUrl);
            if (parsedUrl.protocol !== "https:") {
                throw new Error();
            }
        } catch {
            throw new Error(
                `Invalid githubUrl for "${project.slug}": ${project.githubUrl}`,
            );
        }

        const imageFields: Array<{ fieldName: string; value?: string }> = [
            { fieldName: "socialImage", value: project.socialImage },
            { fieldName: "socialImageLight", value: project.socialImageLight },
            { fieldName: "socialImageDark", value: project.socialImageDark },
            { fieldName: "secondaryImage", value: project.secondaryImage },
        ];

        for (const { fieldName, value } of imageFields) {
            if (!value) {
                continue;
            }

            validateLocalImagePath(value, project.slug, fieldName);

            if (/^https?:\/\//.test(value)) {
                continue;
            }

            const imagePath = path.join(ROOT_DIR, normalizeRootRelative(value));

            let imageStat;
            try {
                imageStat = await stat(imagePath);
            } catch {
                throw new Error(
                    `Image for "${project.slug}" not found (${fieldName}): ${value}`,
                );
            }

            if (!imageStat.isFile()) {
                throw new Error(
                    `Image for "${project.slug}" is not a file (${fieldName}): ${value}`,
                );
            }
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
            const resolvedPath = path.posix.normalize(
                path.posix.join(path.posix.dirname(outputPath), referencePath),
            );

            if (resolvedPath.startsWith("../")) {
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
    await validateProjects(projects);

    await rm(path.join(ROOT_DIR, "oss"), { recursive: true, force: true });

    const generatedPages = new Map<string, string>();

    const homeTools = createRenderTools(HOME_PAGE);
    const homeHtml = renderHomePage(homeTools, projects);
    generatedPages.set(HOME_PAGE, homeHtml);
    await writePage(HOME_PAGE, homeHtml);

    for (const project of projects) {
        const outputPath = projectOutputPath(project.slug);
        const pageTools = createRenderTools(outputPath);
        const pageHtml = renderProjectPage(pageTools, project);
        generatedPages.set(outputPath, pageHtml);
        await writePage(outputPath, pageHtml);
    }

    await validateGeneratedReferences(generatedPages);
}

await buildSite();
console.log(`Built ${projects.length} project page(s).`);
