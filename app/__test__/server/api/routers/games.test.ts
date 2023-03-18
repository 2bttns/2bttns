import { defaultMode } from "../../../../src/modes/availableModes";
// test/sample.test.ts
import { Game } from "@prisma/client";
import { inferProcedureInput } from "@trpc/server";
import { describe, expect, test, vi } from "vitest";
import { appRouter, AppRouter } from "../../../../src/server/api/root";
import { createInnerTRPCContext } from "../../../../src/server/api/trpc";
import prismaMock from "../../../__mocks__/prismaMock";

vi.mock("../libs/prisma");

describe("games router", () => {
  test("games.create", async () => {
    const ctx = createInnerTRPCContext({ session: null, prisma: prismaMock });
    const caller = appRouter.createCaller(ctx);

    const mockedTime = new Date();
    vi.setSystemTime(mockedTime);
    const mockedOutput: Game = {
      id: "test-game-id",
      name: "test-game",
      description: "test-description",
      mode: defaultMode,
      createdAt: mockedTime,
      updatedAt: mockedTime,
      defaultNumItemsPerRound: 10,
      modeConfigJson: null,
    };
    prismaMock.game.create.mockResolvedValue(mockedOutput);

    type Input = inferProcedureInput<AppRouter["games"]["create"]>;
    const input: Input = {
      id: mockedOutput.id,
      name: mockedOutput.name,
      description: mockedOutput.description!,
    };

    const result = await caller.games.create(input);
    expect(result.createdGame).toMatchObject(mockedOutput);
  });

  test("games.getAll", async () => {
    const ctx = createInnerTRPCContext({ session: null, prisma: prismaMock });
    const caller = appRouter.createCaller(ctx);

    const mockedTime = new Date();
    vi.setSystemTime(mockedTime);

    const mockedOutput: Game[] = [
      {
        id: "test-game-id",
        name: "test-game",
        description: "test-description",
        mode: defaultMode,
        createdAt: mockedTime,
        updatedAt: mockedTime,
        defaultNumItemsPerRound: 10,
        modeConfigJson: null,
      },
      {
        id: "test-game-id-2",
        name: "test-game-2",
        description: "test-description-2",
        mode: defaultMode,
        createdAt: mockedTime,
        updatedAt: mockedTime,
        defaultNumItemsPerRound: 5,
        modeConfigJson: null,
      },
    ];

    prismaMock.game.findMany.mockResolvedValue(mockedOutput);

    type Input = inferProcedureInput<AppRouter["games"]["getAll"]>;
    const input: Input = {};

    const result = await caller.games.getAll(input);
    expect(result.games).toMatchObject(mockedOutput);
  });
});
