import { inferProcedureInput } from "@trpc/server";
import _ from "lodash";
import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { AppRouter, appRouter } from "../../../../src/server/api/root";
import { prisma } from "../../../../src/server/db";
import { RouterInputs, RouterOutputs } from "../../../../src/utils/api";
import {
  clearDbsTest,
  createInnerTRPCContextWithSessionForTest,
  createTestGameObjects,
  getAllGameObjects,
} from "./helpers";

describe("gameobjects router", () => {
  beforeEach(async () => {
    await clearDbsTest(prisma);
  });

  afterEach(async () => {
    await clearDbsTest(prisma);
  });

  test("games.create", async () => {
    const ctx = await createInnerTRPCContextWithSessionForTest();
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
      const ctx = await createInnerTRPCContextWithSessionForTest();
      const caller = appRouter.createCaller(ctx);

      const numberOfGames = 101;
      await createTestGameObjects({ count: numberOfGames });

      type Input = inferProcedureInput<AppRouter["gameObjects"]["getAll"]>;
      const input: Input = {};

      const result = await caller.gameObjects.getCount(input);
      expect(result.count).equals(numberOfGames);
    });

    test("count filtered by name and id", async () => {
      const ctx = await createInnerTRPCContextWithSessionForTest();
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
      const ctx = await createInnerTRPCContextWithSessionForTest();
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
      const ctx = await createInnerTRPCContextWithSessionForTest();
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
      const ctx = await createInnerTRPCContextWithSessionForTest();
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
      const ctx = await createInnerTRPCContextWithSessionForTest();
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
      const ctx = await createInnerTRPCContextWithSessionForTest();
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
      const ctx = await createInnerTRPCContextWithSessionForTest();
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

    test("filter gameobjects by tag", async () => {
      const ctx = await createInnerTRPCContextWithSessionForTest();
      const caller = appRouter.createCaller(ctx);

      await prisma.gameObject.createMany({
        data: [
          { id: "1", name: "lorem" },
          { id: "2", name: "ipsum" },
          { id: "3", name: "dolor" },
          { id: "4", name: "sit" },
        ],
      });

      await prisma.tag.create({
        data: {
          id: "A",
          name: "Tag A",
          gameObjects: {
            connect: [{ id: "1" }, { id: "2" }, { id: "3" }],
          },
        },
      });
      await prisma.tag.create({
        data: {
          id: "B",
          name: "Tag B",
          gameObjects: {
            connect: [{ id: "2" }, { id: "3" }],
          },
        },
      });
      await prisma.tag.create({
        data: {
          id: "C",
          name: "Tag C",
          gameObjects: {
            connect: [{ id: "3" }],
          },
        },
      });

      type Input = RouterInputs["gameObjects"]["getAll"];
      let input: Input = {};

      // Get all, including untagged by default
      type Output = RouterOutputs["gameObjects"]["getAll"];
      let result: Output = await caller.gameObjects.getAll(input);
      expect(result.gameObjects).length(4);

      // Get all, excluding untagged objects
      input = { untaggedFilter: "exclude" };
      result = await caller.gameObjects.getAll(input);
      expect(result.gameObjects).length(3);
      expect(result.gameObjects.find((g) => g.id === "4")).toBeUndefined();

      // Get untagged items only
      input = { untaggedFilter: "untagged-only" };
      result = await caller.gameObjects.getAll(input);
      expect(result.gameObjects).length(1);
      expect(result.gameObjects.find((g) => g.id === "4")).toBeDefined();

      // Get untagged items only
      // Should override any tag filters, since only untagged items are requested
      input = { untaggedFilter: "untagged-only", tagFilter: "A" };
      result = await caller.gameObjects.getAll(input);
      expect(result.gameObjects).length(1);
      expect(result.gameObjects.find((g) => g.id === "4")).toBeDefined();

      // Get all items with tag A
      // Untagged items are included by default
      input = { tagFilter: "A" };
      result = await caller.gameObjects.getAll(input);
      expect(result.gameObjects).length(4);

      // Get all items with tag B and C
      // Untagged items are included by default
      input = { tagFilter: "B,C" };
      result = await caller.gameObjects.getAll(input);
      expect(result.gameObjects).length(3);
      expect(result.gameObjects.find((g) => g.id === "4")).toBeDefined();

      // Get items with tag A but not C
      // Untagged items are included by default
      input = { tagFilter: "A", tagExcludeFilter: "C" };
      result = await caller.gameObjects.getAll(input);
      expect(result.gameObjects).length(3);
      expect(result.gameObjects.find((g) => g.id === "4")).toBeDefined();

      // Get items with tag A but not C
      // Exclude untagged items
      input = {
        tagFilter: "A",
        tagExcludeFilter: "C",
        untaggedFilter: "exclude",
      };
      result = await caller.gameObjects.getAll(input);
      expect(result.gameObjects).length(2);
      expect(result.gameObjects.find((g) => g.id === "4")).toBeUndefined();

      // Get specific items with tag C
      // Exclude untagged items
      input = {
        tagFilter: "C",
        untaggedFilter: "exclude",
      };
      result = await caller.gameObjects.getAll(input);
      expect(result.gameObjects).length(1);
      expect(result.gameObjects.find((g) => g.id === "4")).toBeUndefined();
    });
  });

  test("getAll with fuzzy search", async () => {
    const ctx = await createInnerTRPCContextWithSessionForTest();
    const caller = appRouter.createCaller(ctx);

    // Create test game objects
    // Should create 11 game objects with ids of test-gameobject-id-1 to test-gameobject-id-11
    // Their names are "test-gameobject-1" to "test-gameobject-11"
    const count = 11;
    await createTestGameObjects({ count });

    // Test fuzzy search with id
    // Should return 2 results: 1 and 10
    let input: RouterInputs["gameObjects"]["getAll"] = {
      idFilter: "1",
      allowFuzzyIdFilter: true,
    };
    let result = await caller.gameObjects.getAll(input);
    expect(result.gameObjects).toHaveLength(2);
    let idsToCheck = ["test-gameobject-id-1", "test-gameobject-id-10"];
    for (const id of idsToCheck) {
      expect(_.some(result.gameObjects, { id })).toBe(true);
    }

    // Fuzzy id filtering with multiple ids
    // Should return 3 results: 1, 2, 10
    input.idFilter = "1,2";
    result = await caller.gameObjects.getAll(input);
    expect(result.gameObjects).toHaveLength(3);
    idsToCheck = [
      "test-gameobject-id-1",
      "test-gameobject-id-2",
      "test-gameobject-id-10",
    ];
    for (const id of idsToCheck) {
      expect(_.some(result.gameObjects, { id })).toBe(true);
    }

    // Disable fuzzy search
    // Should return nothing, if the id is not an exact match
    input.allowFuzzyIdFilter = false;
    result = await caller.gameObjects.getAll(input);
    expect(result.gameObjects).toHaveLength(0);

    input.idFilter = "test-gameobject-id-1";
    result = await caller.gameObjects.getAll(input);
    expect(result.gameObjects).toHaveLength(1);
    expect(result.gameObjects[0]!.id).toBe("test-gameobject-id-1");

    // The same starting from the first test case, but for name filtering
    input = { nameFilter: "1", allowFuzzyNameFilter: true };
    result = await caller.gameObjects.getAll(input);
    expect(result.gameObjects).toHaveLength(2);
    let namesToCheck = ["test-gameobject-1", "test-gameobject-10"];
    for (const name of namesToCheck) {
      expect(_.some(result.gameObjects, { name })).toBe(true);
    }

    // Fuzzy name filtering with multiple names
    // Should return 3 results: 1, 2, 10
    input.nameFilter = "1,2";
    result = await caller.gameObjects.getAll(input);
    expect(result.gameObjects).toHaveLength(3);
    namesToCheck = [
      "test-gameobject-1",
      "test-gameobject-2",
      "test-gameobject-10",
    ];
    for (const name of namesToCheck) {
      expect(_.some(result.gameObjects, { name })).toBe(true);
    }

    // Disable fuzzy search
    // Should return nothing, if the name is not an exact match
    input.allowFuzzyNameFilter = false;
    result = await caller.gameObjects.getAll(input);
    expect(result.gameObjects).toHaveLength(0);

    input.nameFilter = "test-gameobject-1";
    result = await caller.gameObjects.getAll(input);
    expect(result.gameObjects).toHaveLength(1);
    expect(result.gameObjects[0]!.name).toBe("test-gameobject-1");
  });

  describe("gameobjects.getRanked", async () => {
    test("getRanked", async () => {
      const ctx = await createInnerTRPCContextWithSessionForTest();
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
      const ctx = await createInnerTRPCContextWithSessionForTest();
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
