import { createTRPCRouter } from "./../../../server/api/trpc";
import { processGameResults } from "./processGameResults";

export const classicModeRouter = createTRPCRouter({
  processGameResults,
});
