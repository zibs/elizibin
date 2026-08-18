import { readdir } from "node:fs/promises";

import type { BlogPost } from "../blog-types";

function isBlogPost(value: unknown): value is BlogPost {
    return (
        typeof value === "object" &&
        value !== null &&
        "slug" in value &&
        "blocks" in value &&
        Array.isArray(value.blocks)
    );
}

export async function loadBlogPosts(): Promise<BlogPost[]> {
    const fileNames = (await readdir(new URL(".", import.meta.url)))
        .filter((fileName) => fileName.endsWith(".ts") && fileName !== "index.ts")
        .sort();

    const posts = await Promise.all(
        fileNames.map(async (fileName) => {
            const postModule: Record<string, unknown> = await import(
                new URL(fileName, import.meta.url).href
            );
            const exportedPosts = Object.values(postModule).filter(isBlogPost);

            if (exportedPosts.length !== 1) {
                throw new Error(
                    `Expected exactly one BlogPost export in content/blog-posts/${fileName}, found ${exportedPosts.length}.`,
                );
            }

            return exportedPosts[0];
        }),
    );

    return posts.sort(
        (left, right) =>
            right.publishedAt.localeCompare(left.publishedAt) ||
            left.slug.localeCompare(right.slug),
    );
}
