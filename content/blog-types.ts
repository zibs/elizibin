export type BlogParagraphBlock = {
    type: "paragraph";
    text: string;
};

export type BlogHeadingBlock = {
    type: "heading";
    level: 2 | 3 | 4;
    text: string;
};

export type BlogImageBlock = {
    type: "image";
    src: string;
    alt: string;
    caption?: string;
    centered?: boolean;
    maxHeightPx?: number;
};

export type BlogCodeBlock = {
    type: "code";
    language: string;
    code: string;
    caption?: string;
};

export type BlogTweetBlock = {
    type: "tweet";
    url: string;
    caption?: string;
};

export type BlogBlock =
    | BlogParagraphBlock
    | BlogHeadingBlock
    | BlogImageBlock
    | BlogCodeBlock
    | BlogTweetBlock;

export type BlogPost = {
    slug: string;
    title: string;
    summary: string;
    publishedAt: string;
    githubUrl?: string;
    heroImage?: string;
    tags?: string[];
    blocks: BlogBlock[];
};
