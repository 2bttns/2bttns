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

  test("get admin count", async () => {
    const ctx = await createInnerTRPCContextWithSessionForTest();
    const caller = appRouter.createCaller(ctx);

    const adminCount = await prisma.allowedAdmin.count({});
    const result = await caller.administrators.getCount({});
    expect(result.count).toEqual(adminCount);
  });

  test("get admin count fuzzy search", async () => {
    const ctx = await createInnerTRPCContextWithSessionForTest();
    const caller = appRouter.createCaller(ctx);

    const input: RouterInputs["administrators"]["getCount"] = {};

    //
    // Fuzzy search using part of the test admin's email
    //
    input.allowFuzzyEmailFilter = true;
    input.emailFilter = "test";
    let result = await caller.administrators.getCount(input);
    expect(result.count).toBe(1);

    // Case insensitive
    input.emailFilter = "test".toUpperCase();
    result = await caller.administrators.getCount(input);
    expect(result.count).toBe(1);

    //
    // Exact search using the test admin's email
    //
    input.allowFuzzyEmailFilter = false;
    result = await caller.administrators.getCount(input);
    expect(result.count).toBe(0);

    input.emailFilter = testUserSessionEmail;
    result = await caller.administrators.getCount(input);
    expect(result.count).toBe(1);

    // Case sensitive
    input.emailFilter = testUserSessionEmail.toUpperCase();
    result = await caller.administrators.getCount(input);
    expect(result.count).toBe(0);
  });

  test("get test admin", async () => {
    const ctx = await createInnerTRPCContextWithSessionForTest();
    const caller = appRouter.createCaller(ctx);

    // The only admin should be the test admin created via createInnerTRPCContextWithSessionForTest
    const result = await caller.administrators.getAll({});
    expect(result.administrators).toHaveLength(1);
  });

  test("get test admin fuzzy search", async () => {
    const ctx = await createInnerTRPCContextWithSessionForTest();
    const caller = appRouter.createCaller(ctx);

    const input: RouterInputs["administrators"]["getAll"] = {};

    //
    // Fuzzy search using part of the test admin's email
    //
    input.allowFuzzyEmailFilter = true;
    input.emailFilter = "test";
    let result = await caller.administrators.getAll(input);
    expect(result.administrators).toHaveLength(1);

    // Case insensitive
    input.emailFilter = "test".toUpperCase();
    result = await caller.administrators.getAll(input);
    expect(result.administrators).toHaveLength(1);

    //
    // Exact search using the test admin's email
    //
    input.allowFuzzyEmailFilter = false;
    result = await caller.administrators.getAll(input);
    expect(result.administrators).toHaveLength(0);

    input.emailFilter = testUserSessionEmail;
    result = await caller.administrators.getAll(input);
    expect(result.administrators).toHaveLength(1);

    // Case sensitive
    input.emailFilter = testUserSessionEmail.toUpperCase();
    result = await caller.administrators.getAll(input);
    expect(result.administrators).toHaveLength(0);
  });
});
