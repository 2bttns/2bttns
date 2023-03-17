import { defaultMode } from "./../../../../src/modes/availableModes";
// test/sample.test.ts
import { Game } from "@prisma/client";
import { inferProcedureInput } from "@trpc/server";
import { describe, expect, test, vi } from "vitest";
import { appRouter, AppRouter } from "../../../../src/server/api/root";
import { createInnerTRPCContext } from "../../../../src/server/api/trpc";
import prismaMock from "../../../__mocks__/prismaMock";

vi.mock("../libs/prisma");

describe("games router", () => {
  test("games.create should return the generated Game", async () => {
    const ctx = createInnerTRPCContext({ session: null, prisma: prismaMock });
    const caller = appRouter.createCaller(ctx);

    const mockedTime = new Date();
    vi.setSystemTime(mockedTime);
    const mockGamePrismaOutput: Game = {
      id: "test-game-id",
      name: "test-game",
      description: "test-description",
      mode: defaultMode,
      createdAt: mockedTime,
      updatedAt: mockedTime,
      defaultNumItemsPerRound: 10,
      modeConfigJson: null,
    };
    prismaMock.game.create.mockResolvedValue(mockGamePrismaOutput);

    type Input = inferProcedureInput<AppRouter["games"]["create"]>;
    const input: Input = {
      id: mockGamePrismaOutput.id,
      name: mockGamePrismaOutput.name,
      description: mockGamePrismaOutput.description!,
    };

    const result = await caller.games.create(input);
    expect(result.createdGame).toMatchObject(mockGamePrismaOutput);
  });
});
