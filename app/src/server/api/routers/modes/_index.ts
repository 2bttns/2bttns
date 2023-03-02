import { createTRPCRouter } from "../../trpc";
import { modeBackendRouter } from "./../../../../modes/modeBackendRouter";

export const modesRouter = createTRPCRouter({
  modeBackendRouter,
});
