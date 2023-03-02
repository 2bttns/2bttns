import { createTRPCRouter } from "../../trpc";
import { modeBackendRouter } from "./../../../../modes/modeBackendRouter";
import { getGameModeConfig } from "./getGameModeConfig";
import { getGameModes } from "./getGameModes";
import { upsertGameModeConfig } from "./upsertGameModeConfig";

export const modesRouter = createTRPCRouter({
  getGameModes,
  getGameModeConfig,
  upsertGameModeConfig,
  modeBackendRouter,
});
