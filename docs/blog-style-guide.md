# Blog Style Guide

This file is the main voice reference for blog drafting in this repo.

The goal is not "clean internet tech prose." The goal is to sound like Eli: casual, specific, interested, a little dry, and actually present on the page.

Do not reach for startup language. Do not reach for polished LLM-blog language. Keep it real.

## What This Guide Is For

Use this guide to keep posts from drifting into:

- startup launch copy
- product-marketing tone
- "here is the system we built" memo voice
- generic AI-written smoothness

The writing can be technical, literary, reflective, or mixed. It should still sound like one person showing you something they made, noticed, tested, or got obsessed with.

## Current Calibration

Use the stronger recent posts as the main tone reference:

- `content/blog-posts/echo-first-success.ts`
- `content/blog-posts/emoji-system-successes.ts`
- `content/blog-posts/nextjs-pangram-solver.ts`
- `content/blog-posts/codesh.ts`
- `content/blog-posts/paperplane.ts`
- `content/blog-posts/hapax-offline-first-dictionary-ios.ts`

Those posts tend to work because they:

- start from a real itch, curiosity, or use case
- sound like someone talking, not positioning
- let taste, uncertainty, and judgment show up
- keep technical detail tied to why the thing mattered

Some older posts are still useful for structure, assets, and technical coverage, but they are not the default tone target:

- `content/blog-posts/agent-repl.ts`
- `content/blog-posts/peekie.ts`
- `content/blog-posts/victory-native-xl.ts`

Those drift more easily into launch-post, module-overview, or engineering-memo shapes.

## Core Voice

Default to a voice that feels:

- personal
- casual
- observant
- specific
- lightly dry
- unforced
- technically fluent without sounding managerial

The best version of the voice usually sounds like:

- "I wanted this, so I made it."
- "This weird thing interested me, so I kept going."
- "Here is the part that is actually worth showing."
- "This part worked, this part was awkward, this part surprised me."

Not:

- "We built a solution that enables..."
- "This architecture unlocks..."
- "This milestone demonstrates..."
- "Here is a comprehensive overview of the system..."

## Tone Principles

- Write like a person who actually made or used the thing.
- Prefer `I` over `we` unless the work was genuinely collaborative.
- Start from the human reason, not the abstract category.
- Keep the interesting detail in. Do not sand off the weird local specificity.
- Let taste show up. It is good for the post to have preferences and judgments.
- Let uncertainty show up when it is real. The newer posts are better when they admit limits, ambiguity, awkwardness, bias, or partial success.
- Explain technical details because they are interesting or clarifying, not because the post needs to sound substantial.
- Keep the writing relaxed even when the subject is technical.
- If the project was easy, say it was easy. Do not manufacture struggle or complexity to make the post feel more important.

## What "Casual" Means Here

Casual does not mean sloppy, jokey, or fake-friendly.

It means:

- plain words over polished abstraction
- contractions are fine
- occasional parenthetical asides are fine
- rhetorical questions are fine when they are real questions
- a sentence can sound a little spoken
- a paragraph can be short if that is the cleanest shape
- one sentence can be enough

The tone should feel like someone who knows what they are talking about and does not need to posture about it.

## What To Avoid

Avoid posts that read like:

- a launch announcement
- a product one-pager
- a startup founder update
- internal engineering documentation with a friendly intro
- a feature checklist dressed up as a story
- generic "AI blog post" prose

Avoid this energy:

- hype
- chest-thumping
- fake certainty
- too much self-congratulation
- strained cleverness
- cutesy "internet casual" voice
- managerial seriousness about small personal tools

Do not try to fix tone by banning individual words. The problem is usually sentence shape and posture, not one bad noun.

Bad pattern:

- abstract framing
- polished claim
- feature inventory
- tidy lesson
- triumphant ending

Better pattern:

- real reason
- show the thing
- talk about the interesting decision or tension
- admit rough edges
- end lightly

## Structural Defaults

Most posts should feel more like a guided walk than a report.

Good default shape for a small tool post:

1. Start with the specific annoyance, curiosity, or desire.
2. Show the thing early.
3. Explain the one or two decisions that actually matter.
4. Include technical detail only where it earns attention.
5. End with "that is basically it," not a victory speech.

Small wins can stay small. A post does not need a dramatic arc if the work mostly just went well.
You do not need to fill space. If two sentences do the job, stop there.

Good default shape for a bigger technical system post:

1. Start with the use case or personal reason it exists.
2. Show real behavior early with screenshots, video, or a one-screen diagram.
3. Walk through the few decisions that define the system.
4. Mention tradeoffs, constraints, and rough edges without turning the post into a design review.
5. Close small.

Good default shape for an experiment / literary / LLM post:

1. Start from the question or obsession.
2. Show artifacts early.
3. Explain the apparatus only as much as needed.
4. Leave room for interpretation, doubt, or open-endedness.
5. Do not force a takeaway if the point is partly exploratory.

## Technical Writing Guidance

When a post gets technical:

- explain the plain-language version before the implementation version
- keep code samples short and meaningful
- prefer one useful diagram over a huge conceptual dump
- focus on what was interesting, annoying, brittle, elegant, or unexpectedly nice
- keep implementation detail connected to the actual use of the thing

If a section starts sounding like repo docs or a PR description, pull it back.

## Sentence Rhythm And Cadence

Prefer:

- short or medium paragraphs
- direct sentences
- occasional longer reflective paragraphs when the thought needs it
- mild informality
- concrete nouns and verbs
- a mix of blunt sentences and more winding ones when that matches the idea

Do not over-polish everything into the same cadence.

A little looseness helps. A sentence can qualify itself. A paragraph can take a turn. The writing does not need to sound "content designed."

## Titles And Summaries

Titles and summaries should sound like honest invitations, not positioning copy.

Prefer titles that are:

- plain
- specific
- slightly odd or alive when that fits
- willing to be small

Avoid title shapes like:

- "We Built..."
- "Introducing..."
- "Architecture of..."
- "How We Leveraged..."
- "Production-Ready..."

Summaries should sound like a person telling you what the post is, not a tagline.

## Strong Patterns From The Recent Posts

These patterns are worth preserving:

- starting from a concrete personal motive
- showing the artifact early
- using first-person judgment like "I wanted," "I liked," "I was happy with," "I was not sure"
- letting the post mix technical explanation with taste or interpretation
- admitting when something is partial, awkward, biased, or unfinished
- ending with a small human note instead of a "key takeaway"

## Recurring Failure Modes

These are the main ways the voice drifts off:

- headings like "What we built," "Production checklist," or "Architecture overview" taking over the post
- numbered feature lists where normal prose would be more natural
- sounding more official than the project actually is
- writing as if the post needs to justify the project's importance
- inflating a mostly straightforward build into a saga
- flattening everything into clean, balanced, generic sentences
- letting reflective paragraphs get so clause-heavy that the voice turns baggy instead of conversational
- ending with a pitch, a lesson list, or a triumph speech

## Final Check Before Calling A Draft Done

Ask:

- Does this sound like a person, not a brand?
- Does this sound like Eli, not like a generic smart model?
- Is there at least one sentence here that feels genuinely lived-in or specific?
- Did I start from the real reason for the project instead of a category label?
- Did I accidentally turn the post into a launch announcement or mini spec?
- If the work mostly went smoothly, did I let the post stay calm and simple?
- Are the technical sections there because they are interesting, not because they make the post look serious?
- Did the ending stay relaxed?

If any of those answers is no, revise the voice before shipping the draft.
