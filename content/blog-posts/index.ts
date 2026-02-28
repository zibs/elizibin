import type { BlogPost } from "../blog-types";

import { agentReplBuildLogPost } from "./agent-repl";
import { codeshLocalCodexUsageMenubarPost } from "./codesh";
import { hapaxOfflineFirstDictionaryIosPost } from "./hapax-offline-first-dictionary-ios";
import { paperplaneOneCommandTestflightPost } from "./paperplane";
import { reactNativePeekieFourAnglesPost } from "./peekie";
import { victoryNativeXlChartingAndMaintenancePost } from "./victory-native-xl";

export {
    agentReplBuildLogPost,
    codeshLocalCodexUsageMenubarPost,
    hapaxOfflineFirstDictionaryIosPost,
    paperplaneOneCommandTestflightPost,
    reactNativePeekieFourAnglesPost,
    victoryNativeXlChartingAndMaintenancePost,
};

export const blogPosts: BlogPost[] = [
    hapaxOfflineFirstDictionaryIosPost,
    reactNativePeekieFourAnglesPost,
    paperplaneOneCommandTestflightPost,
    agentReplBuildLogPost,
    codeshLocalCodexUsageMenubarPost,
    victoryNativeXlChartingAndMaintenancePost,
];
