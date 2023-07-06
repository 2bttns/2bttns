import { administratorsRouter } from "./routers/administrators/_index";
import { exampleRouter } from "./routers/example/_index";
import { exportDataRouter } from "./routers/export-data/_index";
import { gameObjectsRouter } from "./routers/gameobjects/_index";
import { gamesRouter } from "./routers/games/_index";
import { importDataRouter } from "./routers/import-data/_index";
import { modesRouter } from "./routers/modes/_index";
import { playersRouter } from "./routers/players/_index";
import { secretsRouter } from "./routers/secrets/_index";
import { tagsRouter } from "./routers/tags/_index";
import { weightsRouter } from "./routers/weights/_index";
import { createTRPCRouter } from "./trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here
 */
export const appRouter = createTRPCRouter({
  example: exampleRouter,
  games: gamesRouter,
  gameObjects: gameObjectsRouter,
  tags: tagsRouter,
  secrets: secretsRouter,
  weights: weightsRouter,
  modes: modesRouter,
  players: playersRouter,
  exportData: exportDataRouter,
  importData: importDataRouter,
  administrators: administratorsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
