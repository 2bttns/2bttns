// test/sample.test.ts
import { inferProcedureInput } from "@trpc/server";
import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { appRouter, AppRouter } from "../../../../src/server/api/root";
import { createInnerTRPCContext } from "../../../../src/server/api/trpc";
import { prisma } from "../../../../src/server/db";

describe("gameobjects router", () => {
  beforeEach(async () => {
    await clearGameObjects();
  });

  afterEach(async () => {
    await clearGameObjects();
  });

  test("games.create", async () => {
    const ctx = createInnerTRPCContext({ session: null });
    const caller = appRouter.createCaller(ctx);

    type Input = inferProcedureInput<AppRouter["gameObjects"]["create"]>;
    const input: Input = {
      id: "test-gameobject-id",
      name: "test-gameobject",
    };

    const result = await caller.gameObjects.create(input);
    expect(result.createdGameObject.id).toBe(input.id);
    expect(result.createdGameObject.name).toBe(input.name);
    expect(result.createdGameObject.description).toBe(null);
    expect(result.createdGameObject.createdAt).toBeInstanceOf(Date);
    expect(result.createdGameObject.updatedAt).toBeInstanceOf(Date);
  });

  describe("gameobjects.getAll", () => {
    test("default limit 10", async () => {
      const ctx = createInnerTRPCContext({ session: null });
      const caller = appRouter.createCaller(ctx);

      const numberOfGames = 101;
      await createTestGameObjects(numberOfGames);

      type Input = inferProcedureInput<AppRouter["gameObjects"]["getAll"]>;
      const input: Input = {};

      const result = await caller.gameObjects.getAll(input);
      expect(result.gameObjects).length(10);
    });

    test("sort by name", async () => {
      const ctx = createInnerTRPCContext({ session: null });
      const caller = appRouter.createCaller(ctx);

      const numberOfGameObjects = 101;
      await createTestGameObjects(numberOfGameObjects);
      const testGameObjects = await getAllGameObjects();
      const first10Asc = testGameObjects
        .sort((a, b) => a.name.localeCompare(b.name))
        .slice(0, 10);
      const first10Desc = testGameObjects
        .sort((a, b) => b.name.localeCompare(a.name))
        .slice(0, 10);

      type Input = inferProcedureInput<AppRouter["gameObjects"]["getAll"]>;
      const input: Input = { sort: { name: "asc" } };

      const result = await caller.gameObjects.getAll(input);
      expect(result.gameObjects).length(10);
      expect(result.gameObjects).toEqual(first10Asc);

      const input2: Input = { sort: { name: "desc" } };
      const result2 = await caller.gameObjects.getAll(input2);
      expect(result2.gameObjects).length(10);
      expect(result2.gameObjects).toEqual(first10Desc);
    });

    // TODO: test pagination
    // TODO: test filters
    // TODO: test other sorting params
  });
});

async function clearGameObjects() {
  return await prisma.gameObject.deleteMany();
}

async function createTestGameObjects(count: number) {
  return await prisma.gameObject.createMany({
    data: Array.from({ length: count }, (_, i) => ({
      id: `test-gameobject-id-${i}`,
      name: `test-gameobject-${i}`,
    })),
  });
}

async function getAllGameObjects() {
  return await prisma.gameObject.findMany();
}
