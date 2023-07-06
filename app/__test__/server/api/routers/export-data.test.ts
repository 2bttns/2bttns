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
    const ctx = await createInnerTRPCContextWithSessionForTest();
    const caller = appRouter.createCaller(ctx);

    const { count, gameObjects, games, tags } =
      await caller.exportData.exportData({});
    expect(count).toBeDefined();
    expect(gameObjects).toBeDefined();
    expect(games).toBeDefined();
    expect(tags).toBeDefined();
  });

  test("get only games", async () => {
    const ctx = await createInnerTRPCContextWithSessionForTest();
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
    const ctx = await createInnerTRPCContextWithSessionForTest();
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
    const ctx = await createInnerTRPCContextWithSessionForTest();
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
    const ctx = await createInnerTRPCContextWithSessionForTest();
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
    const ctx = await createInnerTRPCContextWithSessionForTest();
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
    const ctx = await createInnerTRPCContextWithSessionForTest();
    const caller = appRouter.createCaller(ctx);

    const totalGameObjects = await prisma.gameObject.count();
    const results = await caller.exportData.exportData({});
    expect(results.count?.gameObjects).toBe(totalGameObjects);
  });

  test("can exclude untagged game-objects", async () => {
    const ctx = await createInnerTRPCContextWithSessionForTest();
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
    const ctx = await createInnerTRPCContextWithSessionForTest();
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

  test("can get games with only tags they use", async () => {
    const ctx = await createInnerTRPCContextWithSessionForTest();
    const caller = appRouter.createCaller(ctx);

    // Update the first `beforeAll` created game to use the first existing tag
    const game = await prisma.game.findFirst({});
    const tag = await prisma.tag.findFirst({});
    await prisma.game.update({
      where: {
        id: game!.id,
      },
      data: {
        inputTags: {
          connect: {
            id: tag!.id,
          },
        },
      },
    });

    // Ensure there are multiple games and tags from the `beforeAll`
    const allGames = await prisma.game.findMany({});
    const allTags = await prisma.tag.findMany({});
    expect(allGames.length).toBeGreaterThan(1);
    expect(allTags.length).toBeGreaterThan(1);

    // Should only get the first game and first tag, because filterGameIds is set to only the first game's ID
    // Since filterTagsMustBeInGames is true, only the associated tag should be returned in the results
    let results = await caller.exportData.exportData({
      filterTagsMustBeInGames: true,
      filterGameIds: game!.id,
    });
    expect(results.count!.games).toBe(1);
    expect(results.count!.tags).toBe(1);

    // Ensure the game objects are filtered by the tag when filterTagsMustBeInGames is true
    // These game objects are the ones that the game ends up using based on the input tag
    const gameObjectsWithFirstTag = await prisma.gameObject.findMany({
      where: {
        tags: {
          some: {
            id: tag!.id,
          },
        },
      },
    });
    expect(results.count!.gameObjects).toBe(gameObjectsWithFirstTag.length);

    // If filterTagsMustBeInGames is false, then all tags should be returned regardless of whether they are associated with the filtered game
    results = await caller.exportData.exportData({
      filterTagsMustBeInGames: false,
      filterGameIds: game!.id,
    });
    expect(results.count!.games).toBe(1);
    expect(results.count!.tags).toBe(allTags.length);
  });

  test("can get game-objects with only tags they use", async () => {
    const ctx = await createInnerTRPCContextWithSessionForTest();
    const caller = appRouter.createCaller(ctx);

    const firstTag = await prisma.tag.findFirst({});
    const gameObjectWithOneTag = await prisma.gameObject.create({
      data: {
        name: "test-game-object",
        tags: {
          connect: {
            id: firstTag!.id,
          },
        },
      },
    });

    // Ensure there are multiple game-objects and tags from the `beforeAll`
    const allGameObjects = await prisma.gameObject.findMany({});
    const allTags = await prisma.tag.findMany({});
    expect(allGameObjects.length).toBeGreaterThan(1);
    expect(allTags.length).toBeGreaterThan(1);

    // Should only get the first game-object and first tag, because filterGameObjectIds is set to only the first game-object's ID
    // Since filterTagsMustBeInGameObjects is true, only the associated tag should be returned in the results
    let results = await caller.exportData.exportData({
      filterTagsMustBeInGameObjects: true,
      filterGameObjectIds: gameObjectWithOneTag!.id,
      includeGames: false,
    });
    expect(results.count!.gameObjects).toBe(1);
    expect(results.count!.tags).toBe(1);
    expect(results.tags![0]!.id).toBe(firstTag!.id);

    // If filterTagsMustBeInGameObjects is false, then all tags should be returned regardless of whether they are associated with the filtered game-object
    results = await caller.exportData.exportData({
      filterTagsMustBeInGameObjects: false,
      includeGames: false,
    });
    expect(results.count!.gameObjects).toBe(allGameObjects.length);
    expect(results.count!.tags).toBe(allTags.length);
  });
});
