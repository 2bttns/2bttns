import { type inferProcedureInput } from "@trpc/server";
import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { AppRouter, appRouter } from "../../../../src/server/api/root";
import { createInnerTRPCContext } from "../../../../src/server/api/trpc";
import { prisma } from "../../../../src/server/db";
import {
  clearDbsTest,
  createInnerTRPCContextWithSessionForTest,
} from "./helpers";

describe("example router", () => {
  beforeEach(async () => {
    await clearDbsTest(prisma);
  });

  afterEach(async () => {
    await clearDbsTest(prisma);
  });

  test("greeting", async () => {
    const ctx = createInnerTRPCContext({ session: null });
    const caller = appRouter.createCaller(ctx);

    type Input = inferProcedureInput<AppRouter["example"]["hello"]>;
    const input: Input = {
      text: "test",
    };

    const example = await caller.example.hello(input);
    expect(example).toMatchObject({ greeting: "Hello test" });
  });

  test("getSecretMessage with session", async () => {
    const ctx = createInnerTRPCContextWithSessionForTest();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.example.getSecretMessage();
    expect(result).toBeDefined();
  });

  test("getSecretMessage without session", async () => {
    const ctx = createInnerTRPCContext({ session: null });
    const caller = appRouter.createCaller(ctx);
    await expect(() => caller.example.getSecretMessage()).rejects.toThrow();
  });
});
