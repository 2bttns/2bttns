import { createTRPCRouter } from "../../trpc";
import { modeBackendRouter } from "./../../../../modes/modeBackendRouter";
import { getGameModeConfig } from "./getGameModeConfig";
import { upsertGameModeConfig } from "./upsertGameModeConfig";

export const modesRouter = createTRPCRouter({
  getGameModeConfig,
  upsertGameModeConfig,
  modeBackendRouter,
});
