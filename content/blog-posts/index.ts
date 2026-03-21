import type { BlogPost } from "../blog-types";

import { agentReplBuildLogPost } from "./agent-repl";
import { codeshLocalCodexUsageMenubarPost } from "./codesh";
import { echoFirstSuccessPost } from "./echo-first-success";
import { addingWebToHapaxPost } from "./adding-web-to-hapax";
import { hapaxOfflineFirstDictionaryIosPost } from "./hapax-offline-first-dictionary-ios";
import { nextJsPangramSolverPost } from "./nextjs-pangram-solver";
import { paperplaneOneCommandTestflightPost } from "./paperplane";
import { reactNativePeekieFourAnglesPost } from "./peekie";
import { emojiSystemSuccessesPost } from "./emoji-system-successes";
import { victoryNativeXlChartingAndMaintenancePost } from "./victory-native-xl";

export {
    addingWebToHapaxPost,
    agentReplBuildLogPost,
    codeshLocalCodexUsageMenubarPost,
    echoFirstSuccessPost,
    emojiSystemSuccessesPost,
    hapaxOfflineFirstDictionaryIosPost,
    nextJsPangramSolverPost,
    paperplaneOneCommandTestflightPost,
    reactNativePeekieFourAnglesPost,
    victoryNativeXlChartingAndMaintenancePost,
};

export const blogPosts: BlogPost[] = [
    addingWebToHapaxPost,
    hapaxOfflineFirstDictionaryIosPost,
    emojiSystemSuccessesPost,
    echoFirstSuccessPost,
    reactNativePeekieFourAnglesPost,
    nextJsPangramSolverPost,
    paperplaneOneCommandTestflightPost,
    agentReplBuildLogPost,
    codeshLocalCodexUsageMenubarPost,
    victoryNativeXlChartingAndMaintenancePost,
];
