import type { BlogPost } from "../blog-types";

export const addingWebToHapaxPost: BlogPost = {
    slug: "adding-web-to-hapax",
    title: "Adding Web to Hapax",
    summary:
        "I added web to Hapax, and it was pretty easy.",
    publishedAt: "2026-03-19",
    published: true,
    heroImage: "/img/blog/hapax-web/hapaxweb6.png",
    heroImageDark: "/img/blog/hapax-web/hapaxweb1.png",
    tags: ["hapax", "expo", "react-native", "web", "sqlite", "cloudflare"],
    blocks: [
        {
            type: "paragraph",
            text: "I wanted Hapax in a browser so I could use it on my laptop sometimes.",
        },
        {
            type: "image",
            src: "/img/blog/hapax-web/hapaxweb6.png",
            darkSrc: "/img/blog/hapax-web/hapaxweb1.png",
            alt: "Hapax running in Safari on the web, showing the main dictionary list in light and dark modes.",
            caption: "Hapax, but in a browser window.",
            centered: true,
            maxHeightPx: 620,
        },
        {
            type: "paragraph",
            text: "It ended up being pretty easy. A few `.web.ts` files, a few browser-specific fixes, and the app mostly just carried over. Expo and React Native Web have really come a long way.",
        },
        {
            type: "image",
            src: "/img/blog/hapax-web/hapaxweb5.png",
            darkSrc: "/img/blog/hapax-web/hapaxweb2.png",
            alt: "Hapax entry detail page on the web showing a word, tags, etymology, example, notes, and actions.",
            caption: "Most of it stayed the same.",
            centered: true,
            maxHeightPx: 700,
        },
        {
            type: "paragraph",
            text: "The only real changes were the normal web ones: sheets, routing, auth callbacks, and getting SQLite behaving properly in the browser.",
        },
        {
            type: "image",
            src: "/img/blog/hapax-web/hapaxweb8.png",
            darkSrc: "/img/blog/hapax-web/hapaxweb3.png",
            alt: "Add entry modal sheet on the web version of Hapax, with a word field and primary action button.",
            caption: "Most of the work was stuff like this.",
            centered: true,
            maxHeightPx: 680,
        },
        {
            type: "paragraph",
            text: "Cloudflare routing was the fiddliest part. After that it was done.",
        },
        {
            type: "image",
            src: "/img/blog/hapax-web/hapaxweb10.png",
            darkSrc: "/img/blog/hapax-web/hapaxweb4.png",
            alt: "Hapax web data sheet showing JSON and CSV export actions in the browser.",
            caption: "Exports are nicer on web too.",
            centered: true,
            maxHeightPx: 720,
        },
        {
            type: "paragraph",
            text: "Anyway, it works, and I'm happy it's there. It's pretty incredible to build from a single codebase and have it work on multiple platforms like this, especially when it's driven by an LLM too.",
        },
    ],
};
