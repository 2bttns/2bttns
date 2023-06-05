import { Tag } from "@prisma/client";
import { inferProcedureInput } from "@trpc/server";
import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { AppRouter, appRouter } from "../../../../src/server/api/root";
import { prisma } from "../../../../src/server/db";
import {
  clearDbsTest,
  createInnerTRPCContextWithSessionForTest,
} from "./helpers";

describe("gameobjects router", () => {
  beforeEach(async () => {
    await clearDbsTest(prisma);
  });

  afterEach(async () => {
    await clearDbsTest(prisma);
  });

  test("games.create", async () => {
    const ctx = createInnerTRPCContextWithSessionForTest();
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

  describe("gameobjects.count", () => {
    test("count total game objects", async () => {
      const ctx = createInnerTRPCContextWithSessionForTest();
      const caller = appRouter.createCaller(ctx);

      const numberOfGames = 101;
      await createTestGameObjects({ count: numberOfGames });

      type Input = inferProcedureInput<AppRouter["gameObjects"]["getAll"]>;
      const input: Input = {};

      const result = await caller.gameObjects.getCount(input);
      expect(result.count).equals(numberOfGames);
    });

    test("count filtered by name and id", async () => {
      const ctx = createInnerTRPCContextWithSessionForTest();
      const caller = appRouter.createCaller(ctx);

      await prisma.gameObject.createMany({
        data: [
          { id: "1", name: "lorem" },
          { id: "2", name: "ipsum" },
          { id: "3", name: "ipsum" },
          { id: "4", name: "dolor" },
        ],
      });

      type Input = inferProcedureInput<AppRouter["gameObjects"]["getAll"]>;
      const input: Input = { idFilter: "1" };

      // Filter by id only
      const result = await caller.gameObjects.getCount(input);
      expect(result.count).equals(1);

      // Filter by name only
      const input2: Input = { nameFilter: "ipsum" };
      const result2 = await caller.gameObjects.getCount(input2);
      expect(result2.count).equals(2);

      // Filter by id and name requires either filters to match
      const input4: Input = { idFilter: "1", nameFilter: "dolor" };
      const result4 = await caller.gameObjects.getCount(input4);
      expect(result4.count).equals(2);

      // Supports filtering by multiple ids and names
      const input5: Input = { idFilter: "1,2", nameFilter: "ipsum" };
      const result5 = await caller.gameObjects.getCount(input5);
      expect(result5.count).equals(3);
    });

    test("count filtered by excluded game objects", async () => {
      const ctx = createInnerTRPCContextWithSessionForTest();
      const caller = appRouter.createCaller(ctx);

      await prisma.gameObject.createMany({
        data: [
          { id: "1", name: "lorem" },
          { id: "2", name: "ipsum" },
          { id: "3", name: "ipsum" },
          { id: "4", name: "dolor" },
        ],
      });

      type Input = inferProcedureInput<AppRouter["gameObjects"]["getAll"]>;
      const input: Input = { excludeGameObjects: "1,2" };

      // Filter by id only
      const result = await caller.gameObjects.getCount(input);
      expect(result.count).equals(2);
    });
  });

  describe("gameobjects.getAll", () => {
    test("default limit 10", async () => {
      const ctx = createInnerTRPCContextWithSessionForTest();
      const caller = appRouter.createCaller(ctx);

      const numberOfGames = 101;
      await createTestGameObjects({ count: numberOfGames });

      type Input = inferProcedureInput<AppRouter["gameObjects"]["getAll"]>;
      const input: Input = {};

      // default limit is 10
      const result = await caller.gameObjects.getAll(input);
      expect(result.gameObjects).length(10);

      // can override limit with take
      const result2 = await caller.gameObjects.getAll({ take: numberOfGames });
      expect(result2.gameObjects).length(numberOfGames);
    });

    test("can skip items", async () => {
      const ctx = createInnerTRPCContextWithSessionForTest();
      const caller = appRouter.createCaller(ctx);

      const numberOfGames = 20;
      const skipCount = 10;
      await createTestGameObjects({ count: numberOfGames });

      // default limit is 10
      const result1 = await caller.gameObjects.getAll({ take: numberOfGames });
      expect(result1.gameObjects).length(numberOfGames);

      // can override limit with take
      const result2 = await caller.gameObjects.getAll({
        take: skipCount,
        skip: skipCount,
      });
      expect(result2.gameObjects).length(skipCount);
      result1.gameObjects.slice(skipCount).forEach((g, i) => {
        expect(g.id).toBe(result2.gameObjects[i]!.id);
      });
    });

    test("sort by name", async () => {
      const ctx = createInnerTRPCContextWithSessionForTest();
      const caller = appRouter.createCaller(ctx);

      const numberOfGameObjects = 101;
      await createTestGameObjects({ count: numberOfGameObjects });
      const testGameObjects = await getAllGameObjects();
      const first10Asc = testGameObjects
        .sort((a, b) => a.name.localeCompare(b.name))
        .slice(0, 10);
      const first10Desc = testGameObjects
        .sort((a, b) => b.name.localeCompare(a.name))
        .slice(0, 10);

      type Input = inferProcedureInput<AppRouter["gameObjects"]["getAll"]>;
      const input: Input = { sortField: "name", sortOrder: "asc" };

      const result = await caller.gameObjects.getAll(input);
      expect(result.gameObjects).length(10);
      expect(result.gameObjects.map((g) => g.id)).toEqual(
        first10Asc.map((g) => g.id)
      );

      const input2: Input = { sortField: "name", sortOrder: "desc" };
      const result2 = await caller.gameObjects.getAll(input2);
      expect(result2.gameObjects).length(10);
      expect(result2.gameObjects.map((g) => g.id)).toEqual(
        first10Desc.map((g) => g.id)
      );
    });

    test("filter by name and id", async () => {
      const ctx = createInnerTRPCContextWithSessionForTest();
      const caller = appRouter.createCaller(ctx);

      await prisma.gameObject.createMany({
        data: [
          { id: "1", name: "lorem" },
          { id: "2", name: "ipsum" },
          { id: "3", name: "ipsum" },
          { id: "4", name: "dolor" },
        ],
      });

      type Input = inferProcedureInput<AppRouter["gameObjects"]["getAll"]>;
      const input: Input = { idFilter: "1" };

      // Filter by id only
      const result = await caller.gameObjects.getAll(input);
      expect(result.gameObjects).length(1);
      expect(result.gameObjects[0]!.id).toBe("1");

      // Filter by name only
      const input2: Input = { nameFilter: "ipsum" };
      const result2 = await caller.gameObjects.getAll(input2);
      expect(result2.gameObjects).length(2);
      expect(result2.gameObjects[0]!.id).toBe("2");
      expect(result2.gameObjects[1]!.id).toBe("3");

      // Filter by id and name requires either filters to match
      const input4: Input = { idFilter: "1", nameFilter: "dolor" };
      const result4 = await caller.gameObjects.getAll(input4);
      expect(result4.gameObjects).length(2);
      expect(result4.gameObjects[0]!.id).toBe("1");
      expect(result4.gameObjects[1]!.id).toBe("4");

      // Supports filtering by multiple ids and names
      const input5: Input = { idFilter: "1,2", nameFilter: "ipsum" };
      const result5 = await caller.gameObjects.getAll(input5);
      expect(result5.gameObjects).length(3);
      expect(result5.gameObjects[0]!.id).toBe("1");
      expect(result5.gameObjects[1]!.id).toBe("2");
      expect(result5.gameObjects[2]!.id).toBe("3");
    });

    test("exclude game objects by id", async () => {
      const ctx = createInnerTRPCContextWithSessionForTest();
      const caller = appRouter.createCaller(ctx);

      await prisma.gameObject.createMany({
        data: [
          { id: "1", name: "lorem" },
          { id: "2", name: "ipsum" },
          { id: "3", name: "ipsum" },
          { id: "4", name: "dolor" },
        ],
      });

      type Input = inferProcedureInput<AppRouter["gameObjects"]["getAll"]>;
      const input: Input = { excludeGameObjects: "1,2" };

      // Filter by id only
      const result = await caller.gameObjects.getAll(input);
      expect(result.gameObjects).length(2);
      expect(result.gameObjects[0]!.id).toBe("3");
      expect(result.gameObjects[1]!.id).toBe("4");
    });
  });

  describe("gameobjects.getRanked", async () => {
    test("getRanked", async () => {
      const ctx = createInnerTRPCContextWithSessionForTest();
      const caller = appRouter.createCaller(ctx);

      await prisma.player.create({
        data: { id: "test-player-id", name: "test-player" },
      });

      await prisma.tag.createMany({
        data: [
          { id: "test-input-tag-id", name: "test-input-tag" },
          { id: "test-output-tag-id", name: "test-output-tag" },
        ],
      });

      const count = 10;
      await createTestGameObjects({
        count,
        tags: ["test-input-tag-id", "test-output-tag-id"],
      });
      const testGameObjects = await getAllGameObjects();

      for await (const gameObject of testGameObjects) {
        await caller.gameObjects.upsertPlayerScore({
          gameObjectId: gameObject.id,
          playerId: "test-player-id",
          score: Math.random(),
        });
      }

      const result = await caller.gameObjects.getRanked({
        playerId: "test-player-id",
        inputTags: "test-input-tag-id,test-output-tag-id",
        outputTag: "test-output-tag-id",
      });

      const expectedSortDesc = [...result.scores].sort(
        (a, b) => b.score - a.score
      );

      expect(result.scores).length(count);
      expect(result.scores).toEqual(expectedSortDesc);
      expect(result.scores[0]!.score).toEqual(1);
    });
  });

  describe("gameobjects.delete", () => {
    test("delete many", async () => {
      const ctx = createInnerTRPCContextWithSessionForTest();
      const caller = appRouter.createCaller(ctx);

      const count = 10;
      await createTestGameObjects({
        count,
      });
      const testGameObjects = await getAllGameObjects();

      const numToDelete = 5;
      const idsToDelete = testGameObjects
        .slice(0, numToDelete)
        .map((g) => g.id);

      const result = await caller.gameObjects.delete({
        id: idsToDelete.join(","),
      });

      const remainingGameObjects = await getAllGameObjects();
      expect(result.deletedCount).toBe(numToDelete);
      expect(remainingGameObjects).length(count - numToDelete);
    });
  });
});

async function createTestGameObjects(options: {
  count: number;
  tags?: Tag["id"][];
}) {
  const { count, tags = [] } = options;
  await prisma.gameObject.createMany({
    data: Array.from({ length: count }, (_, i) => ({
      id: `test-gameobject-id-${i}`,
      name: `test-gameobject-${i}`,
    })),
  });

  for await (const gameObject of await getAllGameObjects()) {
    await prisma.gameObject.update({
      data: { tags: { connect: tags.map((tagId) => ({ id: tagId })) } },
      where: { id: gameObject.id },
    });
  }
}

async function getAllGameObjects() {
  return await prisma.gameObject.findMany();
}

async function clearPlayers() {
  return await prisma.player.deleteMany();
}

async function clearTags() {
  return await prisma.tag.deleteMany();
}
