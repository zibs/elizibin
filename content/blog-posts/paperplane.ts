import type { BlogPost } from "../blog-types";

export const paperplaneOneCommandTestflightPost: BlogPost = {
    slug: "paperplane",
    title: "From Manual TestFlight Chaos to One Command",
    summary:
        "Turning a tedious iOS release routine into a minimal, deterministic CLI flow for TestFlight, without using Fastlane, EAS, or Xcode.",
    publishedAt: "2026-02-18",
    githubUrl: "https://github.com/zibs/react-native-paperplane",
    heroImage: "/img/projects/paperplane-social.png",
    tags: ["react-native", "ios", "testflight", "cli", "release"],
    blocks: [
        {
            type: "paragraph",
            text: "Shipping to TestFlight sounds simple, and it is, having done it for years with React Native, but in practice it is a chain of small steps. I wanted one command that makes the path explicit: bump build number, archive/export, then upload, all automatically, without using Fastlane, EAS, or Xcode.",
        },
        {
            type: "image",
            src: "/img/projects/paperplane-social-dark.png",
            alt: "Paperplane project social image representing a small iOS TestFlight release CLI.",
            caption:
                "Paperplane focuses on one thing: a repeatable local iOS release flow.",
        },
        {
            type: "heading",
            level: 2,
            text: "What this solves in plain language",
        },
        {
            type: "paragraph",
            text: "While building another app, I got tired of opening Xcode, archiving, and uploading to TestFlight manually. With paperplane, the checklist of what to do is encoded in the CLI, so the command does the routine work the same way every time.",
        },
        {
            type: "heading",
            level: 2,
            text: "Why I built this minimally",
        },
        {
            type: "paragraph",
            text: "This started as an experiment: could I get a useful release tool with the smallest possible surface area? I was not trying to build a release platform. I just wanted a local tool I could trust and understand end-to-end, without relying on any other tools or frameworks.",
        },
        {
            type: "paragraph",
            text: "Fastlane and EAS are strong tools, but for this project I wanted fewer moving parts, no big framework layer, and a straightforward local flow.",
        },
        {
            type: "code",
            language: "bash",
            caption: "The minimal path: inspect first (if you want), then run the real release.",
            code: `npx react-native-paperplane --dry-run
npx react-native-paperplane`,
        },
        {
            type: "heading",
            level: 2,
            text: "What the command actually does",
        },
        {
            type: "image",
            src: "/img/blog/paperplane-one-command-testflight/release-flow.png",
            alt: "Diagram of Paperplane release flow: resolve workspace and build number, update config and Info.plist, archive and export IPA, then upload to TestFlight, with dry-run and clean-git guardrails.",
            caption:
                "Paperplane keeps the release path explicit: resolve, update, build/export, upload, with preflight guardrails.",
            centered: true,
            maxHeightPx: 560,
        },
        {
            type: "paragraph",
            text: "1. Finds your iOS workspace and release scheme.",
        },
        {
            type: "paragraph",
            text: "2. Reads the current build number from app config (text-first parsing).",
        },
        {
            type: "paragraph",
            text: "3. Updates the app config build number and Info.plist CFBundleVersion.",
        },
        {
            type: "paragraph",
            text: "4. Creates an archive and exports an IPA to a deterministic output path.",
        },
        {
            type: "paragraph",
            text: "5. Uploads to TestFlight through iTMSTransporter (unless --skip-upload is set).",
        },
        {
            type: "heading",
            level: 2,
            text: "Preflight checks as a contract",
        },
        {
            type: "paragraph",
            text: "The most important part is not the happy path, it is the guardrails. If the workspace is missing, build number parsing fails, or the repo is dirty (without --allow-dirty), the command fails early with a clear error.",
        },
        {
            type: "code",
            language: "bash",
            caption: "Useful release variants.",
            code: `paperplane --dry-run
paperplane --build-number 42
paperplane --skip-upload`,
        },
        {
            type: "heading",
            level: 2,
            text: "What v1 intentionally does not do",
        },
        {
            type: "paragraph",
            text: "This version is intentionally narrow: no Android flow, no App Store Connect API key auth, and no CI-focused reporting layer. Keeping scope tight made the first version easier to reason about and safer to run. You do have to install Transporter and create a app-specific password for it, but that is a one-time setup.",
        },
        {
            type: "heading",
            level: 2,
            text: "Conclusion",
        },
        {
            type: "paragraph",
            text: "The core win is simple, fast, and boring releases. One command, predictable output, and fewer opportunities for human error. It might not be for everyone or their particular project, but it's a micro-utility that's saving me time! Thanks for reading!",
        },
    ],
};
