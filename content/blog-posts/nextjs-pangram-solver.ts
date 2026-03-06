import type { BlogPost } from "../blog-types";

export const nextJsPangramSolverPost: BlogPost = {
    slug: "nextjs-pangram-solver",
    title: "Shipping a Pangram Solver for NYT Spelling Bee",
    summary:
        "Building a simple app that finds valid NYT Spelling Bee pangrams with an LLM.",
    publishedAt: "2026-03-05",
    published: true,
    heroImage: "/img/blog/nextjs-pangram-solver/system-flow.png",
    tags: ["nextjs", "openai", "spelling-bee", "tiny-win"],
    blocks: [
        {
            type: "paragraph",
            text: "This was a simple experiment: a simple Next.js app that helps solve New York Times Spelling Bee pangrams. You enter 7 letters plus the required center letter, hit one button, and get a cleaned list of valid pangrams back.",
        },
        {
            type: "paragraph",
            text: "The app is intentionally lightweight. No fancy pipeline, no heavy infra, no overengineering. Just a useful tool that works end to end.",
        },
        {
            type: "image",
            src: "/img/blog/nextjs-pangram-solver/solved.jpeg",
            alt: "Mobile screenshot of the Pangram Solver app showing letters entered, center letter O selected, and JOCULAR returned as the pangram result.",
            caption:
                "The shipped product loop in one screen: enter letters, press once, get a cleaned pangram back.",
            centered: true,
            maxHeightPx: 760,
        },
        {
            type: "heading",
            level: 2,
            text: "System in one picture",
        },
        {
            type: "image",
            src: "/img/blog/nextjs-pangram-solver/system-flow.png",
            alt: "Request flow diagram for the pangram solver: user input in the Next.js UI goes to a server route, which builds a prompt, calls gpt-5-mini, then filters and returns only valid pangrams.",
            caption:
                "Simple shape: client form -> API route -> prompt + model call -> local validation -> sorted results.",
            centered: true,
            maxHeightPx: 640,
        },
        {
            type: "heading",
            level: 2,
            text: "Prompt first, then strict filtering",
        },
        {
            type: "paragraph",
            text: "The LLM call asks for real words that use only the provided letters, including the center letter, and uses all 7 letters at least once. Then the server rechecks every returned candidate with deterministic local rules before returning results to the UI.",
        },
        {
            type: "code",
            language: "ts",
            caption:
                "Prompt shape plus post-processing: descriptive request in, strict filter out.",
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
            text: "That second step matters. It keeps the product behavior stable even if the model occasionally returns noise.",
        },
        {
            type: "heading",
            level: 2,
            text: "Actual UI states",
        },
        {
            type: "paragraph",
            text: "The two states that matter most are the empty form before a solve and the result state after the model call plus local filtering. They are simple on purpose: very little chrome, one obvious action, and a result list that stays easy to scan.",
        },
        {
            type: "image",
            src: "/img/blog/nextjs-pangram-solver/empty.jpeg",
            alt: "Mobile screenshot of the Pangram Solver app in its empty state with blank inputs and the Find Pangrams button disabled.",
            caption:
                "Empty state: waiting for 7 letters plus the required center letter.",
            centered: true,
            maxHeightPx: 760,
        },
        {
            type: "image",
            src: "/img/blog/nextjs-pangram-solver/solved.jpeg",
            alt: "Mobile screenshot of the Pangram Solver app showing a completed solve with JOCULAR listed under Pangrams Found.",
            caption:
                "Solved state: one valid pangram back, after the server route filters the model output.",
            centered: true,
            maxHeightPx: 760,
        },
        {
            type: "heading",
            level: 2,
            text: "That's it!",
        },
        {
            type: "paragraph",
            text: "This app lets me check the pangram when I can't get it immediately. It has a clean UI, keeps the API key server-side, validates inputs on both client and server, and is deployed and usable. All built and generated by an LLM in like an hour, back in like mid 2025.",
        },
    ],
};
