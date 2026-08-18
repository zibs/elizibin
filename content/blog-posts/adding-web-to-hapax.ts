import type { BlogPost } from "../blog-types";

export const addingWebToHapaxPost: BlogPost = {
    slug: "adding-web-to-hapax",
    title: "Adding Web to Hapax",
    kind: "project",
    summary: "Hapax on my laptop, mostly for free.",
    publishedAt: "2026-03-19",
    updatedAt: "2026-08-18",
    published: true,
    heroImage: "/img/blog/hapax-web/dictionary-current.png",
    tags: ["hapax", "expo", "react-native", "web", "sqlite", "cloudflare"],
    blocks: [
        {
            id: "why-web",
            type: "paragraph",
            text: "I wanted Hapax on my laptop. React Native Web made that surprisingly easy: a few `.web.ts` files, a few browser-specific fixes, and most of the app just carried over. The original iOS version is [over here](/blog/hapax-offline-first-dictionary-ios/index.html).",
        },
        {
            id: "dictionary-list",
            type: "image",
            src: "/img/blog/hapax-web/dictionary-current.png",
            alt: "Hapax running in Safari, showing the current web dictionary with search, entries, tags, navigation, and toolbar actions.",
            centered: true,
            maxHeightPx: 620,
        },
        {
            id: "what-changed",
            type: "note",
            text: "The app itself—dictionary, favorites, tags, review, sync—mostly just carried over. The actual web work was sheets, routing, auth callbacks, getting SQLite to behave in the browser, and some fiddly Cloudflare routing.",
        },
        {
            id: "web-screens",
            type: "media-group",
            items: [
                {
                    id: "favorites-list",
                    type: "image",
                    src: "/img/blog/hapax-web/favorites-current.png",
                    alt: "Hapax favorites screen in Safari, showing saved dictionary entries with definitions, tags, gem markers, search, and navigation.",
                    centered: true,
                    maxHeightPx: 700,
                },
                {
                    id: "tags-list",
                    type: "image",
                    src: "/img/blog/hapax-web/tags-current.png",
                    alt: "Hapax tags screen in Safari, showing an alphabetical list of tags with colored underlines and navigation.",
                    centered: true,
                    maxHeightPx: 700,
                },
                {
                    id: "review-screen",
                    type: "image",
                    src: "/img/blog/hapax-web/review-current.png",
                    alt: "Hapax review screen in Safari, showing a large dictionary entry card with navigation and shuffle controls.",
                    centered: true,
                    maxHeightPx: 680,
                },
                {
                    id: "sync-screen",
                    type: "image",
                    src: "/img/blog/hapax-web/sync-current.png",
                    alt: "Hapax sync settings in Safari, showing current sync status, refresh and cloud replacement actions, diagnostics, and a close button.",
                    centered: true,
                    maxHeightPx: 720,
                },
            ],
        },
        {
            id: "done",
            type: "caption",
            text: "After that it was done. I like when a project is this uneventful.",
        },
    ],
};
