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
    tags: [testTags[0]!.id, testTags[2]!.id],
    startIndex: 15,
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
});
