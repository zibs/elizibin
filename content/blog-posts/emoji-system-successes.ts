import type { BlogPost } from "../blog-types";

export const emojiSystemSuccessesPost: BlogPost = {
    slug: "emoji-system-successes",
    title: "An Emoji Translator",
    summary: "A system that converts text into emoji-only lines.",
    publishedAt: "2026-03-04",
    published: true,
    heroImage: "/img/blog/emoji-system-successes/dickinson-woven.png",
    tags: ["emoji", "llm", "cli", "poetics"],
    blocks: [
        { type: "heading", level: 2, text: "📝 / 📖" },
        {
            type: "paragraph",
            text: "Who remembers [Emoji Dick](https://emojidick.com)? One of those seminal (to me) pieces of conceptual writing. It stages translation as reduction, collaboration, expense, labour critique, joke, and playful but epic artifact all at once. An LLM makes it newly easy to generate adjacent objects on demand, but the old questions do not disappear. They merely return in altered form: what is this new text, what is this readability, what counts as a version, iteration, addition, fan fiction, and what exactly is being translated when language is forced into pictographs?",
        },
        {
            type: "paragraph",
            text: "This post is partly technical and partly speculative. I want to show the machinery because the machinery determines the kind of texts that can be generated. But I also want to stay with the literary question behind it, which is less obvious and more interesting: can emoji do any real poetic work, or do they only cast a bright, impoverished gloss over the line? Some of these lines can be quite fun, cute, compelling.",
        },
        {
            type: "paragraph",
            text: "What began as a small CLI experiment gradually became an apparatus for testing that question at scale: resumable runs, chunk-level retries, explicit artifact contracts, and a dashboard that makes the duration and fragility of the process visible rather than magical.",
        },
        {
            type: "heading",
            level: 2,
            text: "Reading the lines",
        },
        {
            type: "paragraph",
            text: "Before asking whether any output was good, I needed to know whether the system could keep faith with the line: survive interruption, show its progress during long calls, and produce stable final artifacts (`emoji.txt` and `woven.txt`) that could actually be inspected afterward.",
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
            type: "heading",
            level: 2,
            text: "Woven lines",
        },
        {
            type: "paragraph",
            text: "The woven version is more legible, and it also lets me think about these lines as couplets in a way, which I also like. The effect is simple <i>ostranie</i>. There is also a `emoji.txt` file which is just the raw emoji output. I think I could give the LLM more freedom to play with its own notions of translation, but for now I wanted a fairly faithful adherence to the source text/typographical layout; the line.",
        },
        {
            type: "heading",
            level: 2,
            text: "The apparatus",
        },
        {
            type: "image",
            src: "/img/blog/emoji-system-successes/system-overview.png",
            alt: "Diagram of the Emoji package architecture showing CLI and dashboard entry points, the pipeline runtime core, and run artifacts including progress and outputs.",
            caption:
                "CLI and dashboard both enter the same runtime: worker pool, serialized state writer, provider adapter, artifact set.",
            centered: true,
            maxHeightPx: 680,
        },
        {
            type: "paragraph",
            text: "State writes are serialized even while chunk conversion is parallelized. That keeps `state.json`, `run.manifest.json`, and `progress.jsonl` in agreement, which means a run can be resumed without turning into an archaeological problem, or wasting tokens/money on a failed run.",
        },
        {
            type: "heading",
            level: 2,
            text: "How resumption is made possible",
        },
        {
            type: "image",
            src: "/img/blog/emoji-system-successes/chunk-lifecycle.png",
            alt: "Flow diagram showing Emoji chunk processing states from pending queue to claimed chunk, conversion, success or failure outcomes, and resume behavior that resets failed chunks to pending.",
            caption:
                "Each chunk is accounted for explicitly: retries stay local, failed work can return to pending, completed work is left where it is.",
            centered: true,
            maxHeightPx: 680,
        },
        {
            type: "paragraph",
            text: "A chunk moves through a narrow sequence: claimed, attempted, written, marked. Retries remain local to that chunk. Failed work can be sent back to pending. Completed work is not touched again.",
        },
        {
            type: "heading",
            level: 2,
            text: "The contract the CLI has to keep",
        },
        {
            type: "code",
            language: "bash",
            caption:
                "A typical long run, with the runtime controls exposed instead of hidden.",
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
            text: "The provider adapter asks for a strict `json_schema` response with exactly one emoji line for each source line. That does not solve the problem of interpretation, but it does keep the experiment honest. Line-locking, overlap-aware stitching, and deterministic weaving are what prevent the output from dissolving into decorative drift.",
        },
        {
            type: "image",
            src: "/img/blog/emoji-system-successes/whitman.png",
            alt: "Screenshot of Walt Whitman lines with emoji-only companion lines, preserving one output line per source line across a longer passage.",
            caption:
                "Whitman from a longer run: not a triumph of symbolism, but a sustained holding of place.",
            centered: true,
            maxHeightPx: 680,
        },
        {
            type: "paragraph",
            text: "Whitman is useful because the passage wants breadth, catalogue, continuation. If the system can remain lineate under that pressure, then one begins to see not literary success exactly, but a usable formal discipline.",
        },
        {
            type: "paragraph",
            text: "Rilke introduces a different difficulty. The line does not simply continue; it broods, turns, and qualifies itself. The output below is still awkward, but the awkwardness is at least inspectable.",
        },
        {
            type: "image",
            src: "/img/blog/emoji-system-successes/rilke-duino.png",
            alt: "Screenshot of a Rilke Duino sample with source lines interleaved with emoji-only responses and a few question-mark markers in the output.",
            caption:
                "Rilke from the Duino material: the system strains, and the strain becomes visible.",
            centered: true,
            maxHeightPx: 700,
        },
        {
            type: "paragraph",
            text: "Christian Bök's Eunoia makes the limit clearer still. Its constraint is not merely lexical or imagistic; it is internal, formal, almost infrastructural at the level of the vowel. Even with extra prompting, the system does not really understand that pressure. It mostly notices the surface fact of the letter `i` and repeats the obvious emblem:",
        },
        {
            type: "image",
            src: "/img/blog/emoji-system-successes/eunoia-i.png",
            alt: "Emoji-only output for a Eunoia excerpt, with each line beginning with the blue information emoji on a white background.",
            caption:
                "Raw Eunoia attempt: the constraint is registered, but only as a blunt repeated token.",
            centered: true,
            maxHeightPx: 660,
        },
        {
            type: "image",
            src: "/img/blog/emoji-system-successes/eunoia-i-woven.png",
            alt: "Woven Eunoia sample showing source text interleaved with emoji renderings, still anchored by the repeated information emoji at the start of each emoji line.",
            caption:
                "Woven version of the same sample: easier to read, but still not actually carrying the excerpt's internal vowel logic.",
            centered: true,
            maxHeightPx: 760,
        },
        {
            type: "heading",
            level: 2,
            text: "Biases",
        },
        {
            type: "paragraph",
            text: "There are lots of biases in this project; I chose some pretty safe poems to test with. and the LLM reveals its own biases too. I'm not sure what a truly political text would look like, or how the LLM would internally censor itself, flatten the text, etc. as it rewrote what it's given.",
        },
        {
            type: "heading",
            level: 2,
            text: "Conclusion",
        },
        {
            type: "paragraph",
            text: "If entire texts can be rendered this way -- at ease -- what sort of texts result? What's the point? Can emoji be literary? Can there be an emoji literature? Is such a thing sculptural, pictorial, mnemonic, poetic, comic? I do not know yet. That uncertainty is certainly part of the appeal.",
        },
    ],
};
