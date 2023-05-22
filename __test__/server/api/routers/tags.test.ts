import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { appRouter } from "../../../../src/server/api/root";
import { prisma } from "../../../../src/server/db";
import {
  clearDbsTest,
  createInnerTRPCContextWithSessionForTest,
} from "./helpers";

describe("tags router", () => {
  beforeEach(async () => {
    await clearDbsTest(prisma);
  });

  afterEach(async () => {
    await clearDbsTest(prisma);
  });

  describe("tags.getAll", () => {
    test("get all", async () => {
      const ctx = createInnerTRPCContextWithSessionForTest();
      const caller = appRouter.createCaller(ctx);

      const numberOfTags = 101;
      await createTags(numberOfTags);

      const result = await caller.tags.getAll();
      expect(result.tags).length(numberOfTags);
      for (const tag of result.tags) {
        expect(tag.id).toBeDefined();
        expect(new Date(tag.createdAt)).toBeInstanceOf(Date);
        expect(new Date(tag.updatedAt)).toBeInstanceOf(Date);
      }
    });

    test("filter by comma-separated list of tags", async () => {
      const ctx = createInnerTRPCContextWithSessionForTest();
      const caller = appRouter.createCaller(ctx);

      const totalNumberOfTags = 101;
      await createTags(totalNumberOfTags);

      const createdTags = await prisma.tag.findMany({ select: { id: true } });
      const numTagsToFilterBy = 10;
      const tagIdsToFilterBy = createdTags
        .map((tag) => tag.id)
        .slice(0, numTagsToFilterBy);
      const commaSeparatedRandomTagIds = tagIdsToFilterBy.join(",");

      const result = await caller.tags.getAll({
        id: commaSeparatedRandomTagIds,
      });
      expect(result.tags).length(numTagsToFilterBy);
      for (const tag of result.tags) {
        expect(tag.id).toBeDefined();
        expect(new Date(tag.createdAt)).toBeInstanceOf(Date);
        expect(new Date(tag.updatedAt)).toBeInstanceOf(Date);
      }
    });
  });
});

async function createTags(count: number) {
  return await prisma.tag.createMany({
    data: Array.from({ length: count }).map((_, i) => ({
      id: `test-tag-id-${i}`,
      name: `test-tag-${i}`,
    })),
  });
}