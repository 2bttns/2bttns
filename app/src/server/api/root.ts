import { exampleRouter } from "./routers/example/_index";
import { gamesRouter } from "./routers/games/_index";
import { listsRouter } from "./routers/lists/_index";
import { createTRPCRouter } from "./trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here
 */
export const appRouter = createTRPCRouter({
  example: exampleRouter,
  games: gamesRouter,
  lists: listsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
