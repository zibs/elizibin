import type { BlogPost } from "../blog-types";

export const agentReplBuildLogPost: BlogPost = {
    slug: "agent-repl",
    title: "We Built a Minimal Agent REPL",
    summary:
        "Agents as While Loops: using a tiny terminal REPL to build a simple tool-calling agent.",
    publishedAt: "2026-02-16",
    published: true,
    heroImage: "/img/blog/agent-repl-build-log/system-image.png",
    tags: ["agents", "repl", "typescript"],
    blocks: [
        {
            type: "paragraph",
            text: "This is a small and simple learning exercise: make a miniature agent runtime that mimics the fundamentals of a real agent loop. No framework magic, just one clear loop: user input, model output, tool calls, repeat. I was inspired by this tweet below:",
        },
        {
            type: "tweet",
            url: "https://twitter.com/threepointone/status/2020043852317417970",
            caption:
                "A compact way to describe why agent runtime building mostly comes down to loops and structure.",
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
            text: "What we built:",
        },
        {
            type: "paragraph",
            text: "1. Streaming assistant output in the terminal so we can see progress in real time.",
        },
        {
            type: "paragraph",
            text: "2. A thinking indicator before first token so slow turns still feel responsive (super basic).",
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
            text: "The tiny tool-calling loop that matters",
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
        {
            type: "heading",
            level: 2,
            text: "Conclusion",
        },
        {
            type: "paragraph",
            text: "This was fun and educational: small, understandable, and practical enough to understand. Next step is looking at other more advanced agent runtime features and sdks, but the core loop is working and feels good to build on. Thanks for reading!",
        },
    ],
};
