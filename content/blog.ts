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
};

export type BlogCodeBlock = {
    type: "code";
    language: string;
    code: string;
    caption?: string;
};

export type BlogBlock =
    | BlogParagraphBlock
    | BlogHeadingBlock
    | BlogImageBlock
    | BlogCodeBlock;

export type BlogPost = {
    slug: string;
    title: string;
    summary: string;
    publishedAt: string;
    heroImage?: string;
    tags?: string[];
    blocks: BlogBlock[];
};

export const blogPosts: BlogPost[] = [
    {
        slug: "agent-repl-build-log",
        title: "We Built a Minimal Agent REPL",
        summary:
            "A short build log on turning a tiny terminal REPL into a real tool-calling agent loop.",
        publishedAt: "2026-02-16",
        heroImage: "/img/blog/agent-repl-build-log/system-image.png",
        tags: ["agents", "repl", "typescript"],
        blocks: [
            {
                type: "paragraph",
                text: "This project started as a simple idea: build the smallest possible agent runtime that still feels real in daily use. No framework magic, just a clear loop: user input, model response, tool calls, repeat.",
            },
            {
                type: "heading",
                level: 2,
                text: "System image",
            },
            {
                type: "image",
                src: "/img/blog/agent-repl-build-log/system-image.svg",
                alt: "System view of the minimal agent REPL architecture with provider and local tools.",
                caption:
                    "One-screen view: terminal REPL, provider API, and local tools tied together by a tool-call loop.",
            },
            {
                type: "heading",
                level: 2,
                text: "Live demo",
            },
            {
                type: "paragraph",
                text: "Quick run from the real REPL.",
            },
            {
                type: "image",
                src: "/img/blog/agent-repl-build-log/live-repl.gif",
                alt: "Terminal recording of the agent REPL streaming output, running a tool call, and returning a final answer.",
                caption:
                    "Live terminal pass: prompt -> streamed response -> tool call -> final answer.",
            },
            {
                type: "heading",
                level: 2,
                text: "Loop diagram",
            },
            {
                type: "image",
                src: "/img/blog/agent-repl-build-log/loop-diagram.svg",
                alt: "Agent loop diagram showing responses requests, function calls, tool execution, and resume.",
                caption:
                    "Two loops: the outer REPL loop and the inner tool-calling loop.",
            },
            {
                type: "heading",
                level: 2,
                text: "What we built (quick timeline)",
            },
            {
                type: "paragraph",
                text: "1. Streaming assistant output in the terminal so we can see progress in real time.",
            },
            {
                type: "paragraph",
                text: "2. A thinking indicator before first token so slow turns still feel responsive.",
            },
            {
                type: "paragraph",
                text: "3. Session save/load so conversations can be resumed.",
            },
            {
                type: "paragraph",
                text: "4. Safe workspace inspection tools for reading and searching local files.",
            },
            {
                type: "paragraph",
                text: "5. Per-turn metrics plus Ctrl+C cancellation.",
            },
            {
                type: "paragraph",
                text: "6. Phase-based reasoning controls for plan/build/review modes.",
            },
            {
                type: "heading",
                level: 2,
                text: "Safety guardrails",
            },
            {
                type: "paragraph",
                text: "We intentionally kept tool access constrained.",
            },
            {
                type: "paragraph",
                text: "- read_workspace_file blocks absolute paths and parent directory traversal.",
            },
            {
                type: "paragraph",
                text: "- search_workspace skips .git and node_modules.",
            },
            {
                type: "paragraph",
                text: "- Both tools cap bytes/results and skip binary content.",
            },
            {
                type: "heading",
                level: 2,
                text: "Provider flexibility",
            },
            {
                type: "paragraph",
                text: "The same loop runs on OpenAI or OpenRouter. We can switch providers and models at runtime with /provider and /model, which made testing and comparison much easier.",
            },
            {
                type: "heading",
                level: 2,
                text: "The tiny loop that matters",
            },
            {
                type: "code",
                language: "ts",
                caption:
                    "Minimal tool-call loop: run tool calls, append outputs, continue response.",
                code: `let response = await responses.create({
  input: history,
  tools,
  stream: true,
});

history.push(...response.output);

while (hasFunctionCalls(response.output)) {
  for (const call of getFunctionCalls(response.output)) {
    const result = await runTool(call.name, JSON.parse(call.arguments));
    history.push({
      type: "function_call_output",
      call_id: call.call_id,
      output: JSON.stringify(result),
    });
  }

  response = await responses.create({
    input: history,
    tools,
    stream: true,
  });

  history.push(...response.output);
}`,
            },
            {
                type: "heading",
                level: 2,
                text: "Metrics screenshot",
            },
            {
                type: "paragraph",
                text: "Single-turn trace with both tool execution and per-turn metrics.",
            },
            {
                type: "image",
                src: "/img/blog/agent-repl-build-log/metrics.png",
                alt: "Terminal screenshot showing tool call lines and meta metrics output for a completed REPL turn.",
                caption:
                    "One frame showing tool> activity and meta> status, request count, and token metrics.",
            },
        ],
    },
    {
        slug: "site-blog-launch",
        title: "Adding a Blog to This Site",
        summary:
            "A first pass at a flexible block-based blog system for text and images.",
        publishedAt: "2026-02-16",
        heroImage: "/img/blog/site-blog-launch/system-overview.png",
        tags: ["site", "engineering"],
        blocks: [
            {
                type: "paragraph",
                text: "This blog is generated by the same static build pipeline as the rest of the site, so publishing stays simple and local-first.",
            },
            {
                type: "heading",
                level: 2,
                text: "Why blocks",
            },
            {
                type: "paragraph",
                text: "Posts are composed from ordered content blocks, which means there is no fixed limit on sections, images, or text chunks.",
            },
            {
                type: "image",
                src: "/img/blog/site-blog-launch/system-overview.png",
                alt: "A sample preview image used by the first blog post.",
                caption: "Seed image for the blog system.",
            },
            {
                type: "heading",
                level: 2,
                text: "TypeScript snippet",
            },
            {
                type: "code",
                language: "ts",
                caption: "Blog code block schema (minimal example).",
                code: `type BlogCodeBlock = {
    type: "code";
    language: string;
    code: string;
    caption?: string;
};`,
            },
        ],
    },
];
