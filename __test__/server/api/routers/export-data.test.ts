import { afterAll, beforeAll, describe, expect, test } from "vitest";
import { appRouter } from "../../../../src/server/api/root";
import { prisma } from "../../../../src/server/db";
import {
  clearDbsTest,
  createInnerTRPCContextWithSessionForTest,
  createTestGameObjects,
  createTestGames,
  createTestTags,
  getAllTags,
} from "./helpers";

beforeAll(async () => {
  await clearDbsTest(prisma);

  await createTestGames(3);
  await createTestTags(3);
  const testTags = await getAllTags();
  await createTestGameObjects({
    count: 5,
    tags: [testTags[0]!.id],
    startIndex: 0,
  });
  await createTestGameObjects({
    count: 5,
    tags: [testTags[1]!.id],
    startIndex: 5,
  });
  await createTestGameObjects({
    count: 5,
    tags: [testTags[2]!.id],
    startIndex: 10,
  });
  await createTestGameObjects({
    count: 1,
    tags: [testTags[0]!.id, testTags[1]!.id],
    startIndex: 15,
  });
  await createTestGameObjects({
    count: 4,
    startIndex: 16,
  });
});

afterAll(async () => {
  await clearDbsTest(prisma);
});

describe("exportData router", () => {
  test("export all", async () => {
    const ctx = createInnerTRPCContextWithSessionForTest();
    const caller = appRouter.createCaller(ctx);

    const { count, gameObjects, games, tags } =
      await caller.exportData.exportData({});
    expect(count).toBeDefined();
    expect(gameObjects).toBeDefined();
    expect(games).toBeDefined();
    expect(tags).toBeDefined();
  });

  test("get only games", async () => {
    const ctx = createInnerTRPCContextWithSessionForTest();
    const caller = appRouter.createCaller(ctx);

    const results = await caller.exportData.exportData({
      includeGames: true,
      includeGameObjects: false,
      includeTags: false,
    });
    expect(results.count).toBeDefined();
    expect(results.gameObjects).toBeUndefined();
    expect(results.games).toBeDefined();
    expect(results.tags).toBeUndefined();
  });
  test("get only game-objects", async () => {
    const ctx = createInnerTRPCContextWithSessionForTest();
    const caller = appRouter.createCaller(ctx);

    const results = await caller.exportData.exportData({
      includeGames: false,
      includeGameObjects: true,
      includeTags: false,
    });
    expect(results.count).toBeDefined();
    expect(results.gameObjects).toBeDefined();
    expect(results.games).toBeUndefined();
    expect(results.tags).toBeUndefined();
  });

  test("get only tags", async () => {
    const ctx = createInnerTRPCContextWithSessionForTest();
    const caller = appRouter.createCaller(ctx);

    const results = await caller.exportData.exportData({
      includeGames: false,
      includeGameObjects: false,
      includeTags: true,
    });
    expect(results.count).toBeDefined();
    expect(results.gameObjects).toBeUndefined();
    expect(results.games).toBeUndefined();
    expect(results.tags).toBeDefined();
  });

  test("no tag field for games and game-objects if includeTags=false", async () => {
    const ctx = createInnerTRPCContextWithSessionForTest();
    const caller = appRouter.createCaller(ctx);

    const results = await caller.exportData.exportData({
      includeGames: true,
      includeGameObjects: true,
      includeTags: false,
    });
    expect(results.count).toBeDefined();
    expect(results.gameObjects).toBeDefined();
    expect(results.games).toBeDefined();
    expect(results.tags).toBeUndefined();
    for (const game of results.games!) {
      expect(game.inputTagIds).toBeUndefined();
    }
    for (const gameObject of results.gameObjects!) {
      expect(gameObject.tagIds).toBeUndefined();
    }
  });

  test("tags associated with games and game-objects must be in tag filter list", async () => {
    const ctx = createInnerTRPCContextWithSessionForTest();
    const caller = appRouter.createCaller(ctx);

    const results = await caller.exportData.exportData({
      includeGames: true,
      includeGameObjects: true,
      includeTags: true,
      filterTagIds: "test-tag-id-0,test-tag-id-1",
    });
    expect(results.count).toBeDefined();
    expect(results.gameObjects).toBeDefined();
    expect(results.games).toBeDefined();
    expect(results.tags).toBeDefined();
    for (const game of results.games!) {
      expect(game.inputTagIds).not.toContain("test-tag-id-2");
    }
    for (const gameObject of results.gameObjects!) {
      expect(gameObject.tagIds).not.toContain("test-tag-id-2");
    }
  });

  test("can get all game-objects", async () => {
    const ctx = createInnerTRPCContextWithSessionForTest();
    const caller = appRouter.createCaller(ctx);

    const totalGameObjects = await prisma.gameObject.count();
    const results = await caller.exportData.exportData({});
    expect(results.count?.gameObjects).toBe(totalGameObjects);
  });

  test("can exclude untagged game-objects", async () => {
    const ctx = createInnerTRPCContextWithSessionForTest();
    const caller = appRouter.createCaller(ctx);

    const totalTaggedGameObjects = await prisma.gameObject.count({
      where: {
        tags: {
          some: {},
        },
      },
    });
    const results = await caller.exportData.exportData({
      filterAllowUntaggedGameObjects: false,
    });
    expect(results.count?.gameObjects).toBe(totalTaggedGameObjects);
  });

  test("can get untagged game-objects only", async () => {
    const ctx = createInnerTRPCContextWithSessionForTest();
    const caller = appRouter.createCaller(ctx);

    const totalUntaggedGameObjects = await prisma.gameObject.count({
      where: {
        tags: {
          none: {},
        },
      },
    });
    const results = await caller.exportData.exportData({
      filterAllowUntaggedGameObjects: true,
      filterTagIds: "",
    });
    expect(results.count?.gameObjects).toBe(totalUntaggedGameObjects);
  });
});
