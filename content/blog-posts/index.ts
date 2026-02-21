import type { BlogPost } from "../blog-types";

import { agentReplBuildLogPost } from "./agent-repl";
import { codeshLocalCodexUsageMenubarPost } from "./codesh";
import { paperplaneOneCommandTestflightPost } from "./paperplane";
import { reactNativePeekieFourAnglesPost } from "./peekie";
import { victoryNativeXlChartingAndMaintenancePost } from "./victory-native-xl";

export {
    agentReplBuildLogPost,
    codeshLocalCodexUsageMenubarPost,
    paperplaneOneCommandTestflightPost,
    reactNativePeekieFourAnglesPost,
    victoryNativeXlChartingAndMaintenancePost,
};

export const blogPosts: BlogPost[] = [
    reactNativePeekieFourAnglesPost,
    paperplaneOneCommandTestflightPost,
    agentReplBuildLogPost,
    codeshLocalCodexUsageMenubarPost,
    victoryNativeXlChartingAndMaintenancePost,
];
