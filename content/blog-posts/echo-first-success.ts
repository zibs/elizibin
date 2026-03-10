import type { BlogPost } from "../blog-types";

export const echoFirstSuccessPost: BlogPost = {
    slug: "translating-two-clowns",
    title: '"Fan Fiction"',
    summary: "Translating a novella from Spanish to English",
    publishedAt: "2026-03-04",
    published: true,
    heroImage: "/img/blog/echo-first-success/system-flow-light.png",
    heroImageDark: "/img/blog/echo-first-success/system-flow-dark.png",
    tags: ["echo", "translation", "ocr", "llm"],
    blocks: [
        {
            type: "paragraph",
            text: "One of my favourite authors is prolific and has written over a hundred novellas. But only thirty or so have been translated and published in English. And they (New Directions) seem to be publishing around a book a year (although 2026 will see five, and last year technically saw two published). Still, at this rate, it will be a long, long time before I'm able to read all of his work that is available, unless of course I learned Spanish, which would be the ideal way of handling this situation. It seems like that hasn't happened yet though.",
        },
        {
            type: "paragraph",
            text: "So, instead I wanted to experiment with LLM-assisted translations under what I've deemed as fan fiction, since I have no way to tell whether the output is faithful, or hallucinatory; thus it is Borgesian at least, nonetheless.",
        },

        {
            type: "image",
            src: "/img/blog/echo-first-success/clowns.jpeg",
            alt: "Photo of Cesar Aira's Los Dos Payasos beside several printed English draft booklets titled The Two Clowns on a wooden floor.",
            caption:
                "The source book plus a few printed English editionsfor my own archives.",
            centered: true,
            maxHeightPx: 760,
        },
        {
            type: "heading",
            level: 2,
            text: "Did it work? What happened?",
        },
        {
            type: "paragraph",
            text: "It worked! Not only did the translation seem plenty acceptable to me (after a decent amount of trial and error and experiments with various models and methods), but I also had a full Spanish-to-English pipeline system with concrete artifacts at each stage. In total, it took 6h 32m 9s across 69 chunks to translate this novella, and it maybe cost ~$15?",
        },
        {
            type: "paragraph",
            text: "For this project, I wanted to be able to reproduce the results reliably, so success meant three things: usable output, a resumable workflow, and enough saved state to inspect or rerun the result later, and allow for me to iterate on the process at various phases.",
        },
        {
            type: "code",
            language: "bash",
            caption: "This is the exact command from the run that worked.",
            code: `bun run translate -- \
  --sourceText @.data/runs/clowning-full-context/reconstructed.source.md \
  --target en \
  --source es \
  --mode literary \
  --multiRoleFlow true \
  --revisionPass true \
  --contextBeforeParagraphs 2 \
  --contextAfterParagraphs 2 \
  --holisticPass true \
  --holisticContextCharacters 14000 \
  --styleExamples examples/reference-translation-examples.md \
  --styleExampleCount 5 \
  --storySummaryPath examples/story-summary.en.md \
  --translatorDossierPath examples/translator-dossier.md \
  --faithfulnessCheck true \
  --faithfulnessStrict false \
  --outDir .data/runs/clowning-full-context-v2 \
  --force true`,
        },
        {
            type: "heading",
            level: 2,
            text: "The shape",
        },
        {
            type: "image",
            src: "/img/blog/echo-first-success/system-flow-light.png",
            darkSrc: "/img/blog/echo-first-success/system-flow-dark.png",
            alt: "Simplified system flow from source images through OCR, translation, faithfulness checks, and committed run outputs.",
            caption:
                "Ordered inputs, translation with context artifacts, checks, and frozen outputs.",
            centered: true,
            maxHeightPx: 620,
        },
        {
            type: "paragraph",
            text: "This is a simplified version of the larger package diagram. The important part is that the system is not translating paragraphs in isolation. Style anchors, a story summary, and a translator dossier all feed into the chunk-level decisions. This is the system that produced the final output file that happened to look/sound/read/feel decent.",
        },
        {
            type: "heading",
            level: 2,
            text: "The loop",
        },
        {
            type: "image",
            src: "/img/blog/echo-first-success/quality-loop-light.png",
            darkSrc: "/img/blog/echo-first-success/quality-loop-dark.png",
            alt: "Echo quality loop diagram showing scan inspection, translation, faithfulness checks, candidate sweep, curation, and rerun feedback.",
            caption:
                "Scan inspection, translation, checks, candidate sweeps, curation, then feedback into the next run.",
            centered: true,
            maxHeightPx: 620,
        },
        {
            type: "paragraph",
            text: "The biggest change was treating translation as a loop instead of a single model call. Scan and inspect seams, translate with context, run faithfulness checks in 'report' mode, sweep candidates where needed, curate, then feed the results back into the dossier and style anchors.",
        },
        {
            type: "heading",
            level: 2,
            text: "Why this one held together",
        },
        {
            type: "paragraph",
            text: "Two things made this run feel more real. First, resumable runtime artifacts like `scan.progress.jsonl`, `translate.progress.jsonl`, and the stitch outputs meant I could see where the run was and pick it back up if needed. Second, the committed archive preserved local inputs and outputs that would otherwise be transient. Also, the translation quality was finally satisfactory.",
        },
        {
            type: "paragraph",
            text: "That archive matters because `.data` and `local-inputs` are normally transient or gitignored. Freezing the inputs, logs, hashes, and outputs made the run inspectable later.",
        },
        {
            type: "heading",
            level: 2,
            text: "What is still rough",
        },
        {
            type: "paragraph",
            text: "It's not perfect. I know an actual real translator would do a much better job and if anything it shone a brief light on how interesting and difficult that work is. I had to read it, make edits etc. I'm sure it's missing subtleties, nuances, details that a bilingual speaker would not mess up; but that's what makes it <b>fan fiction</b> to me.",
        },
        {
            type: "heading",
            level: 2,
            text: "Next",
        },
        {
            type: "paragraph",
            text: "The next step is to keep trying and improving the quality of the translations while keeping the workflow as simple as possible. I'd like to try different authors too, different languages. I'm also only going to do this work with texts that I have bought the physical book of. I don't want to use found PDFs or anything like that, which also turns this project into a bit of a collection project too. Thanks for reading!",
        },
    ],
};
