import { type inferProcedureInput } from "@trpc/server";
import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { AppRouter, appRouter } from "../../../../src/server/api/root";
import { createInnerTRPCContext } from "../../../../src/server/api/trpc";
import { prisma } from "../../../../src/server/db";
import {
  clearDbsTest,
  createInnerTRPCContextWithPlayerTokenAuthForTest,
  createInnerTRPCContextWithSessionForTest,
  createTestSecret,
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

  test("getSecretMessage with admin session", async () => {
    const ctx = await createInnerTRPCContextWithSessionForTest();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.example.getSecretMessage();
    expect(result).toBeDefined();
  });

  test("getSecretMessage with player token session", async () => {
    const secret = await createTestSecret();
    const player = await prisma.player.create({
      data: { id: "test-player-id", name: "test-player" },
    });
    const ctx = createInnerTRPCContextWithPlayerTokenAuthForTest(
      {
        type: "player_token",
        appId: secret.id,
        userId: player.id,
      },
      secret.secret
    );
    const caller = appRouter.createCaller(ctx);
    const result = await caller.example.getSecretMessage();
    expect(result).toBeDefined();
  });

  test("getSecretMessage should reject invalid player token auth", async () => {
    const ctx = createInnerTRPCContextWithPlayerTokenAuthForTest(
      {
        type: "player_token",
        appId: "invalid-app-id",
        userId: "some-player-id",
      },
      "invalid-secret-value"
    );
    const caller = appRouter.createCaller(ctx);
    expect(() => caller.example.getSecretMessage()).rejects.toThrow();
  });

  test("getSecretMessage without session", async () => {
    const ctx = createInnerTRPCContext({ session: null });
    const caller = appRouter.createCaller(ctx);
    await expect(() => caller.example.getSecretMessage()).rejects.toThrow();
  });
});
