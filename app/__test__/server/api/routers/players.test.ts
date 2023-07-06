import { inferProcedureInput } from "@trpc/server";
import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { AppRouter, appRouter } from "../../../../src/server/api/root";
import { prisma } from "../../../../src/server/db";
import {
  clearDbsTest,
  createInnerTRPCContextWithSessionForTest,
} from "./helpers";

describe("players router", () => {
  beforeEach(async () => {
    await clearDbsTest(prisma);
  });

  afterEach(async () => {
    await clearDbsTest(prisma);
  });

  test("players.create", async () => {
    const ctx = await createInnerTRPCContextWithSessionForTest();
    const caller = appRouter.createCaller(ctx);

    type Input = inferProcedureInput<AppRouter["players"]["create"]>;
    const input: Input = {
      id: "test-player-id",
      name: "test-player",
    };

    const result = await caller.players.create(input);
    expect(result.createdPlayer.id).toBe(input.id);
    expect(result.createdPlayer.name).toBe(input.name);
    expect(new Date(result.createdPlayer.createdAt)).toBeInstanceOf(Date);
    expect(new Date(result.createdPlayer.updatedAt)).toBeInstanceOf(Date);
  });

  describe("players.count", () => {
    test("gets proper count", async () => {
      const ctx = await createInnerTRPCContextWithSessionForTest();
      const caller = appRouter.createCaller(ctx);

      const numberOfPlayers = 101;
      await createPlayers(numberOfPlayers);

      const result = await caller.players.getCount();
      expect(result.count).toBe(numberOfPlayers);
    });
  });

  describe("players.getAll", () => {
    test("get all", async () => {
      const ctx = await createInnerTRPCContextWithSessionForTest();
      const caller = appRouter.createCaller(ctx);

      const numberOfPlayers = 101;
      await createPlayers(numberOfPlayers);

      const result = await caller.players.getAll();
      expect(result.players).length(numberOfPlayers);
      for (const player of result.players) {
        expect(player.id).toBeDefined();
        expect(new Date(player.createdAt)).toBeInstanceOf(Date);
        expect(new Date(player.updatedAt)).toBeInstanceOf(Date);
      }
    });
  });

  describe("players.getById", () => {
    test("get existing player", async () => {
      const ctx = await createInnerTRPCContextWithSessionForTest();
      const caller = appRouter.createCaller(ctx);

      const initialPlayer = { id: "test-player-id", name: "test-player" };
      await prisma.player.create({
        data: initialPlayer,
      });

      const result = await caller.players.getById({ id: initialPlayer.id });
      expect(result.player.id).toBe(initialPlayer.id);
      expect(result.player.name).toBe(initialPlayer.name);
    });
  });

  describe("players.updateById", () => {
    test("update id", async () => {
      const ctx = await createInnerTRPCContextWithSessionForTest();
      const caller = appRouter.createCaller(ctx);

      const initialPlayer = { id: "test-player-id", name: "test-player" };
      await prisma.player.create({
        data: initialPlayer,
      });

      const updatedId = "test-player-id-updated";

      const result = await caller.players.updateById({
        id: initialPlayer.id,
        data: { id: updatedId },
      });

      expect(result.updatedPlayer.id).toBe(updatedId);
    });
    test("update name", async () => {
      const ctx = await createInnerTRPCContextWithSessionForTest();
      const caller = appRouter.createCaller(ctx);

      const initialPlayer = { id: "test-player-id", name: "test-player" };
      await prisma.player.create({
        data: initialPlayer,
      });

      const updatedName = "test-player-updated";

      const result = await caller.players.updateById({
        id: initialPlayer.id,
        data: { name: updatedName },
      });

      expect(result.updatedPlayer.name).toBe(updatedName);
    });
  });

  describe("players.deleteById", () => {
    test("delete existing player", async () => {
      const ctx = await createInnerTRPCContextWithSessionForTest();
      const caller = appRouter.createCaller(ctx);

      const initialPlayer = { id: "test-player-id", name: "test-player" };
      await prisma.player.create({
        data: initialPlayer,
      });

      const result = await caller.players.deleteById({ id: initialPlayer.id });

      expect(result.deletedPlayer.id).toBe(initialPlayer.id);
      expect(result.deletedPlayer.name).toBe(initialPlayer.name);

      const attemptToGetDeletedPlayer = await prisma.player.findFirst({
        where: {
          id: initialPlayer.id,
        },
      });
      expect(attemptToGetDeletedPlayer).toBeNull();
    });
  });
});

async function createPlayers(count: number) {
  return await prisma.player.createMany({
    data: Array.from({ length: count }).map((_, i) => ({
      id: `test-player-id-${i}`,
      name: `test-player-${i}`,
    })),
  });
}
