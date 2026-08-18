import type { BlogPost } from "../blog-types";

export const nextJsPangramSolverPost: BlogPost = {
    slug: "nyt-pangram-solver",
    title: "A Simple Pangram Solver for NYT Spelling Bee",
    kind: "project",
    summary: "A tiny app for finding pangrams from seven letters and a required center letter.",
    publishedAt: "2026-03-05",
    published: true,
    heroImage: "/img/blog/nextjs-pangram-solver/system-flow-light.png",
    heroImageDark: "/img/blog/nextjs-pangram-solver/system-flow-dark.png",
    tags: ["nextjs", "openai", "spelling-bee"],
    blocks: [
        {
            id: "intro",
            type: "paragraph",
            text: "In early 2025, I made a small Next.js app for finding NYT Spelling Bee pangrams. You enter seven letters, pick the required center letter, and press one button.",
        },
        {
            id: "solved-screen",
            type: "image",
            src: "/img/blog/nextjs-pangram-solver/solved.jpeg",
            alt: "Mobile screenshot of the Pangram Solver app showing letters entered, center letter O selected, and JOCULAR returned as the pangram result.",
            caption: "Seven letters in, one pangram back.",
            centered: true,
            maxHeightPx: 760,
        },
        {
            id: "how-it-works",
            type: "heading",
            level: 2,
            text: "How it works",
        },
        {
            id: "system-flow",
            type: "image",
            src: "/img/blog/nextjs-pangram-solver/system-flow-light.png",
            darkSrc: "/img/blog/nextjs-pangram-solver/system-flow-dark.png",
            alt: "Request flow diagram for the pangram solver: user input in the Next.js UI goes to a server route, which builds a prompt, calls gpt-5-mini, then filters and returns only valid pangrams.",
            caption: "One form, one server route, one model call, then a local filter.",
            centered: true,
            maxHeightPx: 640,
        },
        {
            id: "local-filter",
            type: "paragraph",
            text: "The model suggests words. The server then drops anything that misses the center letter, uses another letter, or fails to use all seven. That small local check is what makes the result usable.",
        },
        {
            id: "done",
            type: "caption",
            text: "I mostly described what I wanted, let an LLM make the first pass, and cleaned it up into something real in about an hour. That was basically it.",
        },
    ],
};
