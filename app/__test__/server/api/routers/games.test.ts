import { defaultMode } from "../../../../src/modes/availableModes";
// test/sample.test.ts
import { inferProcedureInput } from "@trpc/server";
import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { appRouter, AppRouter } from "../../../../src/server/api/root";
import { createInnerTRPCContext } from "../../../../src/server/api/trpc";
import { prisma } from "../../../../src/server/db";
import { createInnerTRPCContextWithSessionForTest } from "./helpers";

describe("games router", () => {
  beforeEach(async () => {
    await clearGames();
  });

  afterEach(async () => {
    await clearGames();
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
});

async function clearGames() {
  return await prisma.game.deleteMany();
}

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
