import type { BlogPost } from "../blog-types";

export const codeshLocalCodexUsageMenubarPost: BlogPost = {
    slug: "codesh",
    title: "Codesh: Local Codex Usage in Your Menu Bar",
    summary:
        "A tiny local-only macOS menu bar app to keep Codex session and weekly usage visible at a glance.",
    publishedAt: "2026-02-21",
    published: true,
    githubUrl: "https://github.com/zibs/codesh",
    heroImage: "/img/projects/codesh-social.png",
    tags: ["macos", "codex", "swift", "tooling"],
    blocks: [
        {
            type: "paragraph",
            text: "I wanted a tiny utility that shows Codex usage without opening the CLI or digging through logs. Codesh is that app: local-only, simple, and focused on one job in the macOS menu bar.",
        },
        {
            type: "image",
            src: "/img/projects/codesh-social-dark.png",
            alt: "Codesh project visual showing a compact local macOS utility for Codex usage visibility.",
            caption:
                "Codesh keeps session and weekly usage visible as ambient feedback in the menu bar.",
        },
        {
            type: "paragraph",
            text: "Codesh also lets you customize status bar colors directly in the app: session (left) and weekly (right), each with separate light and dark mode colors, plus a quick reset-to-defaults action.",
        },
        {
            type: "image",
            src: "/img/blog/codesh/colors.png",
            alt: "Codesh settings panel showing customizable status bar colors for session and weekly usage in light and dark mode.",
            caption:
                "Color controls in Codesh: session and weekly indicators each support separate light/dark color settings.",
        },
        {
            type: "heading",
            level: 2,
            text: "Why I built it",
        },
        {
            type: "paragraph",
            text: "Yes, [CodexBar](https://github.com/steipete/CodexBar) already exists and is a much more thorough option. I wanted to build something myself that stayed intentionally simple: local-only, lightweight, and easy to understand end-to-end. This implementation was actually heavily based off of [CodexMonitor](https://github.com/Dimillian/CodexMonitor) which is an amazing app (although I've recently been using the offical Codex app which lacks this feature!).",
        },
        {
            type: "heading",
            level: 2,
            text: "Design constraints",
        },
        {
            type: "paragraph",
            text: "1. Read local logs only.",
        },
        {
            type: "paragraph",
            text: "2. Stay fast enough to feel instant from the menu bar.",
        },
        {
            type: "paragraph",
            text: "3. Keep the interface minimal so the signal is obvious.",
        },
        {
            type: "heading",
            level: 2,
            text: "What I like about this shape",
        },
        {
            type: "paragraph",
            text: "This kind of focused utility avoids feature sprawl. It does one thing well, stays understandable, and is easy to trust because the data path is fully local.",
        },
        {
            type: "heading",
            level: 2,
            text: "Conclusion",
        },
        {
            type: "paragraph",
            text: "It was interesting to learn a bit about the signing and distribution process for macOS apps. It's currently signed and available on Github Releases. I'm happy with the result and will continue to use it myself. I think we are in a new age of mini self-built utilities like this. Thanks for reading!",
        },
    ],
};
