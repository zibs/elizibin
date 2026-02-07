export type Project = {
    slug: string;
    title: string;
    oneSentence: string;
    paragraph: string;
    githubUrl: string;
    socialImage?: string;
    socialImageLight?: string;
    socialImageDark?: string;
    secondaryImage?: string;
};

export const projects: Project[] = [
    {
        slug: "react-native-paperplane",
        title: "React Native Paperplane",
        oneSentence:
            "A tiny CLI that streamlines iOS TestFlight releases for React Native apps.",
        paragraph:
            "Paperplane handles the repetitive iOS release path: bumping build numbers, running build/export steps with Xcode, and uploading to TestFlight. I built it to make release workflows deterministic, scriptable, and easier to trust for teams shipping React Native apps.",
        githubUrl: "https://github.com/zibs/react-native-paperplane",
        socialImageLight: "/img/projects/paperplane-social.png",
        socialImageDark: "/img/projects/paperplane-social-dark.png",
    },
    {
        slug: "react-native-peekie",
        title: "React Native Peekie",
        oneSentence:
            "An iOS Peek and Pop module for React Native and Expo development builds.",
        paragraph:
            "Peekie brings iOS context-menu previews to React Native with a compositional API designed for real app structures. The focus is keeping it router-agnostic, reusable across large lists, and close to native interaction quality while staying easy to integrate.",
        githubUrl: "https://github.com/zibs/react-native-peekie",
        socialImageLight: "/img/projects/peekie-social.png",
        socialImageDark: "/img/projects/peekie-social-dark.png",
    },
    {
        slug: "codesh",
        title: "Codesh",
        oneSentence:
            "A local-only macOS menu bar app that shows Codex session and weekly usage at a glance.",
        paragraph:
            "Codesh reads Codex session logs from disk and surfaces session/weekly usage percentages in the menu bar, so usage is visible without opening the main app. I built it as a tiny native utility focused on fast startup, local data only, and useful ambient feedback.",
        githubUrl: "https://github.com/zibs/codesh",
        socialImageLight: "/img/projects/codesh-social-dark.png",
        secondaryImage: "/img/projects/codesh-social.png",
    },
];
