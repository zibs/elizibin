import type { BlogPost } from "../blog-types";

export const victoryNativeXlChartingAndMaintenancePost: BlogPost = {
    slug: "victory-native-xl",
    title: "Building Charts in Victory Native XL",
    summary:
        "A retrospective look at chart feature work and day-to-day OSS maintenance in Victory Native XL.",
    publishedAt: "2026-02-20",
    githubUrl: "https://github.com/FormidableLabs/victory-native-xl",
    heroImage:
        "/img/blog/victory-native-xl-charting-and-maintenance/chart-architecture.png",
    tags: ["react-native", "charts", "open-source", "maintenance"],
    blocks: [
        {
            type: "paragraph",
            text: "I have worked on [victory-native-xl](https://github.com/FormidableLabs/victory-native-xl) for a while now, but have recently paused my involvement. It is a fun open source charting project with a real user base (around 1.1k stars and roughly 180k weekly downloads on npm), and it has been a great place to spend time improving practical details.",
        },
        {
            type: "heading",
            level: 2,
            text: "Chart architecture at a glance",
        },
        {
            type: "paragraph",
            text: "This is the simplified model I keep in my head while working in the codebase: data and props enter the chart container, transform and scale logic normalize it into chart state, rendering primitives draw to Skia, and gesture/reanimated state feeds interaction updates back into the loop.",
        },
        {
            type: "image",
            src: "/img/blog/victory-native-xl-charting-and-maintenance/chart-architecture.png",
            alt: "Diagram of Victory Native XL chart architecture showing input data and chart props flowing through transformInputData and makeScale into chart state, then into rendering primitives and Skia canvas, with gesture and reanimated interaction feedback.",
            caption:
                "A practical architecture snapshot: input and transform layers feeding Skia rendering, with interaction state in the loop.",
        },
        {
            type: "heading",
            level: 2,
            text: "Two chart examples from the example app",
        },
        {
            type: "paragraph",
            text: "These are two concrete chart patterns I helped ship in Victory Native XL: a dashed-axis area chart and a donut-style pie chart configuration (among others).",
        },
        {
            type: "image",
            src: "/img/blog/victory-native-xl-charting-and-maintenance/area.png",
            alt: "Mobile screenshot showing a Victory Native XL area chart with dashed X and Y axes and month labels on the horizontal axis.",
            caption:
                "Area chart example: smooth area shape plus dashed axes for a lighter visual treatment.",
            centered: true,
            maxHeightPx: 620,
        },
        {
            type: "image",
            src: "/img/blog/victory-native-xl-charting-and-maintenance/pie.gif",
            alt: "Animated mobile recording of a donut chart in Victory Native XL where values are shuffled and slice proportions animate.",
            caption:
                "Donut chart example: pie configuration using an inner radius to create the donut shape.",
            centered: true,
            maxHeightPx: 620,
        },
        {
            type: "heading",
            level: 2,
            text: "What I actually worked on",
        },
        {
            type: "paragraph",
            text: "A big part of my work was owning different chart styles and improving the implementation details around them so they are flexible without being fragile. The goal was always to keep the API usable while making behavior predictable for real product workloads and trying to maintain compatibility with the existing API.",
        },
        {
            type: "paragraph",
            text: "That means thinking beyond visuals. A chart that looks good in a screenshot but breaks in one layout edge case is not done. The finishing work is usually in interaction behavior, data-shape tolerance, and clear defaults.",
        },
        {
            type: "heading",
            level: 2,
            text: "Maintenance is part of the job",
        },
        {
            type: "paragraph",
            text: "I also spent a lot of time on maintenance: triaging issues, reproducing bugs, reviewing and responding to pull requests, and following through on edge-case reports. This is less visible than feature work, but it is a big part of keeping the library pleasant to use.",
        },
        {
            type: "paragraph",
            text: "In practice, that maintenance loop shortens time-to-clarity when something breaks, reduces duplicate confusion across issues, and turns one-off bug reports into durable fixes.",
        },
        {
            type: "heading",
            level: 2,
            text: "A few lessons from maintaining OSS",
        },
        {
            type: "paragraph",
            text: "1. Clear problem statements help more than clever fixes. The best issue threads define expected behavior first, provide examples to reproduce the issue, and then discuss implementation.",
        },
        {
            type: "paragraph",
            text: "2. Review quality compounds. Consistent PR feedback usually leads to better follow-on contributions from the community.",
        },
        {
            type: "paragraph",
            text: "3. Backward compatibility is a feature. Preserving stable behavior across releases often matters as much as shipping new chart capabilities.",
        },
        {
            type: "heading",
            level: 2,
            text: "Why I enjoy this work",
        },
        {
            type: "paragraph",
            text: "I like building practical things people use in OSS. Working on [victory-native-xl](https://github.com/FormidableLabs/victory-native-xl) has been a nice mix of shipping chart improvements and doing the quieter maintenance work that keeps the project moving.",
        },
        {
            type: "paragraph",
            text: "If you want to check out the package directly, it is on [npm](https://www.npmjs.com/package/victory-native-xl).",
        },
    ],
};
