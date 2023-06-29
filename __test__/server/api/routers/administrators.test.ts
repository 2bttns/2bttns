import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { appRouter } from "../../../../src/server/api/root";
import { prisma } from "../../../../src/server/db";
import {
  clearDbsTest,
  createInnerTRPCContextWithSessionForTest,
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
    const result = await caller.administrators.getCount();
    expect(result.count).toEqual(adminCount);
  });

  test("get test admin", async () => {
    const ctx = await createInnerTRPCContextWithSessionForTest();
    const caller = appRouter.createCaller(ctx);

    // The only admin should be the test admin created via createInnerTRPCContextWithSessionForTest
    const result = await caller.administrators.getAll({});
    expect(result.administrators).toHaveLength(1);
  });
});
