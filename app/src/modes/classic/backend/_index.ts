import { createTRPCRouter } from "./../../../server/api/trpc";
import { getRandomGameObjects } from "./getRandomGameObjects";
import { processGameResults } from "./processGameResults";

export const classicModeRouter = createTRPCRouter({
  processGameResults,
  getRandomGameObjects,
});
