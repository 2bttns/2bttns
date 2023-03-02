import { createTRPCRouter } from "../server/api/trpc";
import { classicModeRouter } from "./classic/backend/_index";

export const modesRouter = createTRPCRouter({
  classicMode: classicModeRouter,
  // Register additional mode backend routers here
});
