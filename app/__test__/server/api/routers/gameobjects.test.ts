// test/sample.test.ts
import { Tag } from "@prisma/client";
import { inferProcedureInput } from "@trpc/server";
import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { AppRouter, appRouter } from "../../../../src/server/api/root";
import { prisma } from "../../../../src/server/db";
import { createInnerTRPCContextWithSessionForTest } from "./helpers";

describe("gameobjects router", () => {
  beforeEach(async () => {
    await clearGameObjects();
    await clearTags();
    await clearPlayers();
  });

  afterEach(async () => {
    await clearGameObjects();
    await clearTags();
    await clearPlayers();
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

  describe("gameobjects.getAll", () => {
    test("default limit 10", async () => {
      const ctx = createInnerTRPCContextWithSessionForTest();
      const caller = appRouter.createCaller(ctx);

      const numberOfGames = 101;
      await createTestGameObjects({ count: numberOfGames });

      type Input = inferProcedureInput<AppRouter["gameObjects"]["getAll"]>;
      const input: Input = {};

      const result = await caller.gameObjects.getAll(input);
      expect(result.gameObjects).length(10);
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
});

async function clearGameObjects() {
  return await prisma.gameObject.deleteMany();
}

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
