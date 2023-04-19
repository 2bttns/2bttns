import { inferProcedureInput } from "@trpc/server";
import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { defaultMode } from "../../../../src/modes/availableModes";
import { AppRouter, appRouter } from "../../../../src/server/api/root";
import { prisma } from "../../../../src/server/db";
import {
  clearDbsTest,
  createInnerTRPCContextWithSessionForTest,
} from "./helpers";

describe("games router", () => {
  beforeEach(async () => {
    await clearDbsTest(prisma);
  });

  afterEach(async () => {
    await clearDbsTest(prisma);
  });

  test("games.create", async () => {
    const ctx = createInnerTRPCContextWithSessionForTest();
    const caller = appRouter.createCaller(ctx);

    type Input = inferProcedureInput<AppRouter["games"]["create"]>;
    const input: Input = {
      id: "test-game-id",
      name: "test-game",
    };

    const result = await caller.games.create(input);
    expect(result.createdGame.id).toBe(input.id);
    expect(result.createdGame.name).toBe(input.name);
    expect(result.createdGame.description).toBe(null);
    expect(result.createdGame.mode).toBe(defaultMode);
    expect(result.createdGame.createdAt).toBeInstanceOf(Date);
    expect(result.createdGame.updatedAt).toBeInstanceOf(Date);
  });

  describe("games.getAll", () => {
    test("default limit 10", async () => {
      const ctx = createInnerTRPCContextWithSessionForTest();
      const caller = appRouter.createCaller(ctx);

      const numberOfGames = 101;
      await createTestGames(numberOfGames);

      type Input = inferProcedureInput<AppRouter["games"]["getAll"]>;
      const input: Input = {};

      const result = await caller.games.getAll(input);
      expect(result.games).length(10);
    });

    test("sort by name", async () => {
      const ctx = createInnerTRPCContextWithSessionForTest();
      const caller = appRouter.createCaller(ctx);

      const numberOfGames = 101;
      await createTestGames(numberOfGames);
      const testGames = await getAllGames();
      const first10Asc = testGames
        .sort((a, b) => a.name.localeCompare(b.name))
        .slice(0, 10);
      const first10Desc = testGames
        .sort((a, b) => b.name.localeCompare(a.name))
        .slice(0, 10);

      type Input = inferProcedureInput<AppRouter["games"]["getAll"]>;
      const input: Input = { sort: { name: "asc" } };

      const result = await caller.games.getAll(input);
      expect(result.games).length(10);
      expect(result.games).toEqual(first10Asc);

      const input2: Input = { sort: { name: "desc" } };
      const result2 = await caller.games.getAll(input2);
      expect(result2.games).length(10);
      expect(result2.games).toEqual(first10Desc);
    });

    // TODO: test pagination
    // TODO: test filters
    // TODO: test other sorting params
  });

  describe("games.getPlayerScores", () => {
    test("getPlayerScores", async () => {
      const ctx = createInnerTRPCContextWithSessionForTest();
      const caller = appRouter.createCaller(ctx);

      const numGameObjectsForScoring = 10;
      const testTagId = "test-tag-id";
      const testGameId = "test-game-id";
      const testPlayerId = "test-player-id";
      const testGameObjectId = "test-game-object-id";

      await prisma.tag.create({
        data: {
          name: "test-tag",
          id: testTagId,
        },
      });

      for (let i = 0; i < numGameObjectsForScoring; i++) {
        await prisma.gameObject.create({
          data: {
            id: `${testGameObjectId}-${i}`,
            name: `test-game-object-${i}`,
            tags: {
              connect: {
                id: testTagId,
              },
            },
          },
        });
      }

      await prisma.game.create({
        data: {
          name: "test-game",
          id: testGameId,
          inputTags: { connect: { id: testTagId } },
        },
      });

      await prisma.player.create({
        data: { name: "test-player", id: testPlayerId },
      });

      for (let i = 0; i < numGameObjectsForScoring; i++) {
        await prisma.playerScore.create({
          data: {
            gameObjectId: `${testGameObjectId}-${i}`,
            playerId: testPlayerId,
            score: i / numGameObjectsForScoring,
          },
        });
      }

      type Input = inferProcedureInput<AppRouter["games"]["getPlayerScores"]>;
      const input: Input = {
        game_id: testGameId,
        player_id: testPlayerId,
        include_game_objects: "true", // String "true" is intentional; see getPlayerScores for more info
      };

      // Has correct number of player scores
      const result = await caller.games.getPlayerScores(input);
      expect(result.playerScores).length(numGameObjectsForScoring);

      // Is sorted
      const sortedPlayerScores = [...result.playerScores].sort();
      expect(sortedPlayerScores).toEqual(result.playerScores);

      // Includes game objects
      expect(result.playerScores[0]!.gameObject).toBeDefined();

      delete input.include_game_objects;

      // Has correct number of player scores
      const result2 = await caller.games.getPlayerScores(input);
      expect(result2.playerScores).length(numGameObjectsForScoring);

      // Is sorted
      const sortedPlayerScores2 = [...result2.playerScores].sort();
      expect(sortedPlayerScores2).toEqual(result2.playerScores);

      // Does not include game objects
      expect(result2.playerScores[0]!.gameObject).not.toBeDefined();
    });
  });
});

async function createTestGames(count: number) {
  return await prisma.game.createMany({
    data: Array.from({ length: count }, (_, i) => ({
      id: `test-game-id-${i}`,
      name: `test-game-${i}`,
    })),
  });
}

async function getAllGames() {
  return await prisma.game.findMany();
}
