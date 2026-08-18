export type BlogPostKind = "note" | "project" | "essay";

export type BlogBlockIdentity = {
    /** Stable across edits so blocks can be linked to and tracked over time. */
    id?: string;
};

export type BlogParagraphBlock = BlogBlockIdentity & {
    type: "paragraph";
    text: string;
};

export type BlogNoteBlock = BlogBlockIdentity & {
    type: "note";
    text: string;
};

export type BlogCaptionBlock = BlogBlockIdentity & {
    type: "caption";
    text: string;
};

export type BlogHeadingBlock = BlogBlockIdentity & {
    type: "heading";
    level: 2 | 3 | 4;
    text: string;
};

export type BlogImageBlock = BlogBlockIdentity & {
    type: "image";
    src: string;
    darkSrc?: string;
    alt: string;
    caption?: string;
    centered?: boolean;
    maxHeightPx?: number;
};

export type BlogVideoBlock = BlogBlockIdentity & {
    type: "video";
    src: string;
    alt: string;
    caption?: string;
    centered?: boolean;
    maxHeightPx?: number;
    poster?: string;
    autoplay?: boolean;
    loop?: boolean;
    muted?: boolean;
    controls?: boolean;
    playsInline?: boolean;
};

export type BlogCodeBlock = BlogBlockIdentity & {
    type: "code";
    language: string;
    code: string;
    caption?: string;
};

export type BlogTweetBlock = BlogBlockIdentity & {
    type: "tweet";
    url: string;
    caption?: string;
};

export type BlogMediaItem = BlogImageBlock | BlogVideoBlock;

export type BlogMediaGroupBlock = BlogBlockIdentity & {
    type: "media-group";
    items: BlogMediaItem[];
    caption?: string;
};

export type BlogBlock =
    | BlogParagraphBlock
    | BlogNoteBlock
    | BlogCaptionBlock
    | BlogHeadingBlock
    | BlogImageBlock
    | BlogVideoBlock
    | BlogCodeBlock
    | BlogTweetBlock
    | BlogMediaGroupBlock;

export type BlogPost = {
    slug: string;
    title: string;
    kind: BlogPostKind;
    summary: string;
    publishedAt: string;
    updatedAt?: string;
    published: boolean;
    githubUrl?: string;
    heroImage?: string;
    heroImageDark?: string;
    tags?: string[];
    blocks: BlogBlock[];
};
