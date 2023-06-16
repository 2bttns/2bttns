import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { appRouter } from "../../../../src/server/api/root";
import { prisma } from "../../../../src/server/db";
import {
  clearDbsTest,
  createInnerTRPCContextWithSessionForTest,
  createTestTags,
  getAllTags,
} from "./helpers";

describe("tags router", () => {
  beforeEach(async () => {
    await clearDbsTest(prisma);
  });

  afterEach(async () => {
    await clearDbsTest(prisma);
  });

  describe("tags.create", () => {
    test("create tag using name only", async () => {
      const ctx = createInnerTRPCContextWithSessionForTest();
      const caller = appRouter.createCaller(ctx);

      const tagName = "test-tag-name";
      await caller.tags.create({
        name: tagName,
      });
      const result = await prisma.tag.findFirst({
        where: {
          name: tagName,
        },
      });
      expect(result).not.toBeNull();
      expect(result?.name).toEqual(tagName);
      expect(result?.description).toBeNull();
      expect(result?.id).not.toBeNull();
    });

    test("throw error upon duplicate tag id", async () => {
      const ctx = createInnerTRPCContextWithSessionForTest();
      const caller = appRouter.createCaller(ctx);

      const input = {
        id: "test-tag-id",
        name: "test-tag-name",
      };
      await caller.tags.create(input);
      await expect(() => caller.tags.create(input)).rejects.toThrowError();
    });
  });

  describe("tags.getCount", () => {
    test("get count", async () => {
      const ctx = createInnerTRPCContextWithSessionForTest();
      const caller = appRouter.createCaller(ctx);

      const totalNumberOfTags = 101;
      await createTestTags(totalNumberOfTags);

      const result = await caller.tags.getCount({});
      expect(result.count).toEqual(totalNumberOfTags);
    });

    test("get filtered count", async () => {
      const ctx = createInnerTRPCContextWithSessionForTest();
      const caller = appRouter.createCaller(ctx);

      const totalNumberOfTags = 101;
      await createTestTags(totalNumberOfTags);

      const result = await caller.tags.getCount({ idFilter: "test-tag-id-0" });
      expect(result.count).toEqual(1);
    });
  });

  describe("tags.getAll", () => {
    test("take 10 by default", async () => {
      const ctx = createInnerTRPCContextWithSessionForTest();
      const caller = appRouter.createCaller(ctx);

      const totalNumberOfTags = 101;
      await createTestTags(totalNumberOfTags);

      const result = await caller.tags.getAll({});
      expect(result.tags).length(10);
    });

    test("get all", async () => {
      const ctx = createInnerTRPCContextWithSessionForTest();
      const caller = appRouter.createCaller(ctx);

      const numberOfTags = 101;
      await createTestTags(numberOfTags);

      const result = await caller.tags.getAll({ take: numberOfTags });
      expect(result.tags).length(101);
      for (const tag of result.tags) {
        expect(tag.id).toBeDefined();
        expect(new Date(tag.createdAt)).toBeInstanceOf(Date);
        expect(new Date(tag.updatedAt)).toBeInstanceOf(Date);
      }
    });

    test("filter by tags by ID", async () => {
      const ctx = createInnerTRPCContextWithSessionForTest();
      const caller = appRouter.createCaller(ctx);

      const totalNumberOfTags = 101;
      await createTestTags(totalNumberOfTags);

      const result = await caller.tags.getAll({
        idFilter: "test-tag-id-0",
      });
      expect(result.tags).length(1);
      for (const tag of result.tags) {
        expect(tag.id).toBeDefined();
        expect(new Date(tag.createdAt)).toBeInstanceOf(Date);
        expect(new Date(tag.updatedAt)).toBeInstanceOf(Date);
      }
    });

    test("able to sort by ID", async () => {
      const ctx = createInnerTRPCContextWithSessionForTest();
      const caller = appRouter.createCaller(ctx);

      const totalNumberOfTags = 101;
      await createTestTags(totalNumberOfTags);

      const result = await caller.tags.getAll({
        sortField: "id",
        sortOrder: "asc",
      });

      const expectedSortedResult = [...result.tags].sort((a, b) =>
        a.id.localeCompare(b.id)
      );

      for (let i = 0; i < result.tags.length; i++) {
        expect(result.tags[i]!.id).toEqual(expectedSortedResult[i]!.id);
      }
    });
  });

  describe("tags.delete", () => {
    test("delete many", async () => {
      const ctx = createInnerTRPCContextWithSessionForTest();
      const caller = appRouter.createCaller(ctx);

      const count = 10;
      await createTestTags(count);

      const testTags = await getAllTags();
      const numToDelete = 5;
      const idsToDelete = testTags.slice(0, numToDelete).map((t) => t.id);

      const result = await caller.tags.delete({
        id: idsToDelete.join(","),
      });

      const remainingTags = await getAllTags();
      expect(result.deletedCount).toBe(numToDelete);
      expect(remainingTags).length(count - numToDelete);
    });
  });
});
