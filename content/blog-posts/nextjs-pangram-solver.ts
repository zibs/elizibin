import type { BlogPost } from "../blog-types";

export const nextJsPangramSolverPost: BlogPost = {
    slug: "nyt-pangram-solver",
    title: "A Simple Pangram Solver for NYT Spelling Bee",
    summary:
        "A small Next.js app that finds valid NYT Spelling Bee pangrams from seven letters and a required center letter.",
    publishedAt: "2026-03-05",
    published: true,
    heroImage: "/img/blog/nextjs-pangram-solver/system-flow-light.png",
    heroImageDark: "/img/blog/nextjs-pangram-solver/system-flow-dark.png",
    tags: ["nextjs", "openai", "spelling-bee", "tiny-win"],
    blocks: [
        {
            type: "paragraph",
            text: "In early 2025, I made a small Next.js app for finding NYT Spelling Bee pangrams.",
        },
        {
            type: "paragraph",
            text: "You enter the 7 letters, mark the required center letter, press one button, and (hopefully) get back a cleaned list of valid pangrams. The whole thing is intentionally small: one UI, one server route, one model call, and one local filtering step before results come back.",
        },
        {
            type: "image",
            src: "/img/blog/nextjs-pangram-solver/solved.jpeg",
            alt: "Mobile screenshot of the Pangram Solver app showing letters entered, center letter O selected, and JOCULAR returned as the pangram result.",
            caption:
                "The whole loop in one screen: letters in, one tap, pangram back.",
            centered: true,
            maxHeightPx: 760,
        },
        {
            type: "heading",
            level: 2,
            text: "The shape",
        },
        {
            type: "image",
            src: "/img/blog/nextjs-pangram-solver/system-flow-light.png",
            darkSrc: "/img/blog/nextjs-pangram-solver/system-flow-dark.png",
            alt: "Request flow diagram for the pangram solver: user input in the Next.js UI goes to a server route, which builds a prompt, calls gpt-5-mini, then filters and returns only valid pangrams.",
            caption:
                "Simple shape: form, server route, model call, then local filtering before anything comes back to the UI.",
            centered: true,
            maxHeightPx: 640,
        },
        {
            type: "heading",
            level: 2,
            text: "Model call, then local validation",
        },
        {
            type: "paragraph",
            text: "The model handles the word-generation step: find real words that use only the provided letters, including the center letter, and use all 7 letters at least once. After that, the server rechecks every candidate with deterministic local rules before returning anything.",
        },
        {
            type: "code",
            language: "ts",
            caption:
                "The nice pattern here is descriptive prompt in, deterministic filter out.",
            code: `const instructions = "You are a word expert specialized in finding pangrams...";

const input = \`Given letters "\${letters}" with "\${centerLetter}" as center letter...
- Each word must contain the center letter
- Use only the available letters
- Use all 7 letters at least once
- Return only words, one per line\`;

const response = await openai.responses.create({
  model: "gpt-5-mini",
  instructions,
  input,
});

const content = response.output_text || "";
const words = content
  .split("\\n")
  .filter((line: string) => line.trim().length > 0);

const pangrams = cleanAndFilterPangrams(words, letters, centerLetter);`,
        },
        {
            type: "paragraph",
            text: "That second step is what makes the app usable. The model can suggest candidates, but the final result still has to pass a straightforward local validation check.",
        },
        {
            type: "heading",
            level: 2,
            text: "UI states",
        },
        {
            type: "paragraph",
            text: "There are really only two states that matter: before the solve and after the solve. I wanted both to stay simple. Very little chrome, one clear action, and a result list that is easy to scan.",
        },
        {
            type: "image",
            src: "/img/blog/nextjs-pangram-solver/empty.jpeg",
            alt: "Mobile screenshot of the Pangram Solver app in its empty state with blank inputs and the Find Pangrams button disabled.",
            caption:
                "Empty state: waiting for the 7 letters and the center letter.",
            centered: true,
            maxHeightPx: 760,
        },
        {
            type: "image",
            src: "/img/blog/nextjs-pangram-solver/solved.jpeg",
            alt: "Mobile screenshot of the Pangram Solver app showing a completed solve with JOCULAR listed under Pangrams Found.",
            caption:
                "Solved state: one valid pangram back after the server filters the model output.",
            centered: true,
            maxHeightPx: 760,
        },
        {
            type: "heading",
            level: 2,
            text: "That is basically it!",
        },
        {
            type: "paragraph",
            text: "It was also one of those small early-2025 builds where I mostly described what I wanted, let an LLM produce the first pass, and then cleaned it up into something real in about an hour. Thanks for reading!",
        },
    ],
};
