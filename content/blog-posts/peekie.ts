import type { BlogPost } from "../blog-types";

export const reactNativePeekieFourAnglesPost: BlogPost = {
    slug: "peekie",
    title: "Shipping iOS Peek and Pop in React Native",
    summary:
        "Introducing react-native-peekie: a Peek and Pop React Native library for iOS.",
    publishedAt: "2026-02-17",
    published: true,
    githubUrl: "https://github.com/zibs/react-native-peekie",
    heroImage: "/img/projects/peekie-social.png",
    tags: ["react-native", "expo", "ios", "native-modules"],
    blocks: [
        {
            type: "paragraph",
            text: "Peek and Pop is one of those interactions that I didn't realize wasn't built into React Native/React Navigation until I tried it. But now it is possible to have it: [react-native-peekie](https://www.npmjs.com/package/react-native-peekie) is a small iOS-focused Expo module designed to make that integration predictable in production code.",
        },
        {
            type: "image",
            src: "/img/projects/peekie-social-dark.png",
            alt: "Social preview image for react-native-peekie in dark mode.",
        },
        {
            type: "heading",
            level: 2,
            text: "What problem this module solves",
        },
        {
            type: "paragraph",
            text: "iOS exposes preview and commit behavior through UIContextMenuInteraction. On React Native projects, that usually means custom native work, one-off wrappers, or coupling the feature to a specific router. The goal here was a reusable module with a compositional API that stays router-agnostic.",
        },
        {
            type: "paragraph",
            text: "The source code for this module is on [GitHub](https://github.com/zibs/react-native-peekie). The examples below assume a standard React Navigation setup, but the pattern works with any routing approach, or even no routing at all.",
        },
        {
            type: "heading",
            level: 2,
            text: "Integration in a real screen",
        },
        {
            type: "paragraph",
            text: "The core model is straightforward: define a trigger surface, define a preview surface, and handle commit. Commit is where you perform the real navigation.",
        },
        {
            type: "code",
            language: "bash",
            caption: "Install the package.",
            code: `npm install react-native-peekie`,
        },
        {
            type: "code",
            language: "tsx",
            caption: "Minimal usage with React Navigation.",
            code: `import * as React from "react";
import { Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { PeekPreview } from "react-native-peekie";

export function Row({ id, title }: { id: string; title: string }) {
  const navigation = useNavigation();

  return (
    <PeekPreview
      previewKey={id}
      onCommit={() => navigation.navigate("Detail", { id })}
      preferredContentSize={{ width: 320, height: 240 }}
    >
      <PeekPreview.Trigger>
        <Text>{title}</Text>
      </PeekPreview.Trigger>

      <PeekPreview.Preview>
        <View>
          <Text>{title}</Text>
        </View>
      </PeekPreview.Preview>
    </PeekPreview>
  );
}`,
        },
        {
            type: "image",
            src: "/img/blog/react-native-peekie-four-angles/peekie-demo.gif",
            alt: "Demo recording of react-native-peekie showing long-press preview, in-preview scrolling, and commit to a detail screen.",
            caption:
                "Live behavior from the example app: press and hold to preview, then commit to navigate.",
            centered: true,
            maxHeightPx: 520,
        },
        {
            type: "paragraph",
            text: "This module is intentionally iOS-only and requires a development build (custom native code). It is not supported in Expo Go.",
        },
        {
            type: "paragraph",
            text: "Current expectations are iOS 15.1 or newer and modern Expo/React Native versions. If your app targets older runtimes, plan for a fallback interaction.",
        },
        {
            type: "heading",
            level: 2,
            text: "API shape and why it matters",
        },
        {
            type: "paragraph",
            text: "The compositional slot API (PeekPreview.Trigger and PeekPreview.Preview) is the key design decision. It keeps trigger markup and preview markup colocated while avoiding wrapper-heavy component trees.",
        },
        {
            type: "paragraph",
            text: "Another deliberate choice is avoiding a global registry. Each row owns its own preview relationship locally, which scales better in large lists and nested navigation structures.",
        },
        {
            type: "code",
            language: "ts",
            caption: "Slot resolution keeps the public API small and explicit.",
            code: `const { triggerChildren, triggerSlot, previewSlot } = pickSlots(children);
const resolvedTriggerChildren = triggerSlot ? triggerSlot.props.children : triggerChildren;

return (
  <NativePeekPreviewTrigger {...viewProps}>
    {resolvedTriggerChildren}
    {previewSlot ? (
      <NativePeekPreviewContent preferredContentSize={resolvedPreferredContentSize}>
        {previewSlot.props.children}
      </NativePeekPreviewContent>
    ) : null}
  </NativePeekPreviewTrigger>
);`,
        },
        {
            type: "heading",
            level: 2,
            text: "Native lifecycle details",
        },
        {
            type: "paragraph",
            text: "On iOS, UIContextMenuInteraction drives three moments that matter to app code: preview is about to be shown, commit happened, and preview finished dismissing. Those map directly to onWillShow, onCommit, and onDismiss so behavior stays easy to reason about from JavaScript.",
        },
        {
            type: "image",
            src: "/img/blog/react-native-peekie-four-angles/module-architecture.png",
            alt: "Architecture diagram showing react-native-peekie flow from React Native components to Expo native module views, into UIContextMenuInteraction and preview controller, then back to JavaScript callbacks and navigation commit.",
            caption:
                "Module flow: JS component composition, native trigger/content views, iOS context menu preview lifecycle, and commit callback handling.",
        },
        {
            type: "code",
            language: "ts",
            caption: "Lifecycle callbacks mapped to app-level handlers.",
            code: `const handleWillShow = (_event: PeekPreviewEvent) => onWillShow?.();
const handleCommit = (_event: PeekPreviewEvent) => onCommit();
const handleDismiss = (_event: PeekPreviewEvent) => onDismiss?.();`,
        },
        {
            type: "heading",
            level: 2,
            text: "Sizing and scroll behavior",
        },
        {
            type: "paragraph",
            text: "Explicit preferredContentSize plus scrollable preview content gives a predictable experience across different row widths.",
        },
        {
            type: "heading",
            level: 2,
            text: "When this native pattern is the right call",
        },
        {
            type: "paragraph",
            text: "Native integration is worth the cost when the interaction is system-owned, touch-sensitive, and user expectations are tied to platform behavior. Peek and Pop is exactly that case.",
        },
        {
            type: "heading",
            level: 2,
            text: "Production checklist",
        },
        {
            type: "paragraph",
            text: "Before shipping, verify:",
        },
        {
            type: "paragraph",
            text: "1. Behavior when preview content is missing.",
        },
        {
            type: "paragraph",
            text: "2. Scrolling with long preview bodies.",
        },
        {
            type: "paragraph",
            text: "3. Commit navigation parameter integrity.",
        },
        {
            type: "paragraph",
            text: "4. Repeated open and dismiss cycles.",
        },
        {
            type: "paragraph",
            text: "5. Row reuse behavior in long lists.",
        },
        {
            type: "heading",
            level: 2,
            text: "Conclusion",
        },
        {
            type: "paragraph",
            text: "The integration surface can stay small without hiding the platform realities. A compositional API plus clear lifecycle boundaries gives you native interaction quality and predictable app behavior at the same time. This was really fun to build and ship! Thanks for reading!",
        },
    ],
};
