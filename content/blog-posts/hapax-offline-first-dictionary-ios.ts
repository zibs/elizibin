import type { BlogPost } from "../blog-types";

export const hapaxOfflineFirstDictionaryIosPost: BlogPost = {
    slug: "hapax-offline-first-dictionary-ios",
    title: "Building Hapax: An Offline-First Dictionary App (iOS for now)",
    summary:
        "A casual walkthrough of Hapax: local-first data, optional sign-in, practical sync, and lightweight AI helpers.",
    publishedAt: "2026-02-24",
    published: false,
    heroImage:
        "/img/blog/hapax-offline-first-dictionary-ios/system-map.png",
    tags: ["ios", "react-native", "offline-first", "sqlite", "supabase"],
    blocks: [
        {
            type: "paragraph",
            text: "Hapax is a small dictionary app I built for one simple problem: I hear words I want to remember, then forget them before I write them down.",
        },
        {
            type: "paragraph",
            text: "The app is designed to save first and organize later. This post is a straightforward tour of how it works.",
        },
        {
            type: "image",
            src: "https://placehold.co/1600x900/png?text=App+Overview+Screenshot+%28replace%29",
            alt: "Hapax app overview screenshot on iOS.",
            caption: "High-level app view.",
        },
        {
            type: "heading",
            level: 2,
            text: "Why Hapax exists",
        },
        {
            type: "paragraph",
            text: "I wanted a quick capture flow that does not depend on a network and does not force me to fully edit every entry in the moment.",
        },
        {
            type: "paragraph",
            text: "So the core idea is simple: add the word now, clean it up later.",
        },
        {
            type: "image",
            src: "https://placehold.co/1200x900/png?text=Quick+Capture+GIF+Placeholder",
            alt: "GIF showing a word being added quickly in Hapax.",
            caption: "Capture in a few seconds.",
            centered: true,
            maxHeightPx: 560,
        },
        {
            type: "heading",
            level: 2,
            text: "Product constraints that shaped architecture",
        },
        {
            type: "paragraph",
            text: "Hapax is iOS-first today. Android and Expo web are planned, but not full parity yet.",
        },
        {
            type: "paragraph",
            text: "The main constraints were straightforward: offline support, fast local interactions, and optional account usage instead of hard auth gating.",
        },
        {
            type: "image",
            src: "/img/blog/hapax-offline-first-dictionary-ios/constraints-to-decisions.png",
            alt: "Diagram mapping product constraints to architecture decisions in Hapax.",
            caption: "Constraints drove most of the technical choices.",
        },
        {
            type: "heading",
            level: 2,
            text: "System map in one screen",
        },
        {
            type: "paragraph",
            text: "UI writes to local SQLite first. Sync reconciles with Supabase when available. AI helpers run through edge functions and feed back into normal data flow.",
        },
        {
            type: "image",
            src: "/img/blog/hapax-offline-first-dictionary-ios/system-map.png",
            alt: "System diagram of Hapax showing UI, local SQLite, sync engine, Supabase, edge functions, and export.",
            caption: "Local-first core with optional remote services.",
        },
        {
            type: "heading",
            level: 2,
            text: "SQLite as the source of truth",
        },
        {
            type: "paragraph",
            text: "All core screens read from SQLite. That keeps search and list views fast and keeps the app usable when offline.",
        },
        {
            type: "paragraph",
            text: "The main local tables are entries, tags, entry_tags, and sync_state. Sync metadata sits with rows so pending work is easy to track.",
        },
        {
            type: "image",
            src: "/img/blog/hapax-offline-first-dictionary-ios/local-db-model.png",
            alt: "Local SQLite data model diagram for entries, tags, entry_tags, and sync_state.",
            caption: "Core local schema.",
        },
        {
            type: "heading",
            level: 2,
            text: "Auth is not access mode",
        },
        {
            type: "paragraph",
            text: "A useful design choice was separating sign-in state from app access.",
        },
        {
            type: "code",
            language: "ts",
            caption: "Access modes used by the app.",
            code: `type AccessMode = "supabase" | "local" | "none";`,
        },
        {
            type: "paragraph",
            text: "This means someone can use local mode immediately, then sign in later if they want sync across devices.",
        },
        {
            type: "image",
            src: "/img/blog/hapax-offline-first-dictionary-ios/access-mode-state-machine.png",
            alt: "State diagram for access modes supabase, local, and none.",
            caption: "Session and app access are related but separate.",
        },
        {
            type: "heading",
            level: 2,
            text: "Local mode migration on sign-in",
        },
        {
            type: "paragraph",
            text: "Local mode rows are stored with user_id as null. On sign-in, those rows are reassigned to the signed-in user.",
        },
        {
            type: "paragraph",
            text: "Tag collisions are merged by name, migrated rows are marked pending, and the process is safe to retry.",
        },
        {
            type: "image",
            src: "/img/blog/hapax-offline-first-dictionary-ios/local-mode-migration-flow.png",
            alt: "Flow diagram showing local mode data migration from null user_id to signed-in user_id.",
            caption: "How local data becomes syncable account data.",
        },
        {
            type: "heading",
            level: 2,
            text: "Sync engine deep dive",
        },
        {
            type: "paragraph",
            text: "Sync runs one job at a time per user. That avoids overlapping transactions and keeps behavior predictable.",
        },
        {
            type: "paragraph",
            text: "The flow is push local pending changes first, then pull remote updates, then update cursors. If something fails, retries use backoff.",
        },
        {
            type: "image",
            src: "/img/blog/hapax-offline-first-dictionary-ios/sync-push-pull-flow.png",
            alt: "Sequence diagram showing push-then-pull sync flow between SQLite and Supabase.",
            caption: "Push first, then reconcile.",
        },
        {
            type: "heading",
            level: 2,
            text: "Conflict policy and tradeoffs",
        },
        {
            type: "paragraph",
            text: "Conflict handling is intentionally simple: newer updated_at wins.",
        },
        {
            type: "paragraph",
            text: "It is not perfect, but it is easy to understand and keeps sync logic small enough to maintain.",
        },
        {
            type: "image",
            src: "/img/blog/hapax-offline-first-dictionary-ios/sync-conflict-timeline.png",
            alt: "Timeline diagram showing last-write-wins conflict resolution using updated_at.",
            caption: "Simple conflict rule with clear tradeoffs.",
        },
        {
            type: "heading",
            level: 2,
            text: "Query layer and cache hygiene",
        },
        {
            type: "paragraph",
            text: "TanStack Query handles cached reads. MMKV persists cache between launches.",
        },
        {
            type: "paragraph",
            text: "When access mode or user changes, cache hygiene clears old context and invalidates key queries.",
        },
        {
            type: "image",
            src: "/img/blog/hapax-offline-first-dictionary-ios/query-cache-hygiene.png",
            alt: "Diagram of query cache persistence and cache invalidation during auth and access changes.",
            caption: "Warm cache when stable, reset when identity changes.",
        },
        {
            type: "heading",
            level: 2,
            text: "Entry lifecycle end-to-end",
        },
        {
            type: "paragraph",
            text: "Create, edit, tag updates, favorite toggles, and soft delete all start as local writes.",
        },
        {
            type: "paragraph",
            text: "Rows are marked pending and synced later, so UI actions stay fast without waiting on network calls.",
        },
        {
            type: "image",
            src: "/img/blog/hapax-offline-first-dictionary-ios/entry-lifecycle-flow.png",
            alt: "Flow diagram for entry lifecycle from create to edit, tagging, favorite, and soft delete.",
            caption: "Local-first mutation flow.",
        },
        {
            type: "heading",
            level: 2,
            text: "AI enrichment flow",
        },
        {
            type: "paragraph",
            text: "Enrichment is optional. It can fill fields like definition, etymology, notes, and tags.",
        },
        {
            type: "paragraph",
            text: "The app uses a sync-safe path: create local entry, sync if needed, call edge function, pull updates, refresh queries.",
        },
        {
            type: "image",
            src: "/img/blog/hapax-offline-first-dictionary-ios/ai-enrichment-flow.png",
            alt: "Flow diagram for AI enrichment from local entry to edge function and sync pull back.",
            caption: "AI as assist, not source of truth.",
        },
        {
            type: "heading",
            level: 2,
            text: "AI suggestions flow",
        },
        {
            type: "paragraph",
            text: "Suggestions are user-triggered and cached server-side.",
        },
        {
            type: "paragraph",
            text: "A hash of entry content and tags is used to decide whether cached suggestions can be reused or regenerated.",
        },
        {
            type: "image",
            src: "/img/blog/hapax-offline-first-dictionary-ios/ai-suggestions-cache-flow.png",
            alt: "Diagram showing AI suggestions cache hit and cache miss paths based on input hash.",
            caption: "On-demand suggestions with cache reuse.",
        },
        {
            type: "heading",
            level: 2,
            text: "Export and portability",
        },
        {
            type: "paragraph",
            text: "Exports are local and simple: JSON or CSV from local data.",
        },
        {
            type: "paragraph",
            text: "Web uses file download, native uses the share sheet. No server export pipeline is required.",
        },
        {
            type: "image",
            src: "/img/blog/hapax-offline-first-dictionary-ios/export-flow.png",
            alt: "Export flow diagram for JSON and CSV output on web and native.",
            caption: "Straightforward local export path.",
        },
        {
            type: "heading",
            level: 2,
            text: "Closing thoughts",
        },
        {
            type: "paragraph",
            text: "Hapax is intentionally simple. The main goal is still to make word capture easy and reliable, with optional sync and optional AI on top.",
        },
        {
            type: "image",
            src: "/img/blog/hapax-offline-first-dictionary-ios/closing-pillars.png",
            alt: "Simple summary diagram of local-first data, sync, and user-controlled features.",
            caption: "Small app, clear priorities.",
        },
    ],
};
