import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { appRouter } from "../../../../src/server/api/root";
import { prisma } from "../../../../src/server/db";
import {
  clearAllowedAdmins,
  clearDbsTest,
  createInnerTRPCContextWithSessionForTest,
  createTestSecret,
} from "./helpers";

describe("admin authentication for routes", () => {
  beforeEach(async () => {
    await clearDbsTest(prisma);
  });

  afterEach(async () => {
    await clearDbsTest(prisma);
  });

  test("getSecretMessage fails if the admin session's email isn't in the admin allow list db table", async () => {
    const ctx = await createInnerTRPCContextWithSessionForTest();
    const caller = appRouter.createCaller(ctx);
    const result1 = await caller.example.getSecretMessage();
    expect(result1).toBeDefined();

    await clearAllowedAdmins();
    await expect(() => caller.example.getSecretMessage()).rejects.toThrow();
  });
});
