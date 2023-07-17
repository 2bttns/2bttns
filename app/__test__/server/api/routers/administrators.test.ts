import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { appRouter } from "../../../../src/server/api/root";
import { prisma } from "../../../../src/server/db";
import { RouterInputs } from "../../../../src/utils/api";
import {
  clearDbsTest,
  createInnerTRPCContextWithSessionForTest,
  testUserSessionEmail,
} from "./helpers";

describe("administrators router", () => {
  beforeEach(async () => {
    await clearDbsTest(prisma);
  });

  afterEach(async () => {
    await clearDbsTest(prisma);
  });

  test("get test admin", async () => {
    const ctx = await createInnerTRPCContextWithSessionForTest();
    const caller = appRouter.createCaller(ctx);

    // The only admin should be the test admin created via createInnerTRPCContextWithSessionForTest
    const getAllResult = await caller.administrators.getAll({});
    const countResult = await caller.administrators.getCount({});
    expect(getAllResult.administrators).toHaveLength(1);
    expect(countResult.count).toBe(1);
  });

  test("get test admin fuzzy search", async () => {
    const ctx = await createInnerTRPCContextWithSessionForTest();
    const caller = appRouter.createCaller(ctx);

    const input: RouterInputs["administrators"]["getAll"] = {};

    //
    // Fuzzy search using part of the test admin's id
    //
    input.allowFuzzyIdFilter = true;
    input.idFilter = "test";
    let getAllResult = await caller.administrators.getAll(input);
    let countResult = await caller.administrators.getCount(input);
    expect(getAllResult.administrators).toHaveLength(1);
    expect(countResult.count).toBe(1);

    // Case insensitive
    input.idFilter = "test".toUpperCase();
    getAllResult = await caller.administrators.getAll(input);
    countResult = await caller.administrators.getCount(input);
    expect(getAllResult.administrators).toHaveLength(1);
    expect(countResult.count).toBe(1);

    //
    // Exact search using the test admin's id
    //
    input.allowFuzzyIdFilter = false;
    getAllResult = await caller.administrators.getAll(input);
    countResult = await caller.administrators.getCount(input);
    expect(getAllResult.administrators).toHaveLength(0);
    expect(countResult.count).toBe(0);

    input.idFilter = testUserSessionEmail;
    getAllResult = await caller.administrators.getAll(input);
    countResult = await caller.administrators.getCount(input);
    expect(getAllResult.administrators).toHaveLength(1);
    expect(countResult.count).toBe(1);

    // Case sensitive
    input.idFilter = testUserSessionEmail.toUpperCase();
    getAllResult = await caller.administrators.getAll(input);
    countResult = await caller.administrators.getCount(input);
    expect(getAllResult.administrators).toHaveLength(0);
    expect(countResult.count).toBe(0);
  });
});
