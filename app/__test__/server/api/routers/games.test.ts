import { inferProcedureInput } from "@trpc/server";
import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { defaultMode } from "../../../../src/modes/availableModes";
import { AppRouter, appRouter } from "../../../../src/server/api/root";
import { prisma } from "../../../../src/server/db";
import { setPlayerToken } from "../../../../src/utils/api";
import {
  clearDbsTest,
  createInnerTRPCContextWithPlayerTokenAuthForTest,
  createInnerTRPCContextWithSessionForTest,
  createTestGames,
  createTestSecret,
  getAllGames,
} from "./helpers";

describe("games router", () => {
  beforeEach(async () => {
    setPlayerToken(null);
    await clearDbsTest(prisma);
  });

  afterEach(async () => {
    setPlayerToken(null);
    await clearDbsTest(prisma);
  });

  test("games.create", async () => {
    const ctx = await createInnerTRPCContextWithSessionForTest();
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
      const ctx = await createInnerTRPCContextWithSessionForTest();
      const caller = appRouter.createCaller(ctx);

      const numberOfGames = 101;
      await createTestGames(numberOfGames);

      type Input = inferProcedureInput<AppRouter["games"]["getAll"]>;
      const input: Input = {};

      const result = await caller.games.getAll(input);
      expect(result.games).length(10);
    });

    test("sort by name", async () => {
      const ctx = await createInnerTRPCContextWithSessionForTest();
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
      const input: Input = { sortField: "name", sortOrder: "asc" };

      const result = await caller.games.getAll(input);
      expect(result.games).length(10);
      for (let i = 0; i < 10; i++) {
        expect(result.games[i]!.id).toBe(first10Asc[i]!.id);
      }

      const input2: Input = { sortField: "name", sortOrder: "desc" };
      const result2 = await caller.games.getAll(input2);
      expect(result2.games).length(10);
      for (let i = 0; i < 10; i++) {
        expect(result2.games[i]!.id).toBe(first10Desc[i]!.id);
      }
    });
  });

  describe("games.getPlayerScores", () => {
    const numGameObjectsForScoring = 10;
    const numPlayers = 2;
    const testTagId = "test-tag-id";
    const testGameId = "test-game-id";
    const testPlayerId = "test-player-id";
    const testGameObjectId = "test-game-object-id";

    // Creates all necessary data like game objects, tags, games, players, and player scores to be used in this test suite
    const createNecessaryPlayerScoreData = async () => {
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
          mode: defaultMode,
        },
      });

      for (let i = 0; i < numPlayers; i++) {
        const playerId = `${testPlayerId}-${i}`;
        await prisma.player.create({
          data: { name: `test-player-${i}`, id: playerId },
        });

        for (let i = 0; i < numGameObjectsForScoring; i++) {
          await prisma.playerScore.create({
            data: {
              gameObjectId: `${testGameObjectId}-${i}`,
              playerId,
              score: i / numGameObjectsForScoring,
            },
          });
        }
      }
    };

    test("getPlayerScores with gameobjects (admin session)", async () => {
      const ctx = await createInnerTRPCContextWithSessionForTest();
      const caller = appRouter.createCaller(ctx);

      type Input = inferProcedureInput<AppRouter["games"]["getPlayerScores"]>;
      const input: Input = {
        game_id: testGameId,
        player_id: `${testPlayerId}-0`,
        include_game_objects: "true", // String "true" is intentional; see getPlayerScores for more info
      };

      await createNecessaryPlayerScoreData();

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

    test("getPlayerScores without gameobjects (admin session)", async () => {
      const ctx = await createInnerTRPCContextWithSessionForTest();
      const caller = appRouter.createCaller(ctx);

      type Input = inferProcedureInput<AppRouter["games"]["getPlayerScores"]>;
      const input: Input = {
        game_id: testGameId,
        player_id: `${testPlayerId}-0`,
      };

      await createNecessaryPlayerScoreData();

      // Has correct number of player scores
      const result2 = await caller.games.getPlayerScores(input);
      expect(result2.playerScores).length(numGameObjectsForScoring);

      // Is sorted
      const sortedPlayerScores2 = [...result2.playerScores].sort();
      expect(sortedPlayerScores2).toEqual(result2.playerScores);

      // Does not include game objects
      expect(result2.playerScores[0]!.gameObject).not.toBeDefined();
    });

    test("getPlayerScores (player_token auth)", async () => {
      await createNecessaryPlayerScoreData();
      const secret = await createTestSecret();
      const player_id = `${testPlayerId}-0`;

      const ctx = createInnerTRPCContextWithPlayerTokenAuthForTest(
        {
          type: "player_token",
          appId: secret.id,
          userId: player_id,
        },
        secret.secret
      );
      const caller = appRouter.createCaller(ctx);

      type Input = inferProcedureInput<AppRouter["games"]["getPlayerScores"]>;
      const input: Input = {
        game_id: testGameId,
        player_id,
      };

      // Player should receive their own scores
      const result2 = await caller.games.getPlayerScores(input);
      expect(result2.playerScores).toBeDefined();
    });

    test("when using player_token auth, cannot access other players' scores", async () => {
      await createNecessaryPlayerScoreData();
      const secret = await createTestSecret();
      const player_id = `${testPlayerId}-0`;
      const otherPlayerId = `${testPlayerId}-1`;

      const ctx = createInnerTRPCContextWithPlayerTokenAuthForTest(
        {
          type: "player_token",
          appId: secret.id,
          userId: player_id,
        },
        secret.secret
      );
      const caller = appRouter.createCaller(ctx);

      type Input = inferProcedureInput<AppRouter["games"]["getPlayerScores"]>;
      const input: Input = {
        game_id: testGameId,
        player_id: otherPlayerId,
      };

      // Player 0 should not be able to access Player 1's scores
      expect(() => caller.games.getPlayerScores(input)).rejects.toThrow();
    });
  });

  describe("games.delete", () => {
    test("delete many", async () => {
      const ctx = await createInnerTRPCContextWithSessionForTest();
      const caller = appRouter.createCaller(ctx);

      const count = 10;
      await createTestGames(count);
      const testGames = await getAllGames();

      const numToDelete = 5;
      const idsToDelete = testGames.slice(0, numToDelete).map((g) => g.id);

      const result = await caller.games.delete({
        id: idsToDelete.join(","),
      });

      const remainingGames = await getAllGames();
      expect(result.deletedCount).toBe(numToDelete);
      expect(remainingGames).length(count - numToDelete);
    });
  });
});
