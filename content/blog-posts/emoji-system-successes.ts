import type { BlogPost } from "../blog-types";

export const emojiSystemSuccessesPost: BlogPost = {
    slug: "emoji-system-successes",
    title: "An Emoji Translator",
    summary: "Building a system that converts text into emoji-only lines.",
    publishedAt: "2026-03-04",
    published: false,
    heroImage: "/img/blog/emoji-system-successes/dickinson-woven.png",
    tags: ["emoji", "llm", "cli", "dashboard", "build-log"],
    blocks: [
        {
            type: "paragraph",
            text: "Who remembers Emoji Dick? It was a seminal work of conceptual writing (to me) that I've long appreciated. Turns out, it (and any other text) can now be generated dynamically via an LLM. It still costs money to do so (although the labor is even more invisible), and can still be orchestrated in the same dynamic of multiple generations and a curation loop to determine the ideal output.",
        },
        {
            type: "paragraph",
            text: "This post goes into the details of the system that makes this possible. I don't think it'll talk about the ramifications of this or of the differences to Emoji Dick...",
        },
        {
            type: "paragraph",
            text: "This project started as a small CLI experiment, but over the last few weeks it has become a real system: resumable runs, chunk-level retries, strong artifact contracts, and a dashboard loop that makes long jobs inspectable.",
        },
        {
            type: "heading",
            level: 2,
            text: "What counted as success this time",
        },
        {
            type: "paragraph",
            text: "For this project, success means more than a pretty emoji output: we need interruption safety, clear progress signals during long calls, and deterministic final artifacts (`emoji.txt` and `woven.txt`).",
        },
        {
            type: "image",
            src: "/img/blog/emoji-system-successes/dickinson-emoji.png",
            alt: "Narrow screenshot showing Emily Dickinson lines converted into one emoji-only line per source line on a dark background.",
            caption:
                "Raw line-locked Dickinson output from `emoji.txt`: every source line still has a visible counterpart before weaving.",
            centered: true,
            maxHeightPx: 640,
        },
        {
            type: "paragraph",
            text: "The woven version is nicer to look at, but the raw `emoji.txt` form is where the system proves it is behaving. One source line in, one emoji line out, no silent merges, no missing rows.",
        },
        {
            type: "heading",
            level: 2,
            text: "System overview",
        },
        {
            type: "image",
            src: "/img/blog/emoji-system-successes/system-overview.png",
            alt: "Diagram of the Emoji package architecture showing CLI and dashboard entry points, the pipeline runtime core, and run artifacts including progress and outputs.",
            caption:
                "CLI and dashboard feed the same runtime: worker pool + serialized state writer + provider adapter.",
            centered: true,
            maxHeightPx: 680,
        },
        {
            type: "paragraph",
            text: "The key design choice is that state writes are serialized even when chunk conversion is parallelized. That keeps `state.json`, `run.manifest.json`, and `progress.jsonl` coherent while workers run concurrently.",
        },
        {
            type: "heading",
            level: 2,
            text: "Chunk lifecycle (why resume works)",
        },
        {
            type: "image",
            src: "/img/blog/emoji-system-successes/chunk-lifecycle.png",
            alt: "Flow diagram showing Emoji chunk processing states from pending queue to claimed chunk, conversion, success or failure outcomes, and resume behavior that resets failed chunks to pending.",
            caption:
                "Each chunk is tracked explicitly: retries stay local, failed chunks can be resumed without redoing completed work.",
            centered: true,
            maxHeightPx: 680,
        },
        {
            type: "paragraph",
            text: "The runtime path is intentionally boring: claim chunk, emit start event, convert with structured output + retries, write per-chunk file, update state, continue. On resume, failed chunks are reset to pending and completed chunks are left alone.",
        },
        {
            type: "heading",
            level: 2,
            text: "CLI contract we can trust",
        },
        {
            type: "code",
            language: "bash",
            caption:
                "Typical long-run invocation with explicit runtime controls.",
            code: `bun run --cwd packages/emoji src/cli.ts run -- \
  --inputFile ./book.txt \
  --parallelism 4 \
  --reasoning high \
  --maxOutputTokens 64000 \
  --requestTimeoutMs 900000 \
  --maxRetries 8 \
  --retryBaseDelayMs 1500 \
  --json true`,
        },
        {
            type: "paragraph",
            text: "The provider adapter enforces a strict `json_schema` response contract with exactly one emoji line per source line. That line-locking, plus overlap-aware stitching and deterministic weaving, is what keeps output stable enough to iterate on.",
        },
        {
            type: "image",
            src: "/img/blog/emoji-system-successes/whitman.png",
            alt: "Screenshot of Walt Whitman lines with emoji-only companion lines, preserving one output line per source line across a longer passage.",
            caption:
                "A Whitman sample from a longer run. The win is not perfect symbolism; it is sustained structure.",
            centered: true,
            maxHeightPx: 680,
        },
        {
            type: "paragraph",
            text: "Longer passages are the real test. If the contract only works for a short Dickinson excerpt, it is a demo; if it survives Whitman's longer cadence and keeps place line by line, it starts to feel like infrastructure.",
        },
        {
            type: "paragraph",
            text: "Here's an example of Rilke's tenth Duino elegy:",
        },
        {
            type: "image",
            src: "/img/blog/emoji-system-successes/rilke-duino.png",
            alt: "Screenshot of a Rilke Duino sample with source lines interleaved with emoji-only responses and a few question-mark markers in the output.",
            caption:
                "A Rilke sample from the Duino material: still odd in places, but inspectable enough to compare and curate.",
            centered: true,
            maxHeightPx: 700,
        },
        {
            type: "paragraph",
            text: "I also tried it with an excerpt of Christian Bök's Eunoia, but it couldn't really mimic the internal constraints without some additional prompting from myself, and even then, it just added that 'i' emoji to the start of each line:",
        },
        {
            type: "image",
            src: "/img/blog/emoji-system-successes/eunoia-i.png",
            alt: "Emoji-only output for a Eunoia excerpt, with each line beginning with the blue information emoji on a white background.",
            caption:
                "Raw Eunoia attempt: the system mostly collapses the constraint into a repeated `i` marker at the start of each line.",
            centered: true,
            maxHeightPx: 660,
        },
        {
            type: "image",
            src: "/img/blog/emoji-system-successes/eunoia-i-woven.png",
            alt: "Woven Eunoia sample showing source text interleaved with emoji renderings, still anchored by the repeated information emoji at the start of each emoji line.",
            caption:
                "Woven version of the same Eunoia sample: easier to read, but still not genuinely tracking the excerpt's internal vowel constraint.",
            centered: true,
            maxHeightPx: 760,
        },
        {
            type: "heading",
            level: 2,
            text: "Next",
        },
        {
            type: "paragraph",
            text: "Next step is not more complexity. It is polishing defaults and adding stronger before/after quality comparisons while keeping the same resumable guarantees. We now have enough stability to focus on output quality and curation loops. It's also possible to translate entire texts/books if so desired...can emoji be literary? Wan we have an emoji of literature? Is it sculptural? Pictoral?",
        },
    ],
};
